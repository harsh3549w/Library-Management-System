import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getUserDonations, clearSuccess, clearError } from '../../store/slices/donationSlice'
import { BookOpen, Calendar, User, AlertCircle, CheckCircle, Clock, X } from 'lucide-react'

const MyDonations = () => {
  const dispatch = useDispatch()
  const { userDonations, loading, error, success, message } = useSelector((state) => state.donations)

  useEffect(() => {
    dispatch(getUserDonations())
  }, [dispatch])

  useEffect(() => {
    if (success && message) {
      setTimeout(() => {
        dispatch(clearSuccess())
      }, 3000)
    }
  }, [success, message, dispatch])

  useEffect(() => {
    if (error) {
      setTimeout(() => {
        dispatch(clearError())
      }, 5000)
    }
  }, [error, dispatch])

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      case 'completed':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-3 w-3 mr-1" />
      case 'approved':
        return <CheckCircle className="h-3 w-3 mr-1" />
      case 'rejected':
        return <X className="h-3 w-3 mr-1" />
      case 'completed':
        return <CheckCircle className="h-3 w-3 mr-1" />
      default:
        return <AlertCircle className="h-3 w-3 mr-1" />
    }
  }

  if (loading && !userDonations) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Book Donations</h1>
          <p className="text-gray-600">Track your book donation requests</p>
        </div>
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

      {/* Donations List */}
      {userDonations && userDonations.length > 0 ? (
        <div className="grid grid-cols-1 gap-6">
          {userDonations.map((donation) => (
            <div key={donation._id} className="card hover:shadow-lg transition-shadow">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                <div className="flex-1">
                  <div className="flex items-start">
                    <BookOpen className="h-6 w-6 text-blue-600 mr-3 mt-1 flex-shrink-0" />
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {donation.title}
                      </h3>
                      <p className="text-gray-700 mb-3">
                        by {donation.author}
                      </p>

                      {/* Metadata */}
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                        {donation.isbn && (
                          <div className="flex items-center">
                            <span className="font-medium">ISBN:</span> {donation.isbn}
                          </div>
                        )}
                        {donation.publicationYear && (
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {donation.publicationYear}
                          </div>
                        )}
                        {donation.genre && (
                          <div className="flex items-center">
                            <span className="font-medium">Genre:</span> {donation.genre}
                          </div>
                        )}
                        <div className="flex items-center">
                          <span className="font-medium">Condition:</span> {donation.condition}
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          Submitted: {formatDate(donation.createdAt)}
                        </div>
                      </div>

                      {/* Description */}
                      {donation.description && (
                        <div className="mb-3">
                          <p className="text-sm text-gray-700">
                            <span className="font-medium">Notes:</span> {donation.description}
                          </p>
                        </div>
                      )}

                      {/* Admin Notes */}
                      {donation.adminNotes && (
                        <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-700">
                            <span className="font-medium">Admin Response:</span> {donation.adminNotes}
                          </p>
                        </div>
                      )}

                      {/* Processed Info */}
                      {donation.processedBy && donation.processedAt && (
                        <div className="text-xs text-gray-500">
                          Processed by {donation.processedBy.name} on {formatDate(donation.processedAt)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="mt-4 md:mt-0 md:ml-6">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(donation.status)}`}>
                    {getStatusIcon(donation.status)}
                    {donation.status.charAt(0).toUpperCase() + donation.status.slice(1)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card text-center py-12">
          <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No donations yet</h3>
          <p className="text-gray-500">
            You haven't submitted any book donation requests yet.
          </p>
        </div>
      )}
    </div>
  )
}

export default MyDonations
