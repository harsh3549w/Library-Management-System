import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

const API_URL = 'http://localhost:4000/api/v1'

// Async thunks
export const getAllTransactions = createAsyncThunk(
  'transaction/getAllTransactions',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (filters.type) params.append('type', filters.type);
      if (filters.status) params.append('status', filters.status);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.userId) params.append('userId', filters.userId);

      const response = await axios.get(`${API_URL}/transaction/all?${params.toString()}`, {
        withCredentials: true,
      })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch transactions')
    }
  }
)

export const getUserTransactions = createAsyncThunk(
  'transaction/getUserTransactions',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/transaction/my-transactions`, {
        withCredentials: true,
      })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch transactions')
    }
  }
)

export const recordTransaction = createAsyncThunk(
  'transaction/recordTransaction',
  async (transactionData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/transaction/record`, transactionData, {
        withCredentials: true,
      })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to record transaction')
    }
  }
)

export const getTransactionStats = createAsyncThunk(
  'transaction/getTransactionStats',
  async (dateRange = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (dateRange.startDate) params.append('startDate', dateRange.startDate);
      if (dateRange.endDate) params.append('endDate', dateRange.endDate);

      const response = await axios.get(`${API_URL}/transaction/stats?${params.toString()}`, {
        withCredentials: true,
      })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch statistics')
    }
  }
)

const initialState = {
  allTransactions: [],
  myTransactions: [],
  stats: null,
  loading: false,
  error: null,
  success: false,
  message: null,
}

const transactionSlice = createSlice({
  name: 'transaction',
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
      // Get All Transactions
      .addCase(getAllTransactions.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getAllTransactions.fulfilled, (state, action) => {
        state.loading = false
        state.allTransactions = action.payload.transactions
      })
      .addCase(getAllTransactions.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Get User Transactions
      .addCase(getUserTransactions.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getUserTransactions.fulfilled, (state, action) => {
        state.loading = false
        state.myTransactions = action.payload.transactions
      })
      .addCase(getUserTransactions.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Record Transaction
      .addCase(recordTransaction.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(recordTransaction.fulfilled, (state, action) => {
        state.loading = false
        state.success = true
        state.message = action.payload.message
        state.allTransactions.unshift(action.payload.transaction)
      })
      .addCase(recordTransaction.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Get Transaction Stats
      .addCase(getTransactionStats.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getTransactionStats.fulfilled, (state, action) => {
        state.loading = false
        state.stats = action.payload.stats
      })
      .addCase(getTransactionStats.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export const { clearError, clearSuccess } = transactionSlice.actions
export default transactionSlice.reducer

