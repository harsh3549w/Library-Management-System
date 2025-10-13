import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  getAllReservations,
  fulfillReservation,
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
  User,
  Mail,
  Filter
} from 'lucide-react'

const AllReservations = () => {
  const [statusFilter, setStatusFilter] = useState('active')
  const dispatch = useDispatch()
  const { allReservations, loading, success, message, error } = useSelector((state) => state.reservation)

  useEffect(() => {
    dispatch(getAllReservations({ status: statusFilter }))
  }, [dispatch, statusFilter])

  useEffect(() => {
    if (success && message) {
      setTimeout(() => {
        dispatch(clearSuccess())
        dispatch(getAllReservations({ status: statusFilter }))
      }, 2000)
    }
  }, [success, message, dispatch, statusFilter])

  useEffect(() => {
    if (error) {
      setTimeout(() => {
        dispatch(clearError())
      }, 5000)
    }
  }, [error, dispatch])

  const handleFulfill = (reservationId) => {
    if (window.confirm('Mark this reservation as fulfilled? The user will be notified.')) {
      dispatch(fulfillReservation(reservationId))
    }
  }

  const handleCancel = (reservationId) => {
    if (window.confirm('Are you sure you want to cancel this reservation?')) {
      dispatch(cancelReservation(reservationId))
    }
  }

  // Check if a reservation is the first (oldest) active one for its book
  const isFirstReservation = (reservation) => {
    if (reservation.status !== 'active') return false
    
    const sameBookReservations = allReservations.filter(
      r => r.book?._id === reservation.book?._id && r.status === 'active'
    )
    
    if (sameBookReservations.length === 0) return true
    
    // Sort by creation date
    const sortedReservations = [...sameBookReservations].sort(
      (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
    )
    
    return sortedReservations[0]._id === reservation._id
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">All Reservations</h1>
        <p className="text-gray-600">Manage book reservations across the library</p>
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

      {/* Filter */}
      <div className="card">
        <div className="flex items-center gap-4">
          <Filter className="h-5 w-5 text-gray-600" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-field flex-1 max-w-xs"
          >
            <option value="all">All Reservations</option>
            <option value="active">Active</option>
            <option value="fulfilled">Fulfilled</option>
            <option value="expired">Expired</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Reservations List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : allReservations.length > 0 ? (
        <div className="space-y-4">
          {allReservations.map((reservation) => (
            <div key={reservation._id} className="card">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
                <div className="flex-1">
                  <div className="flex items-start mb-3">
                    <BookOpen className="h-6 w-6 text-blue-600 mr-3 mt-1 flex-shrink-0" />
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {reservation.book?.title || 'Unknown Book'}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3">
                        by {reservation.book?.author || 'Unknown Author'}
                      </p>
                      
                      {/* User Info */}
                      <div className="bg-gray-50 rounded-lg p-3 mb-3">
                        <div className="flex flex-wrap items-center gap-4 text-sm">
                          <div className="flex items-center text-gray-700">
                            <User className="h-4 w-4 mr-1" />
                            <span className="font-medium">{reservation.user?.name}</span>
                          </div>
                          <div className="flex items-center text-gray-600">
                            <Mail className="h-4 w-4 mr-1" />
                            {reservation.user?.email}
                          </div>
                        </div>
                      </div>

                      {/* Dates */}
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

                      {/* Status Badge */}
                      <div className={`inline-flex items-center px-3 py-1 rounded-full border ${getStatusColor(reservation.status)}`}>
                        {getStatusIcon(reservation.status)}
                        <span className="ml-2 text-sm font-medium">
                          {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
                        </span>
                      </div>

                      {reservation.notified && (
                        <span className="ml-2 text-xs text-green-600">
                          ✓ User notified
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                {reservation.status === 'active' && (
                  <div className="mt-4 lg:mt-0 lg:ml-6 flex flex-col gap-2">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleFulfill(reservation._id)}
                        disabled={!isFirstReservation(reservation)}
                        className={`btn-primary inline-flex items-center ${
                          !isFirstReservation(reservation) ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        title={!isFirstReservation(reservation) ? 'Fulfill previous reservations first' : 'Fulfill this reservation'}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Fulfill
                      </button>
                      <button
                        onClick={() => handleCancel(reservation._id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg inline-flex items-center transition-colors"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Cancel
                      </button>
                    </div>
                    {!isFirstReservation(reservation) && (
                      <p className="text-xs text-yellow-600 font-medium">
                        ⚠️ Fulfill previous reservers first
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card text-center py-12">
          <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No reservations found</h3>
          <p className="text-gray-500">
            {statusFilter === 'active' 
              ? 'No active reservations at the moment.' 
              : 'No reservations match your filter.'}
          </p>
        </div>
      )}
    </div>
  )
}

export default AllReservations

