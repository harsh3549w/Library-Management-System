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
          
          {/* Admin Routes */}
          <Route path="admin" element={<AdminRoute><Layout /></AdminRoute>}>
            <Route path="add-book" element={<AddBook />} />
            <Route path="edit-book/:id" element={<EditBook />} />
            <Route path="all-borrowed-books" element={<AllBorrowedBooks />} />
            <Route path="users" element={<Users />} />
            <Route path="add-admin" element={<AddAdmin />} />
          </Route>
        </Route>

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </div>
  )
}

export default App
