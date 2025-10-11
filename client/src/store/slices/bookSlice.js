import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

const API_URL = 'http://localhost:4000/api/v1'

// Async thunks
export const getAllBooks = createAsyncThunk(
  'books/getAllBooks',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/book/all`, {
        withCredentials: true,
      })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch books')
    }
  }
)

export const addBook = createAsyncThunk(
  'books/addBook',
  async (bookData, { rejectWithValue }) => {
    try {
      const config = {
        withCredentials: true,
      }
      
      // If bookData is FormData (for image uploads), set appropriate header
      if (bookData instanceof FormData) {
        config.headers = {
          'Content-Type': 'multipart/form-data'
        }
      }
      
      const response = await axios.post(`${API_URL}/book/admin/add`, bookData, config)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add book')
    }
  }
)

export const updateBook = createAsyncThunk(
  'books/updateBook',
  async ({ id, bookData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_URL}/book/admin/update/${id}`, bookData, {
        withCredentials: true,
      })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update book')
    }
  }
)

export const deleteBook = createAsyncThunk(
  'books/deleteBook',
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_URL}/book/admin/delete/${id}`, {
        withCredentials: true,
      })
      return id
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete book')
    }
  }
)

const initialState = {
  books: [],
  loading: false,
  error: null,
  success: false,
}

const bookSlice = createSlice({
  name: 'books',
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
      // Get All Books
      .addCase(getAllBooks.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getAllBooks.fulfilled, (state, action) => {
        state.loading = false
        state.books = action.payload.books
      })
      .addCase(getAllBooks.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Add Book
      .addCase(addBook.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(addBook.fulfilled, (state, action) => {
        state.loading = false
        state.books.push(action.payload.book)
        state.success = true
      })
      .addCase(addBook.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Update Book
      .addCase(updateBook.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateBook.fulfilled, (state, action) => {
        state.loading = false
        const index = state.books.findIndex(book => book._id === action.payload.book._id)
        if (index !== -1) {
          state.books[index] = action.payload.book
        }
        state.success = true
      })
      .addCase(updateBook.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Delete Book
      .addCase(deleteBook.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteBook.fulfilled, (state, action) => {
        state.loading = false
        state.books = state.books.filter(book => book._id !== action.payload)
        state.success = true
      })
      .addCase(deleteBook.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export const { clearError, clearSuccess } = bookSlice.actions
export default bookSlice.reducer
