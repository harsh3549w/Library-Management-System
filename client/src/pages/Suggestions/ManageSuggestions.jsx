import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  getAllSuggestions,
  approveSuggestion,
  rejectSuggestion,
  clearSuccess,
  clearError
} from '../../store/slices/suggestionSlice'
import {
  BookOpen,
  User,
  Calendar,
  Tag,
  ThumbsUp,
  Check,
  X,
  DollarSign,
  Package,
  FileText,
  TrendingUp
} from 'lucide-react'

const ManageSuggestions = () => {
  const [selectedSuggestion, setSelectedSuggestion] = useState(null)
  const [showApproveModal, setShowApproveModal] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [approveData, setApproveData] = useState({ price: '', quantity: '', adminNotes: '' })
  const [rejectData, setRejectData] = useState({ adminNotes: '' })

  const dispatch = useDispatch()
  const { suggestions, loading, success, message, error } = useSelector((state) => state.suggestions)

  useEffect(() => {
    dispatch(getAllSuggestions({ status: 'pending', sortBy: 'voteCount' }))
  }, [dispatch])

  useEffect(() => {
    if (success) {
      setShowApproveModal(false)
      setShowRejectModal(false)
      setSelectedSuggestion(null)
      setApproveData({ price: '', quantity: '', adminNotes: '' })
      setRejectData({ adminNotes: '' })
      setTimeout(() => {
        dispatch(clearSuccess())
      }, 3000)
    }
  }, [success, dispatch])

  useEffect(() => {
    if (error) {
      setTimeout(() => {
        dispatch(clearError())
      }, 5000)
    }
  }, [error, dispatch])

  const handleApprove = (suggestion) => {
    setSelectedSuggestion(suggestion)
    setShowApproveModal(true)
  }

  const handleReject = (suggestion) => {
    setSelectedSuggestion(suggestion)
    setShowRejectModal(true)
  }

  const submitApproval = (e) => {
    e.preventDefault()
    dispatch(
      approveSuggestion({
        suggestionId: selectedSuggestion._id,
        price: parseFloat(approveData.price),
        quantity: parseInt(approveData.quantity),
        adminNotes: approveData.adminNotes
      })
    )
  }

  const submitRejection = (e) => {
    e.preventDefault()
    dispatch(
      rejectSuggestion({
        suggestionId: selectedSuggestion._id,
        adminNotes: rejectData.adminNotes
      })
    )
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Manage Book Suggestions</h1>
        <p className="text-gray-600">Review and approve book suggestions from users</p>
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

      {/* Suggestions List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : suggestions.length > 0 ? (
        <div className="space-y-4">
          {suggestions.map((suggestion) => (
            <div key={suggestion._id} className="card">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
                {/* Book Info */}
                <div className="flex-1">
                  <div className="flex items-start">
                    <BookOpen className="h-6 w-6 text-blue-600 mr-3 mt-1 flex-shrink-0" />
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {suggestion.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-1" />
                          {suggestion.author}
                        </div>
                        <div className="flex items-center">
                          <Tag className="h-4 w-4 mr-1" />
                          {suggestion.category}
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {formatDate(suggestion.createdAt)}
                        </div>
                        <div className="flex items-center">
                          <ThumbsUp className="h-4 w-4 mr-1 text-blue-600" />
                          <span className="font-semibold text-blue-600">{suggestion.voteCount} votes</span>
                        </div>
                      </div>
                      <p className="text-gray-700 mb-3">{suggestion.description}</p>
                      {suggestion.isbn && (
                        <p className="text-sm text-gray-500 mb-2">ISBN: {suggestion.isbn}</p>
                      )}
                      <div className="text-sm text-gray-600">
                        Suggested by:{' '}
                        <span className="font-medium text-gray-900">{suggestion.suggestedBy.name}</span>
                        {' '}({suggestion.suggestedBy.email})
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-4 lg:mt-0 lg:ml-6 flex-shrink-0 flex gap-2">
                  <button
                    onClick={() => handleApprove(suggestion)}
                    className="btn-primary inline-flex items-center"
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(suggestion)}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg inline-flex items-center transition-colors"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card text-center py-12">
          <TrendingUp className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No pending suggestions</h3>
          <p className="text-gray-500">All suggestions have been reviewed!</p>
        </div>
      )}

      {/* Approve Modal */}
      {showApproveModal && selectedSuggestion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Approve Suggestion</h2>
            <p className="text-gray-600 mb-4">
              Approving will add <span className="font-semibold">{selectedSuggestion.title}</span> to the library.
            </p>
            <form onSubmit={submitApproval} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price (₹) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={approveData.price}
                  onChange={(e) => setApproveData({ ...approveData, price: e.target.value })}
                  className="input-field"
                  placeholder="Enter book price"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Package className="inline h-4 w-4 mr-1" />
                  Quantity *
                </label>
                <input
                  type="number"
                  value={approveData.quantity}
                  onChange={(e) => setApproveData({ ...approveData, quantity: e.target.value })}
                  className="input-field"
                  placeholder="Enter quantity"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FileText className="inline h-4 w-4 mr-1" />
                  Admin Notes (Optional)
                </label>
                <textarea
                  value={approveData.adminNotes}
                  onChange={(e) => setApproveData({ ...approveData, adminNotes: e.target.value })}
                  className="input-field"
                  rows="3"
                  placeholder="Add any notes..."
                />
              </div>
              <div className="flex gap-2">
                <button type="submit" className="btn-primary flex-1">
                  Approve & Add Book
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowApproveModal(false)
                    setSelectedSuggestion(null)
                    setApproveData({ price: '', quantity: '', adminNotes: '' })
                  }}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedSuggestion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Reject Suggestion</h2>
            <p className="text-gray-600 mb-4">
              Are you sure you want to reject <span className="font-semibold">{selectedSuggestion.title}</span>?
            </p>
            <form onSubmit={submitRejection} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FileText className="inline h-4 w-4 mr-1" />
                  Reason for Rejection *
                </label>
                <textarea
                  value={rejectData.adminNotes}
                  onChange={(e) => setRejectData({ adminNotes: e.target.value })}
                  className="input-field"
                  rows="4"
                  placeholder="Explain why this suggestion is being rejected..."
                  required
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex-1 transition-colors"
                >
                  Reject Suggestion
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowRejectModal(false)
                    setSelectedSuggestion(null)
                    setRejectData({ adminNotes: '' })
                  }}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default ManageSuggestions

