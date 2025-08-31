import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

const API_URL = 'http://localhost:4000/api/v1'

// Async thunks
export const getMyBorrowedBooks = createAsyncThunk(
  'borrow/getMyBorrowedBooks',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/borrow/my-borrowed-books`, {
        withCredentials: true,
      })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch borrowed books')
    }
  }
)

export const getBorrowedBooksForAdmin = createAsyncThunk(
  'borrow/getBorrowedBooksForAdmin',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/borrow/borrowed-books-by-users`, {
        withCredentials: true,
      })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch borrowed books')
    }
  }
)

export const recordBorrowedBook = createAsyncThunk(
  'borrow/recordBorrowedBook',
  async ({ bookId, userId, borrowData }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/borrow/record-borrow-book/${bookId}`, {
        userId,
        ...borrowData
      }, {
        withCredentials: true,
      })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to record borrowed book')
    }
  }
)

export const returnBorrowedBook = createAsyncThunk(
  'borrow/returnBorrowedBook',
  async (bookId, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_URL}/borrow/return-borrowed-book/${bookId}`, {}, {
        withCredentials: true,
      })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to return book')
    }
  }
)

const initialState = {
  myBorrowedBooks: [],
  allBorrowedBooks: [],
  loading: false,
  error: null,
  success: false,
}

const borrowSlice = createSlice({
  name: 'borrow',
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
      // Get My Borrowed Books
      .addCase(getMyBorrowedBooks.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getMyBorrowedBooks.fulfilled, (state, action) => {
        state.loading = false
        state.myBorrowedBooks = action.payload.borrowedBooks
      })
      .addCase(getMyBorrowedBooks.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Get All Borrowed Books (Admin)
      .addCase(getBorrowedBooksForAdmin.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getBorrowedBooksForAdmin.fulfilled, (state, action) => {
        state.loading = false
        state.allBorrowedBooks = action.payload.borrowedBooks
      })
      .addCase(getBorrowedBooksForAdmin.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Record Borrowed Book
      .addCase(recordBorrowedBook.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(recordBorrowedBook.fulfilled, (state, action) => {
        state.loading = false
        state.allBorrowedBooks.push(action.payload.borrowedBook)
        state.success = true
      })
      .addCase(recordBorrowedBook.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Return Borrowed Book
      .addCase(returnBorrowedBook.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(returnBorrowedBook.fulfilled, (state, action) => {
        state.loading = false
        const index = state.allBorrowedBooks.findIndex(book => book._id === action.payload.borrowedBook._id)
        if (index !== -1) {
          state.allBorrowedBooks[index] = action.payload.borrowedBook
        }
        state.success = true
      })
      .addCase(returnBorrowedBook.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export const { clearError, clearSuccess } = borrowSlice.actions
export default borrowSlice.reducer
