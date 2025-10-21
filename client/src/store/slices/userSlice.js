import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1'

// Async thunks
export const getAllUsers = createAsyncThunk(
  'users/getAllUsers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/users/all`, {
        withCredentials: true,
      })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch users')
    }
  }
)

export const registerNewAdmin = createAsyncThunk(
  'users/registerNewAdmin',
  async (adminData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/users/add/new-admin`, adminData, {
        withCredentials: true,
      })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add new admin')
    }
  }
)

export const registerNewUser = createAsyncThunk(
  'users/registerNewUser',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/users/add/new-user`, userData, {
        withCredentials: true,
      })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add new user')
    }
  }
)

const initialState = {
  users: [],
  loading: false,
  error: null,
  success: false,
}

const userSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearSuccess: (state) => {
      state.success = false
    },
  },
  extraReducers: (builder) => {
    builder
      // Get All Users
      .addCase(getAllUsers.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getAllUsers.fulfilled, (state, action) => {
        state.loading = false
        state.users = action.payload.users
      })
      .addCase(getAllUsers.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Register New Admin
      .addCase(registerNewAdmin.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(registerNewAdmin.fulfilled, (state, action) => {
        state.loading = false
        state.users.push(action.payload.user)
        state.success = true
      })
      .addCase(registerNewAdmin.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Register New User
      .addCase(registerNewUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(registerNewUser.fulfilled, (state, action) => {
        state.loading = false
        state.users.push(action.payload.user)
        state.success = true
      })
      .addCase(registerNewUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export const { clearError, clearSuccess } = userSlice.actions
export default userSlice.reducer
