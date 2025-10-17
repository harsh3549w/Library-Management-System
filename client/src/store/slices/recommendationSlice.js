import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

const API_URL = 'http://localhost:4000/api/v1'

// Async thunk for getting book recommendations
export const getBookRecommendations = createAsyncThunk(
  'recommendations/getBookRecommendations',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/recommendations/books`, {
        withCredentials: true,
      })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch recommendations')
    }
  }
)

const initialState = {
  recommendations: [],
  basedOn: null,
  message: '',
  loading: false,
  error: null,
}

const recommendationSlice = createSlice({
  name: 'recommendations',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearRecommendations: (state) => {
      state.recommendations = []
      state.basedOn = null
      state.message = ''
    },
  },
  extraReducers: (builder) => {
    builder
      // Get Book Recommendations
      .addCase(getBookRecommendations.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getBookRecommendations.fulfilled, (state, action) => {
        state.loading = false
        state.recommendations = action.payload.recommendations
        state.basedOn = action.payload.basedOn
        state.message = action.payload.message
      })
      .addCase(getBookRecommendations.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export const { clearError, clearRecommendations } = recommendationSlice.actions
export default recommendationSlice.reducer
