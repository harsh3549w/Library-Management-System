import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1'

// Async thunks
export const uploadArchive = createAsyncThunk(
  'archive/upload',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/archive/upload`, formData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to upload archive')
    }
  }
)

export const getAllArchives = createAsyncThunk(
  'archive/getAll',
  async ({ category = 'all', search = '', sortBy = 'recent' } = {}, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_URL}/archive/all?category=${category}&search=${search}&sortBy=${sortBy}`,
        { withCredentials: true }
      )
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch archives')
    }
  }
)

export const getArchiveById = createAsyncThunk(
  'archive/getById',
  async (archiveId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/archive/${archiveId}`, {
        withCredentials: true
      })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch archive')
    }
  }
)

export const downloadArchive = createAsyncThunk(
  'archive/download',
  async (archiveId, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/archive/download/${archiveId}`, {}, {
        withCredentials: true
      })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to download archive')
    }
  }
)

export const deleteArchive = createAsyncThunk(
  'archive/delete',
  async (archiveId, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`${API_URL}/archive/delete/${archiveId}`, {
        withCredentials: true
      })
      return { ...response.data, archiveId }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete archive')
    }
  }
)

export const searchArchives = createAsyncThunk(
  'archive/search',
  async (query, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/archive/search?query=${query}`, {
        withCredentials: true
      })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to search archives')
    }
  }
)

export const getArchiveStats = createAsyncThunk(
  'archive/stats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/archive/stats/overview`, {
        withCredentials: true
      })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch statistics')
    }
  }
)

const initialState = {
  archives: [],
  currentArchive: null,
  stats: null,
  loading: false,
  error: null,
  success: false,
  message: null
}

const archiveSlice = createSlice({
  name: 'archive',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearSuccess: (state) => {
      state.success = false
      state.message = null
    },
    clearCurrentArchive: (state) => {
      state.currentArchive = null
    }
  },
  extraReducers: (builder) => {
    builder
      // Upload Archive
      .addCase(uploadArchive.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(uploadArchive.fulfilled, (state, action) => {
        state.loading = false
        state.success = true
        state.message = action.payload.message
        state.archives.unshift(action.payload.archive)
      })
      .addCase(uploadArchive.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Get All Archives
      .addCase(getAllArchives.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getAllArchives.fulfilled, (state, action) => {
        state.loading = false
        state.archives = action.payload.archives
      })
      .addCase(getAllArchives.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Get Archive By ID
      .addCase(getArchiveById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getArchiveById.fulfilled, (state, action) => {
        state.loading = false
        state.currentArchive = action.payload.archive
      })
      .addCase(getArchiveById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Download Archive
      .addCase(downloadArchive.pending, (state) => {
        state.error = null
      })
      .addCase(downloadArchive.fulfilled, (state, action) => {
        state.success = true
        state.message = action.payload.message
      })
      .addCase(downloadArchive.rejected, (state, action) => {
        state.error = action.payload
      })
      // Delete Archive
      .addCase(deleteArchive.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteArchive.fulfilled, (state, action) => {
        state.loading = false
        state.success = true
        state.message = action.payload.message
        state.archives = state.archives.filter(a => a._id !== action.payload.archiveId)
      })
      .addCase(deleteArchive.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Search Archives
      .addCase(searchArchives.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(searchArchives.fulfilled, (state, action) => {
        state.loading = false
        state.archives = action.payload.archives
      })
      .addCase(searchArchives.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Get Archive Stats
      .addCase(getArchiveStats.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getArchiveStats.fulfilled, (state, action) => {
        state.loading = false
        state.stats = action.payload.stats
      })
      .addCase(getArchiveStats.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export const { clearError, clearSuccess, clearCurrentArchive } = archiveSlice.actions
export default archiveSlice.reducer

