import axios from 'axios'
import { store } from '../store/store'
import { logout } from '../store/slices/authSlice'

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

// Handle response errors
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and dispatch logout
      localStorage.removeItem('token')
      
      // Dispatch logout action to clear Redux state
      // This will trigger the logout reducer and redirect will be handled by React Router
      store.dispatch(logout())
      
      // Don't use window.location.href here as it causes issues with React Router
      // The ProtectedRoute component will handle the redirect to /login
    }
    return Promise.reject(error)
  }
)

export default axiosInstance


