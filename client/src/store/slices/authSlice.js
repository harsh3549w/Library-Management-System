import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'
import axiosInstance from '../../utils/axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1'

// Async thunks
export const verifyOTP = createAsyncThunk(
  'auth/verifyOTP',
  async (otpData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/auth/verify-otp`, otpData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'OTP verification failed')
    }
  }
)

export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, credentials, {
        withCredentials: true,
      })
      // Store token in localStorage
      if (response.data.token) {
        localStorage.setItem('token', response.data.token)
      }
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Login failed')
    }
  }
)

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await axiosInstance.get('/auth/logout')
      // Clear token from localStorage
      localStorage.removeItem('token')
      return null
    } catch (error) {
      // Clear token even if logout request fails
      localStorage.removeItem('token')
      return rejectWithValue(error.response?.data?.message || 'Logout failed')
    }
  }
)

export const getUser = createAsyncThunk(
  'auth/getUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/auth/me')
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get user')
    }
  }
)

export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (email, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/auth/password/forgot`, { email })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to send reset email')
    }
  }
)

export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async ({ token, password, confirmPassword }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_URL}/auth/password/reset/${token}`, { 
        password, 
        confirmPassword 
      })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to reset password')
    }
  }
)

export const resetPasswordWithOTP = createAsyncThunk(
  'auth/resetPasswordWithOTP',
  async ({ email, otp, password, confirmPassword }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_URL}/auth/password/reset`, { 
        email,
        otp,
        password, 
        confirmPassword 
      })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to reset password')
    }
  }
)

export const updateUserInfo = createAsyncThunk(
  'auth/updateUserInfo',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_URL}/auth/update-info`, userData, {
        withCredentials: true,
      })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update user information')
    }
  }
)

export const verifyOTPAndChangePassword = createAsyncThunk(
  'auth/verifyOTPAndChangePassword',
  async (otpData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/auth/verify-otp-change-password`, otpData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to verify OTP and change password')
    }
  }
)

// Check if there's a token on initial load to set proper loading state
const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: !!token, // Set loading to true if there's a token
  error: null,
  otpSent: false,
  passwordResetSent: false,
  verificationEmail: null,
  requiresPasswordChange: false,
  tempUser: null,
  isLoggingOut: false,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearOTPStatus: (state) => {
      state.otpSent = false
    },
    clearPasswordResetStatus: (state) => {
      state.passwordResetSent = false
    },
    clearPasswordChangeRequirement: (state) => {
      state.requiresPasswordChange = false
      state.tempUser = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Verify OTP
      .addCase(verifyOTP.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(verifyOTP.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user
        state.isAuthenticated = true
        state.otpSent = false
      })
      .addCase(verifyOTP.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false
        state.isLoggingOut = false  // Reset on successful login
        if (action.payload.requiresPasswordChange) {
          state.requiresPasswordChange = true
          state.tempUser = action.payload.user
        } else {
          state.user = action.payload.user
          state.isAuthenticated = true
          state.requiresPasswordChange = false
          state.tempUser = null
        }
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Logout
      .addCase(logout.pending, (state) => {
        state.loading = true
        state.isLoggingOut = true
      })
      .addCase(logout.fulfilled, (state) => {
        state.loading = false
        state.user = null
        state.isAuthenticated = false
        state.isLoggingOut = true  // Keep true to prevent re-auth
      })
      .addCase(logout.rejected, (state, action) => {
        state.loading = false
        state.user = null
        state.isAuthenticated = false
        state.error = action.payload
        state.isLoggingOut = true  // Still logout even if server fails
      })
      // Get User
      .addCase(getUser.pending, (state) => {
        state.loading = true
      })
      .addCase(getUser.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user
        state.isAuthenticated = true
      })
      .addCase(getUser.rejected, (state, action) => {
        state.loading = false
        state.user = null
        state.isAuthenticated = false
        // Don't set error for getUser failures (silent fail for auto-login)
        // The user will just see the login page without a confusing error message
      })
      // Forgot Password
      .addCase(forgotPassword.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.loading = false
        state.passwordResetSent = true
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Reset Password
      .addCase(resetPassword.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.loading = false
        state.passwordResetSent = false
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Reset Password with OTP
      .addCase(resetPasswordWithOTP.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(resetPasswordWithOTP.fulfilled, (state) => {
        state.loading = false
        state.passwordResetSent = false
      })
      .addCase(resetPasswordWithOTP.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Update User Info
      .addCase(updateUserInfo.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateUserInfo.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user
        state.success = true
      })
      .addCase(updateUserInfo.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Verify OTP and Change Password
      .addCase(verifyOTPAndChangePassword.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(verifyOTPAndChangePassword.fulfilled, (state, action) => {
        state.loading = false
        state.success = true
        state.requiresPasswordChange = false
        state.tempUser = null
      })
      .addCase(verifyOTPAndChangePassword.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export const { clearError, clearOTPStatus, clearPasswordResetStatus, clearPasswordChangeRequirement } = authSlice.actions
export default authSlice.reducer
