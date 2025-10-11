import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  getMyReservations,
  cancelReservation,
  clearSuccess,
  clearError
} from '../../store/slices/reservationSlice'
import {
  BookOpen,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  X
} from 'lucide-react'

const MyReservations = () => {
  const dispatch = useDispatch()
  const { myReservations, loading, success, message, error } = useSelector((state) => state.reservations)

  useEffect(() => {
    dispatch(getMyReservations())
  }, [dispatch])

  useEffect(() => {
    if (success && message) {
      setTimeout(() => {
        dispatch(clearSuccess())
        dispatch(getMyReservations())
      }, 2000)
    }
  }, [success, message, dispatch])

  useEffect(() => {
    if (error) {
      setTimeout(() => {
        dispatch(clearError())
      }, 5000)
    }
  }, [error, dispatch])

  const handleCancel = (reservationId) => {
    if (window.confirm('Are you sure you want to cancel this reservation?')) {
      dispatch(cancelReservation(reservationId))
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <Clock className="h-5 w-5 text-blue-600" />
      case 'fulfilled':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'expired':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-red-600" />
      default:
        return <Clock className="h-5 w-5 text-gray-600" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'fulfilled':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'expired':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const activeReservations = myReservations.filter(r => r.status === 'active')
  const pastReservations = myReservations.filter(r => r.status !== 'active')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Reservations</h1>
        <p className="text-gray-600">Manage your book reservations</p>
      </div>

      {/* Success Message */}
      {success && message && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800">{message}</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{myReservations.length}</p>
            </div>
            <BookOpen className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active</p>
              <p className="text-2xl font-bold text-blue-600">{activeReservations.length}</p>
            </div>
            <Clock className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Fulfilled</p>
              <p className="text-2xl font-bold text-green-600">
                {myReservations.filter(r => r.status === 'fulfilled').length}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Expired</p>
              <p className="text-2xl font-bold text-yellow-600">
                {myReservations.filter(r => r.status === 'expired').length}
              </p>
            </div>
            <AlertTriangle className="h-8 w-8 text-yellow-600" />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : myReservations.length > 0 ? (
        <>
          {/* Active Reservations */}
          {activeReservations.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900">Active Reservations</h2>
              {activeReservations.map((reservation) => (
                <div key={reservation._id} className="card">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                    <div className="flex-1">
                      <div className="flex items-start mb-3">
                        <BookOpen className="h-6 w-6 text-blue-600 mr-3 mt-1 flex-shrink-0" />
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {reservation.book?.title || 'Unknown Book'}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2">
                            by {reservation.book?.author || 'Unknown Author'}
                          </p>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              Reserved: {formatDate(reservation.reservationDate)}
                            </div>
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              Expires: {formatDate(reservation.expiryDate)}
                            </div>
                          </div>
                          <div className={`inline-flex items-center px-3 py-1 rounded-full border ${getStatusColor(reservation.status)}`}>
                            {getStatusIcon(reservation.status)}
                            <span className="ml-2 text-sm font-medium">
                              {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 md:mt-0 md:ml-6">
                      <button
                        onClick={() => handleCancel(reservation._id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg inline-flex items-center transition-colors"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Past Reservations */}
          {pastReservations.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900">Past Reservations</h2>
              {pastReservations.map((reservation) => (
                <div key={reservation._id} className="card opacity-75">
                  <div className="flex items-start">
                    <BookOpen className="h-6 w-6 text-gray-600 mr-3 mt-1 flex-shrink-0" />
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {reservation.book?.title || 'Unknown Book'}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        by {reservation.book?.author || 'Unknown Author'}
                      </p>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          Reserved: {formatDate(reservation.reservationDate)}
                        </div>
                      </div>
                      <div className={`inline-flex items-center px-3 py-1 rounded-full border ${getStatusColor(reservation.status)}`}>
                        {getStatusIcon(reservation.status)}
                        <span className="ml-2 text-sm font-medium">
                          {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="card text-center py-12">
          <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No reservations yet</h3>
          <p className="text-gray-500">
            When a book you want is unavailable, you can reserve it and we'll notify you when it's available.
          </p>
        </div>
      )}
    </div>
  )
}

export default MyReservations

