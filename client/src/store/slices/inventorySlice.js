import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axiosInstance from '../../utils/axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1'

export const getIssues = createAsyncThunk('inventory/getIssues', async (params = {}, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.get(`/admin/inventory-issues`, { params })
    return res.data
  } catch (e) {
    return rejectWithValue(e.response?.data?.message || 'Failed to fetch issues')
  }
})

export const markIssue = createAsyncThunk('inventory/markIssue', async ({ bookRef, status, note }, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.post(`/admin/inventory-issues`, { bookRef, status, note })
    return res.data
  } catch (e) {
    return rejectWithValue(e.response?.data?.message || 'Failed to create issue')
  }
})

export const resolveIssue = createAsyncThunk('inventory/resolveIssue', async ({ id }, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.patch(`/admin/inventory-issues/${id}/resolve`, {})
    return res.data
  } catch (e) {
    return rejectWithValue(e.response?.data?.message || 'Failed to resolve issue')
  }
})

const initialState = {
  issues: [],
  loading: false,
  error: null,
  success: false,
  message: null,
}

const slice = createSlice({
  name: 'inventory',
  initialState,
  reducers: {
    clearError: (s) => { s.error = null },
    clearSuccess: (s) => { s.success = false; s.message = null },
  },
  extraReducers: (b) => {
    b
      .addCase(getIssues.pending, (s) => { s.loading = true; s.error = null })
      .addCase(getIssues.fulfilled, (s, a) => { s.loading = false; s.issues = a.payload.issues || [] })
      .addCase(getIssues.rejected, (s, a) => { s.loading = false; s.error = a.payload })

      .addCase(markIssue.pending, (s) => { s.loading = true; s.error = null; s.success = false })
      .addCase(markIssue.fulfilled, (s, a) => { s.loading = false; s.success = true; s.message = a.payload.message; if (a.payload.issue) s.issues.unshift(a.payload.issue) })
      .addCase(markIssue.rejected, (s, a) => { s.loading = false; s.error = a.payload })

      .addCase(resolveIssue.pending, (s) => { s.loading = true; s.error = null })
      .addCase(resolveIssue.fulfilled, (s, a) => { s.loading = false; s.success = true; s.message = a.payload.message; const id = a.meta.arg.id; s.issues = s.issues.map(i => i._id === id ? { ...i, resolved: true, resolvedAt: new Date().toISOString() } : i) })
      .addCase(resolveIssue.rejected, (s, a) => { s.loading = false; s.error = a.payload })
  }
})

export const { clearError, clearSuccess } = slice.actions
export default slice.reducer
