import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

const API_URL = 'http://localhost:4000/api/v1'

// Async thunks
export const createSuggestion = createAsyncThunk(
  'suggestion/create',
  async (suggestionData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/suggestion/create`, suggestionData, {
        withCredentials: true,
      })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create suggestion')
    }
  }
)

export const getAllSuggestions = createAsyncThunk(
  'suggestion/getAll',
  async ({ status = 'all', sortBy = 'voteCount' } = {}, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/suggestion/all?status=${status}&sortBy=${sortBy}`, {
        withCredentials: true,
      })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch suggestions')
    }
  }
)

export const getMySuggestions = createAsyncThunk(
  'suggestion/getMy',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/suggestion/my-suggestions`, {
        withCredentials: true,
      })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch your suggestions')
    }
  }
)

export const voteForSuggestion = createAsyncThunk(
  'suggestion/vote',
  async (suggestionId, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/suggestion/vote/${suggestionId}`, {}, {
        withCredentials: true,
      })
      return { ...response.data, suggestionId }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to vote')
    }
  }
)

export const approveSuggestion = createAsyncThunk(
  'suggestion/approve',
  async ({ suggestionId, price, quantity, adminNotes }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_URL}/suggestion/approve/${suggestionId}`,
        { price, quantity, adminNotes },
        { withCredentials: true }
      )
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to approve suggestion')
    }
  }
)

export const rejectSuggestion = createAsyncThunk(
  'suggestion/reject',
  async ({ suggestionId, adminNotes }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_URL}/suggestion/reject/${suggestionId}`,
        { adminNotes },
        { withCredentials: true }
      )
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to reject suggestion')
    }
  }
)

export const deleteSuggestion = createAsyncThunk(
  'suggestion/delete',
  async (suggestionId, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`${API_URL}/suggestion/delete/${suggestionId}`, {
        withCredentials: true,
      })
      return { ...response.data, suggestionId }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete suggestion')
    }
  }
)

export const getVotingStats = createAsyncThunk(
  'suggestion/stats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/suggestion/stats`, {
        withCredentials: true,
      })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch statistics')
    }
  }
)

const initialState = {
  suggestions: [],
  mySuggestions: [],
  stats: null,
  loading: false,
  error: null,
  success: false,
  message: null
}

const suggestionSlice = createSlice({
  name: 'suggestion',
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
      // Create Suggestion
      .addCase(createSuggestion.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createSuggestion.fulfilled, (state, action) => {
        state.loading = false
        state.success = true
        state.message = action.payload.message
        state.mySuggestions.unshift(action.payload.suggestion)
      })
      .addCase(createSuggestion.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Get All Suggestions
      .addCase(getAllSuggestions.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getAllSuggestions.fulfilled, (state, action) => {
        state.loading = false
        state.suggestions = action.payload.suggestions
      })
      .addCase(getAllSuggestions.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Get My Suggestions
      .addCase(getMySuggestions.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getMySuggestions.fulfilled, (state, action) => {
        state.loading = false
        state.mySuggestions = action.payload.suggestions
      })
      .addCase(getMySuggestions.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Vote for Suggestion
      .addCase(voteForSuggestion.pending, (state) => {
        state.error = null
      })
      .addCase(voteForSuggestion.fulfilled, (state, action) => {
        const { suggestionId, voteCount, hasVoted } = action.payload
        // Update in suggestions array
        const suggestionIndex = state.suggestions.findIndex(s => s._id === suggestionId)
        if (suggestionIndex !== -1) {
          state.suggestions[suggestionIndex].voteCount = voteCount
        }
        state.success = true
        state.message = action.payload.message
      })
      .addCase(voteForSuggestion.rejected, (state, action) => {
        state.error = action.payload
      })
      // Approve Suggestion
      .addCase(approveSuggestion.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(approveSuggestion.fulfilled, (state, action) => {
        state.loading = false
        state.success = true
        state.message = action.payload.message
        // Remove from suggestions list
        state.suggestions = state.suggestions.filter(
          s => s._id !== action.payload.suggestion._id
        )
      })
      .addCase(approveSuggestion.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Reject Suggestion
      .addCase(rejectSuggestion.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(rejectSuggestion.fulfilled, (state, action) => {
        state.loading = false
        state.success = true
        state.message = action.payload.message
        // Remove from suggestions list
        state.suggestions = state.suggestions.filter(
          s => s._id !== action.payload.suggestion._id
        )
      })
      .addCase(rejectSuggestion.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Delete Suggestion
      .addCase(deleteSuggestion.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteSuggestion.fulfilled, (state, action) => {
        state.loading = false
        state.success = true
        state.message = action.payload.message
        state.suggestions = state.suggestions.filter(
          s => s._id !== action.payload.suggestionId
        )
        state.mySuggestions = state.mySuggestions.filter(
          s => s._id !== action.payload.suggestionId
        )
      })
      .addCase(deleteSuggestion.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Get Voting Stats
      .addCase(getVotingStats.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getVotingStats.fulfilled, (state, action) => {
        state.loading = false
        state.stats = action.payload.stats
      })
      .addCase(getVotingStats.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export const { clearError, clearSuccess } = suggestionSlice.actions
export default suggestionSlice.reducer

