import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1'

// Async thunks
export const reserveBook = createAsyncThunk(
  'reservation/reserve',
  async (bookId, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/reservation/reserve/${bookId}`, {}, {
        withCredentials: true,
      })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to reserve book')
    }
  }
)

export const getMyReservations = createAsyncThunk(
  'reservation/getMy',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/reservation/my-reservations`, {
        withCredentials: true,
      })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch reservations')
    }
  }
)

export const getAllReservations = createAsyncThunk(
  'reservation/getAll',
  async ({ status = 'all' } = {}, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/reservation/all?status=${status}`, {
        withCredentials: true,
      })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch all reservations')
    }
  }
)

export const cancelReservation = createAsyncThunk(
  'reservation/cancel',
  async (reservationId, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/reservation/cancel/${reservationId}`, {}, {
        withCredentials: true,
      })
      return { ...response.data, reservationId }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to cancel reservation')
    }
  }
)

export const fulfillReservation = createAsyncThunk(
  'reservation/fulfill',
  async (reservationId, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/reservation/fulfill/${reservationId}`, {}, {
        withCredentials: true,
      })
      return { ...response.data, reservationId }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fulfill reservation')
    }
  }
)

const initialState = {
  myReservations: [],
  allReservations: [],
  loading: false,
  error: null,
  success: false,
  message: null
}

const reservationSlice = createSlice({
  name: 'reservation',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearSuccess: (state) => {
      state.success = false
      state.message = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Reserve Book
      .addCase(reserveBook.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(reserveBook.fulfilled, (state, action) => {
        state.loading = false
        state.success = true
        state.message = action.payload.message
        state.myReservations.unshift(action.payload.reservation)
      })
      .addCase(reserveBook.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Get My Reservations
      .addCase(getMyReservations.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getMyReservations.fulfilled, (state, action) => {
        state.loading = false
        state.myReservations = action.payload.reservations
      })
      .addCase(getMyReservations.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Get All Reservations
      .addCase(getAllReservations.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getAllReservations.fulfilled, (state, action) => {
        state.loading = false
        state.allReservations = action.payload.reservations
      })
      .addCase(getAllReservations.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Cancel Reservation
      .addCase(cancelReservation.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(cancelReservation.fulfilled, (state, action) => {
        state.loading = false
        state.success = true
        state.message = action.payload.message
        // Update in both arrays
        state.myReservations = state.myReservations.map(r =>
          r._id === action.payload.reservationId ? action.payload.reservation : r
        )
        state.allReservations = state.allReservations.map(r =>
          r._id === action.payload.reservationId ? action.payload.reservation : r
        )
      })
      .addCase(cancelReservation.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Fulfill Reservation
      .addCase(fulfillReservation.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fulfillReservation.fulfilled, (state, action) => {
        state.loading = false
        state.success = true
        state.message = action.payload.message
        // Update in allReservations
        state.allReservations = state.allReservations.map(r =>
          r._id === action.payload.reservationId ? action.payload.reservation : r
        )
      })
      .addCase(fulfillReservation.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export const { clearError, clearSuccess } = reservationSlice.actions
export default reservationSlice.reducer

