import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { getUser } from './store/slices/authSlice'
import { clearError as clearAuthError } from './store/slices/authSlice'
import { clearError as clearBookError, clearSuccess as clearBookSuccess } from './store/slices/bookSlice'
import { clearError as clearBorrowError, clearSuccess as clearBorrowSuccess } from './store/slices/borrowSlice'
import { clearError as clearUserError, clearSuccess as clearUserSuccess } from './store/slices/userSlice'

// Components
import Layout from './components/Layout/Layout'
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute'
import AdminRoute from './components/ProtectedRoute/AdminRoute'

// Pages
import Login from './pages/Auth/Login'
import VerifyOTP from './pages/Auth/VerifyOTP'
import ForgotPassword from './pages/Auth/ForgotPassword'
import ResetPassword from './pages/Auth/ResetPassword'
import Dashboard from './pages/Dashboard/Dashboard'
import Books from './pages/Books/Books'
import AddBook from './pages/Books/AddBook'
import EditBook from './pages/Books/EditBook'
import BorrowedBooks from './pages/Borrow/BorrowedBooks'
import AllBorrowedBooks from './pages/Borrow/AllBorrowedBooks'
import Users from './pages/Users/Users'
import AddAdmin from './pages/Users/AddAdmin'
import SuggestBook from './pages/Suggestions/SuggestBook'
import BookSuggestions from './pages/Suggestions/BookSuggestions'
import ManageSuggestions from './pages/Suggestions/ManageSuggestions'
import VotingResults from './pages/Suggestions/VotingResults'
import MyReservations from './pages/Reservations/MyReservations'
import AllReservations from './pages/Reservations/AllReservations'
import Archives from './pages/Archive/Archives'
import UploadArchive from './pages/Archive/UploadArchive'
import ArchiveDetail from './pages/Archive/ArchiveDetail'
import MyFines from './pages/Fines/MyFines'
import ManageFines from './pages/Fines/ManageFines'
import MyTransactions from './pages/Transactions/MyTransactions'
import AllTransactions from './pages/Transactions/AllTransactions'
import Reports from './pages/Reports/Reports'

function App() {
  const dispatch = useDispatch()
  const { isAuthenticated, user, error: authError } = useSelector((state) => state.auth)
  const { error: bookError, success: bookSuccess } = useSelector((state) => state.books)
  const { error: borrowError, success: borrowSuccess } = useSelector((state) => state.borrow)
  const { error: userError, success: userSuccess } = useSelector((state) => state.users)

  useEffect(() => {
    // Check if user is authenticated on app load
    if (!isAuthenticated) {
      dispatch(getUser())
    }
  }, [dispatch, isAuthenticated])

  // Handle auth errors
  useEffect(() => {
    if (authError) {
      toast.error(authError)
      dispatch(clearAuthError())
    }
  }, [authError, dispatch])

  // Handle book errors and success
  useEffect(() => {
    if (bookError) {
      toast.error(bookError)
      dispatch(clearBookError())
    }
    if (bookSuccess) {
      toast.success('Book operation completed successfully!')
      dispatch(clearBookSuccess())
    }
  }, [bookError, bookSuccess, dispatch])

  // Handle borrow errors and success
  useEffect(() => {
    if (borrowError) {
      toast.error(borrowError)
      dispatch(clearBorrowError())
    }
    if (borrowSuccess) {
      toast.success('Borrow operation completed successfully!')
      dispatch(clearBorrowSuccess())
    }
  }, [borrowError, borrowSuccess, dispatch])

  // Handle user errors and success
  useEffect(() => {
    if (userError) {
      toast.error(userError)
      dispatch(clearUserError())
    }
    if (userSuccess) {
      toast.success('User operation completed successfully!')
      dispatch(clearUserSuccess())
    }
  }, [userError, userSuccess, dispatch])

  return (
    <div className="App">
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />} />
        <Route path="/verify-otp" element={!isAuthenticated ? <VerifyOTP /> : <Navigate to="/dashboard" />} />
        <Route path="/forgot-password" element={!isAuthenticated ? <ForgotPassword /> : <Navigate to="/dashboard" />} />
        <Route path="/reset-password/:token" element={!isAuthenticated ? <ResetPassword /> : <Navigate to="/dashboard" />} />

        {/* Protected Routes */}
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/dashboard" />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="books" element={<Books />} />
          <Route path="my-borrowed-books" element={<BorrowedBooks />} />
          <Route path="my-reservations" element={<MyReservations />} />
          <Route path="archives" element={<Archives />} />
          <Route path="archive/:id" element={<ArchiveDetail />} />
          <Route path="book-suggestions" element={<BookSuggestions />} />
          <Route path="suggest-book" element={<SuggestBook />} />
          {/* Removed My Suggestions route to avoid duplication with Book Suggestions */}
          <Route path="my-fines" element={<MyFines />} />
          <Route path="my-transactions" element={<MyTransactions />} />
          
          {/* Admin Routes */}
          <Route path="admin/add-book" element={<AdminRoute><AddBook /></AdminRoute>} />
          <Route path="admin/edit-book/:id" element={<AdminRoute><EditBook /></AdminRoute>} />
          <Route path="admin/upload-archive" element={<AdminRoute><UploadArchive /></AdminRoute>} />
          <Route path="admin/all-borrowed-books" element={<AdminRoute><AllBorrowedBooks /></AdminRoute>} />
          <Route path="admin/all-reservations" element={<AdminRoute><AllReservations /></AdminRoute>} />
          <Route path="admin/manage-fines" element={<AdminRoute><ManageFines /></AdminRoute>} />
          <Route path="admin/all-transactions" element={<AdminRoute><AllTransactions /></AdminRoute>} />
          <Route path="admin/reports" element={<AdminRoute><Reports /></AdminRoute>} />
          <Route path="admin/manage-suggestions" element={<AdminRoute><ManageSuggestions /></AdminRoute>} />
          <Route path="admin/voting-results" element={<AdminRoute><VotingResults /></AdminRoute>} />
          <Route path="admin/users" element={<AdminRoute><Users /></AdminRoute>} />
          <Route path="admin/add-admin" element={<AdminRoute><AddAdmin /></AdminRoute>} />
        </Route>

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </div>
  )
}

export default App
