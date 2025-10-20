import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getAllDonations, getDonationStats, approveDonation, rejectDonation, completeDonation, clearSuccess, clearError } from '../../store/slices/donationSlice'
import { BookOpen, User, Calendar, CheckCircle, X, Clock, AlertCircle, Eye, Check } from 'lucide-react'

const ManageDonations = () => {
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedDonation, setSelectedDonation] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [modalAction, setModalAction] = useState('')
  const [adminNotes, setAdminNotes] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  const dispatch = useDispatch()
  const { allDonations, stats, loading, error, success, message, total, pages } = useSelector((state) => state.donations)

  useEffect(() => {
    dispatch(getAllDonations({ status: statusFilter, page: currentPage }))
    dispatch(getDonationStats())
  }, [dispatch, statusFilter, currentPage])

  useEffect(() => {
    if (success && message) {
      setShowModal(false)
      setSelectedDonation(null)
      setAdminNotes('')
      dispatch(getAllDonations({ status: statusFilter, page: currentPage }))
      dispatch(getDonationStats())
      setTimeout(() => {
        dispatch(clearSuccess())
      }, 3000)
    }
  }, [success, message, dispatch, statusFilter, currentPage])

  useEffect(() => {
    if (error) {
      setTimeout(() => {
        dispatch(clearError())
      }, 5000)
    }
  }, [error, dispatch])

  const formatDate = (dateString) => {
    if (!dateString) return 'No date available'
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

  const handleAction = (donation, action) => {
    setSelectedDonation(donation)
    setModalAction(action)
    setShowModal(true)
  }

  const handleConfirmAction = () => {
    if (!selectedDonation) return

    switch (modalAction) {
      case 'approve':
        dispatch(approveDonation({ id: selectedDonation._id, adminNotes }))
        break
      case 'reject':
        dispatch(rejectDonation({ id: selectedDonation._id, adminNotes }))
        break
      case 'complete':
        dispatch(completeDonation(selectedDonation._id))
        break
      default:
        break
    }
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  if (loading && !allDonations) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Manage Book Donations</h1>
        <p className="text-gray-600">Review and process book donation requests</p>
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

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="card bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600">Pending</p>
                <p className="text-3xl font-bold text-yellow-900 mt-2">{stats.pending}</p>
              </div>
              <div className="p-3 bg-yellow-200 rounded-full">
                <Clock className="h-8 w-8 text-yellow-700" />
              </div>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Approved</p>
                <p className="text-3xl font-bold text-green-900 mt-2">{stats.approved}</p>
              </div>
              <div className="p-3 bg-green-200 rounded-full">
                <CheckCircle className="h-8 w-8 text-green-700" />
              </div>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-red-50 to-red-100 border-red-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">Rejected</p>
                <p className="text-3xl font-bold text-red-900 mt-2">{stats.rejected}</p>
              </div>
              <div className="p-3 bg-red-200 rounded-full">
                <X className="h-8 w-8 text-red-700" />
              </div>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Completed</p>
                <p className="text-3xl font-bold text-blue-900 mt-2">{stats.completed}</p>
              </div>
              <div className="p-3 bg-blue-200 rounded-full">
                <Check className="h-8 w-8 text-blue-700" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <label className="block text-sm font-medium text-gray-700">
              Filter by Status:
            </label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value)
                setCurrentPage(1)
              }}
              className="input-field"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div className="text-sm text-gray-600">
            Showing {allDonations?.length || 0} of {total} donations
          </div>
        </div>
      </div>

      {/* Donations Table */}
      {allDonations && allDonations.length > 0 ? (
        <div className="card">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Donation Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submitted
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {allDonations.map((donation) => (
                  <tr key={donation._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <BookOpen className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {donation.title || 'No title'}
                          </div>
                          <div className="text-sm text-gray-500">
                            by {donation.author || 'Unknown author'}
                          </div>
                          {donation.isbn && (
                            <div className="text-xs text-gray-400">
                              ISBN: {donation.isbn}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <User className="h-4 w-4 text-gray-400 mr-2" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {donation.user?.name || 'Unknown User'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {donation.user?.email || 'No email available'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                        {formatDate(donation.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(donation.status)}`}>
                        {donation.status ? donation.status.charAt(0).toUpperCase() + donation.status.slice(1) : 'Unknown'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        {donation.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleAction(donation, 'approve')}
                              className="text-green-600 hover:text-green-900"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleAction(donation, 'reject')}
                              className="text-red-600 hover:text-red-900"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {donation.status === 'approved' && (
                          <button
                            onClick={() => handleAction(donation, 'complete')}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Mark Complete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === pages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing page <span className="font-medium">{currentPage}</span> of{' '}
                    <span className="font-medium">{pages}</span>
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === pages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="card text-center py-12">
          <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No donations found</h3>
          <p className="text-gray-500">
            {statusFilter === 'all' 
              ? 'No donation requests have been submitted yet.' 
              : `No ${statusFilter} donation requests found.`}
          </p>
        </div>
      )}

      {/* Action Modal */}
      {showModal && selectedDonation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {modalAction === 'approve' && 'Approve Donation'}
                {modalAction === 'reject' && 'Reject Donation'}
                {modalAction === 'complete' && 'Mark as Complete'}
              </h3>
              <button
                onClick={() => {
                  setShowModal(false)
                  setSelectedDonation(null)
                  setAdminNotes('')
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Book:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {selectedDonation.title} by {selectedDonation.author}
                  </span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">User:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {selectedDonation.user.name}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Condition:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {selectedDonation.condition}
                  </span>
                </div>
              </div>

              {(modalAction === 'approve' || modalAction === 'reject') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Admin Notes
                  </label>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    rows="3"
                    className="input-field"
                    placeholder={
                      modalAction === 'approve' 
                        ? 'Optional notes for the user...' 
                        : 'Reason for rejection...'
                    }
                  />
                </div>
              )}

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => {
                    setShowModal(false)
                    setSelectedDonation(null)
                    setAdminNotes('')
                  }}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmAction}
                  disabled={loading}
                  className={`flex-1 ${
                    modalAction === 'approve' 
                      ? 'btn-primary' 
                      : modalAction === 'reject' 
                      ? 'bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors'
                      : 'btn-primary'
                  }`}
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mx-auto"></div>
                  ) : (
                    modalAction === 'approve' ? 'Approve' :
                    modalAction === 'reject' ? 'Reject' : 'Mark Complete'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ManageDonations
