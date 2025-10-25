import React from 'react';
import PropTypes from 'prop-types';

/**
 * OptimizedImage component with automatic WebP support and lazy loading
 * Provides fallback to original format if WebP is not supported
 */
const OptimizedImage = ({ 
  src, 
  alt, 
  className = '', 
  loading = 'lazy',
  decoding = 'async',
  style,
  ...props 
}) => {
  // Generate WebP version path
  const getWebPPath = (originalPath) => {
    if (!originalPath) return '';
    const lastDotIndex = originalPath.lastIndexOf('.');
    if (lastDotIndex === -1) return originalPath;
    return `${originalPath.substring(0, lastDotIndex)}.webp`;
  };

  const webpSrc = getWebPPath(src);

  return (
    <picture>
      {/* Modern format - WebP */}
      <source srcSet={webpSrc} type="image/webp" />
      
      {/* Fallback to original format */}
      <img
        src={src}
        alt={alt}
        className={className}
        loading={loading}
        decoding={decoding}
        style={style}
        {...props}
      />
    </picture>
  );
};

OptimizedImage.propTypes = {
  src: PropTypes.string.isRequired,
  alt: PropTypes.string.isRequired,
  className: PropTypes.string,
  loading: PropTypes.oneOf(['lazy', 'eager']),
  decoding: PropTypes.oneOf(['async', 'sync', 'auto']),
  style: PropTypes.object,
};

export default OptimizedImage;

