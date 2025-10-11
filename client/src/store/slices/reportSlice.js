import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

const API_URL = 'http://localhost:4000/api/v1'

// Async thunks
export const getLibraryStats = createAsyncThunk(
  'report/getLibraryStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/report/library-stats`, {
        withCredentials: true,
      })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch library statistics')
    }
  }
)

export const getBorrowingReport = createAsyncThunk(
  'report/getBorrowingReport',
  async (period = 'monthly', { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/report/borrowing?period=${period}`, {
        withCredentials: true,
      })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch borrowing report')
    }
  }
)

export const getPopularBooksReport = createAsyncThunk(
  'report/getPopularBooksReport',
  async (limit = 10, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/report/popular-books?limit=${limit}`, {
        withCredentials: true,
      })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch popular books')
    }
  }
)

export const getUserActivityReport = createAsyncThunk(
  'report/getUserActivityReport',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/report/user-activity`, {
        withCredentials: true,
      })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch user activity')
    }
  }
)

export const getFinancialReport = createAsyncThunk(
  'report/getFinancialReport',
  async (dateRange = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (dateRange.startDate) params.append('startDate', dateRange.startDate);
      if (dateRange.endDate) params.append('endDate', dateRange.endDate);

      const response = await axios.get(`${API_URL}/report/financial?${params.toString()}`, {
        withCredentials: true,
      })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch financial report')
    }
  }
)

export const getOverdueReport = createAsyncThunk(
  'report/getOverdueReport',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/report/overdue`, {
        withCredentials: true,
      })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch overdue report')
    }
  }
)

export const getCategoryReport = createAsyncThunk(
  'report/getCategoryReport',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/report/category`, {
        withCredentials: true,
      })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch category report')
    }
  }
)

const initialState = {
  libraryStats: null,
  borrowingReport: null,
  popularBooks: null,
  userActivity: null,
  financialReport: null,
  overdueReport: null,
  categoryReport: null,
  loading: false,
  error: null,
}

const reportSlice = createSlice({
  name: 'report',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Library Stats
      .addCase(getLibraryStats.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getLibraryStats.fulfilled, (state, action) => {
        state.loading = false
        state.libraryStats = action.payload.stats
      })
      .addCase(getLibraryStats.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Borrowing Report
      .addCase(getBorrowingReport.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getBorrowingReport.fulfilled, (state, action) => {
        state.loading = false
        state.borrowingReport = action.payload
      })
      .addCase(getBorrowingReport.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Popular Books
      .addCase(getPopularBooksReport.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getPopularBooksReport.fulfilled, (state, action) => {
        state.loading = false
        state.popularBooks = action.payload.popularBooks
      })
      .addCase(getPopularBooksReport.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // User Activity
      .addCase(getUserActivityReport.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getUserActivityReport.fulfilled, (state, action) => {
        state.loading = false
        state.userActivity = action.payload
      })
      .addCase(getUserActivityReport.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Financial Report
      .addCase(getFinancialReport.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getFinancialReport.fulfilled, (state, action) => {
        state.loading = false
        state.financialReport = action.payload
      })
      .addCase(getFinancialReport.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Overdue Report
      .addCase(getOverdueReport.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getOverdueReport.fulfilled, (state, action) => {
        state.loading = false
        state.overdueReport = action.payload
      })
      .addCase(getOverdueReport.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Category Report
      .addCase(getCategoryReport.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getCategoryReport.fulfilled, (state, action) => {
        state.loading = false
        state.categoryReport = action.payload
      })
      .addCase(getCategoryReport.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export const { clearError } = reportSlice.actions
export default reportSlice.reducer

