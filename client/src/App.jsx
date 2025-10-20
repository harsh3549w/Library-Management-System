import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { getUser } from './store/slices/authSlice'
import { clearError as clearAuthError } from './store/slices/authSlice'
import { clearError as clearBookError, clearSuccess as clearBookSuccess } from './store/slices/bookSlice'
import { clearError as clearBorrowError } from './store/slices/borrowSlice'
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
import ResetPasswordOTP from './pages/Auth/ResetPasswordOTP'
import FirstTimeLoginOTP from './pages/Auth/FirstTimeLoginOTP'
import Dashboard from './pages/Dashboard/Dashboard'
import Books from './pages/Books/Books'
import AddBook from './pages/Books/AddBook'
import EditBook from './pages/Books/EditBook'
import BorrowedBooks from './pages/Borrow/BorrowedBooks'
import AllBorrowedBooks from './pages/Borrow/AllBorrowedBooks'
import BookSuggestions from './pages/Suggestions/BookSuggestions'
import ManageSuggestions from './pages/Suggestions/ManageSuggestions'
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
import AddUser from './pages/Users/AddUser'
import EditInfo from './pages/Users/EditInfo'
import Profile from './pages/Profile/Profile'
import DonateBook from './pages/Donations/DonateBook'
import MyDonations from './pages/Donations/MyDonations'
import ManageDonations from './pages/Donations/ManageDonations'
import Contact from './pages/Contact/Contact'

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

  // Handle borrow errors only (success handled by individual components)
  useEffect(() => {
    if (borrowError) {
      toast.error(borrowError)
      dispatch(clearBorrowError())
    }
  }, [borrowError, dispatch])

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
    <div className="App min-h-screen">
      {/* Background with mint green + texture overlay */}
      <div aria-hidden="true" className="fixed inset-0 pointer-events-none">
        <div className="absolute bg-[#e3fff7] inset-0" />
        <div className="absolute max-w-none object-50%-50% object-cover opacity-20 size-full bg-[url('/images/baackground.jpeg')] bg-cover bg-center bg-fixed" />
      </div>
      
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />} />
        <Route path="/verify-otp" element={!isAuthenticated ? <VerifyOTP /> : <Navigate to="/dashboard" />} />
        <Route path="/forgot-password" element={!isAuthenticated ? <ForgotPassword /> : <Navigate to="/dashboard" />} />
        <Route path="/reset-password/:token" element={!isAuthenticated ? <ResetPassword /> : <Navigate to="/dashboard" />} />
        <Route path="/reset-password-otp" element={!isAuthenticated ? <ResetPasswordOTP /> : <Navigate to="/dashboard" />} />
        <Route path="/first-time-login-otp" element={!isAuthenticated ? <FirstTimeLoginOTP /> : <Navigate to="/dashboard" />} />

        {/* Protected Routes */}
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/dashboard" />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="books" element={<Books />} />
          <Route path="my-borrowed-books" element={<BorrowedBooks />} />
          <Route path="my-reservations" element={<MyReservations />} />
          <Route path="archives" element={<Archives />} />
          <Route path="upload-archive" element={<UploadArchive />} />
          <Route path="archive/:id" element={<ArchiveDetail />} />
          <Route path="book-suggestions" element={<BookSuggestions />} />
          <Route path="my-fines" element={<MyFines />} />
          <Route path="my-transactions" element={<MyTransactions />} />
          <Route path="profile" element={<Profile />} />
          <Route path="edit-info" element={<EditInfo />} />
          <Route path="donate-book" element={<DonateBook />} />
          <Route path="my-donations" element={<MyDonations />} />
          <Route path="contact" element={<Contact />} />
          
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
          <Route path="admin/add-user" element={<AdminRoute><AddUser /></AdminRoute>} />
          <Route path="admin/manage-donations" element={<AdminRoute><ManageDonations /></AdminRoute>} />
        </Route>

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </div>
  )
}

export default App
