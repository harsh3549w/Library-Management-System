import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1'

// Create axios instance
const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
})

// Add token to requests
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Store reference for logout dispatch (set by store after initialization)
let dispatchLogout = null

export const setLogoutDispatch = (dispatch) => {
  dispatchLogout = dispatch
}

// Handle response errors
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - token expired or invalid
      const token = localStorage.getItem('token')
      
      // Only clear and redirect if we had a token (prevents multiple logout calls)
      if (token) {
        localStorage.removeItem('token')
        
        // Only dispatch logout if the request was not to /auth/me (auto-login check)
        // This prevents showing "login failed" error when auto-login fails silently
        const isAutoLoginCheck = error.config?.url?.includes('/auth/me')
        
        if (dispatchLogout && !isAutoLoginCheck) {
          dispatchLogout()
        }
      }
    }
    return Promise.reject(error)
  }
)

export default axiosInstance


