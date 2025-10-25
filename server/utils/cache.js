// Simple in-memory cache for frequently accessed data
class Cache {
  constructor() {
    this.cache = new Map();
    this.ttl = new Map(); // Time-to-live for each key
  }

  // Set a value with optional TTL (in seconds)
  set(key, value, ttlSeconds = 300) {
    this.cache.set(key, value);
    const expiresAt = Date.now() + (ttlSeconds * 1000);
    this.ttl.set(key, expiresAt);
  }

  // Get a value, returns null if expired or doesn't exist
  get(key) {
    if (!this.cache.has(key)) {
      return null;
    }

    const expiresAt = this.ttl.get(key);
    if (Date.now() > expiresAt) {
      // Expired, remove from cache
      this.cache.delete(key);
      this.ttl.delete(key);
      return null;
    }

    return this.cache.get(key);
  }

  // Delete a specific key
  delete(key) {
    this.cache.delete(key);
    this.ttl.delete(key);
  }

  // Clear all cache
  clear() {
    this.cache.clear();
    this.ttl.clear();
  }

  // Clean up expired entries
  cleanup() {
    const now = Date.now();
    for (const [key, expiresAt] of this.ttl.entries()) {
      if (now > expiresAt) {
        this.cache.delete(key);
        this.ttl.delete(key);
      }
    }
  }

  // Get cache statistics
  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// Create singleton instance
export const cache = new Cache();

// Run cleanup every 5 minutes
setInterval(() => {
  cache.cleanup();
}, 5 * 60 * 1000);

// Middleware to cache responses
export const cacheMiddleware = (ttlSeconds = 300) => {
  return (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    const key = `${req.originalUrl || req.url}`;
    const cachedResponse = cache.get(key);

    if (cachedResponse) {
      // Cache hit
      return res.status(200).json({
        ...cachedResponse,
        _cached: true,
        _cachedAt: new Date().toISOString()
      });
    }

    // Cache miss - intercept res.json to cache the response
    const originalJson = res.json.bind(res);
    res.json = function(data) {
      if (res.statusCode === 200 && data.success) {
        cache.set(key, data, ttlSeconds);
      }
      return originalJson(data);
    };

    next();
  };
};

// Helper to invalidate cache patterns
export const invalidateCache = (pattern) => {
  const stats = cache.getStats();
  stats.keys.forEach(key => {
    if (key.includes(pattern)) {
      cache.delete(key);
    }
  });
};

