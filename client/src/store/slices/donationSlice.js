import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1'

// Async thunks
export const createDonationRequest = createAsyncThunk(
  'donation/create',
  async (donationData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/donation/request`, donationData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create donation request')
    }
  }
)

export const getUserDonations = createAsyncThunk(
  'donation/getUserDonations',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/donation/my-donations`, {
        withCredentials: true
      })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch donations')
    }
  }
)

export const getAllDonations = createAsyncThunk(
  'donation/getAllDonations',
  async ({ status = 'all', page = 1, limit = 10 } = {}, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_URL}/donation/all?status=${status}&page=${page}&limit=${limit}`,
        { withCredentials: true }
      )
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch donations')
    }
  }
)

export const getDonationStats = createAsyncThunk(
  'donation/getStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/donation/stats`, {
        withCredentials: true
      })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch donation stats')
    }
  }
)

export const approveDonation = createAsyncThunk(
  'donation/approve',
  async ({ id, adminNotes }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_URL}/donation/approve/${id}`, { adminNotes }, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to approve donation')
    }
  }
)

export const rejectDonation = createAsyncThunk(
  'donation/reject',
  async ({ id, adminNotes }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_URL}/donation/reject/${id}`, { adminNotes }, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to reject donation')
    }
  }
)

export const completeDonation = createAsyncThunk(
  'donation/complete',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_URL}/donation/complete/${id}`, {}, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to complete donation')
    }
  }
)

const initialState = {
  userDonations: [],
  allDonations: [],
  stats: null,
  loading: false,
  error: null,
  success: false,
  message: null,
  total: 0,
  pages: 0,
  currentPage: 1
}

const donationSlice = createSlice({
  name: 'donation',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearSuccess: (state) => {
      state.success = false
      state.message = null
    }
  },
  extraReducers: (builder) => {
    builder
      // Create Donation Request
      .addCase(createDonationRequest.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createDonationRequest.fulfilled, (state, action) => {
        state.loading = false
        state.success = true
        state.message = action.payload.message
        state.userDonations.unshift(action.payload.donationRequest)
      })
      .addCase(createDonationRequest.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Get User Donations
      .addCase(getUserDonations.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getUserDonations.fulfilled, (state, action) => {
        state.loading = false
        state.userDonations = action.payload.donations
      })
      .addCase(getUserDonations.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Get All Donations (Admin)
      .addCase(getAllDonations.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getAllDonations.fulfilled, (state, action) => {
        state.loading = false
        state.allDonations = action.payload.donations
        state.total = action.payload.total
        state.pages = action.payload.pages
        state.currentPage = action.payload.currentPage
      })
      .addCase(getAllDonations.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Get Donation Stats
      .addCase(getDonationStats.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getDonationStats.fulfilled, (state, action) => {
        state.loading = false
        state.stats = action.payload.stats
      })
      .addCase(getDonationStats.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Approve Donation
      .addCase(approveDonation.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(approveDonation.fulfilled, (state, action) => {
        state.loading = false
        state.success = true
        state.message = action.payload.message
        // Update donation in the list
        const index = state.allDonations.findIndex(d => d._id === action.payload.donation._id)
        if (index !== -1) {
          state.allDonations[index] = action.payload.donation
        }
      })
      .addCase(approveDonation.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Reject Donation
      .addCase(rejectDonation.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(rejectDonation.fulfilled, (state, action) => {
        state.loading = false
        state.success = true
        state.message = action.payload.message
        // Update donation in the list
        const index = state.allDonations.findIndex(d => d._id === action.payload.donation._id)
        if (index !== -1) {
          state.allDonations[index] = action.payload.donation
        }
      })
      .addCase(rejectDonation.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Complete Donation
      .addCase(completeDonation.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(completeDonation.fulfilled, (state, action) => {
        state.loading = false
        state.success = true
        state.message = action.payload.message
        // Update donation in the list
        const index = state.allDonations.findIndex(d => d._id === action.payload.donation._id)
        if (index !== -1) {
          state.allDonations[index] = action.payload.donation
        }
      })
      .addCase(completeDonation.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  }
})

export const { clearError, clearSuccess } = donationSlice.actions
export default donationSlice.reducer
