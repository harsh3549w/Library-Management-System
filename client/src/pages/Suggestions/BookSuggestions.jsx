import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import {
  getAllSuggestions,
  voteForSuggestion,
  clearSuccess,
  clearError
} from '../../store/slices/suggestionSlice'
import {
  ThumbsUp,
  Plus,
  BookOpen,
  User,
  Calendar,
  Tag,
  TrendingUp,
  Filter
} from 'lucide-react'

const BookSuggestions = () => {
  const [statusFilter, setStatusFilter] = useState('pending')
  const [sortBy, setSortBy] = useState('voteCount')

  const dispatch = useDispatch()
  const { suggestions, loading, success, message, error } = useSelector((state) => state.suggestions)
  const { user } = useSelector((state) => state.auth)

  useEffect(() => {
    dispatch(getAllSuggestions({ status: statusFilter, sortBy }))
  }, [dispatch, statusFilter, sortBy])

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

  const handleVote = (suggestionId) => {
    dispatch(voteForSuggestion(suggestionId))
      .then(() => {
        // Refresh suggestions after voting
        dispatch(getAllSuggestions({ status: statusFilter, sortBy }))
      })
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const hasUserVoted = (suggestion) => {
    return suggestion.votes?.includes(user?._id)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Book Suggestions</h1>
          <p className="text-gray-600">Vote for books you'd like to see in our library</p>
        </div>
        <Link to="/suggest-book" className="btn-primary inline-flex items-center mt-4 sm:mt-0">
          <Plus className="h-4 w-4 mr-2" />
          Suggest a Book
        </Link>
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

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Filter className="inline h-4 w-4 mr-1" />
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-field"
            >
              <option value="all">All Suggestions</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <TrendingUp className="inline h-4 w-4 mr-1" />
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="input-field"
            >
              <option value="voteCount">Most Voted</option>
              <option value="recent">Most Recent</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>
      </div>

      {/* Suggestions List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : suggestions.length > 0 ? (
        <div className="grid grid-cols-1 gap-6">
          {suggestions.map((suggestion) => (
            <div key={suggestion._id} className="card hover:shadow-lg transition-shadow">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between">
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
                      </div>
                      <p className="text-gray-700 mb-3">{suggestion.description}</p>
                      <div className="text-sm text-gray-500">
                        Suggested by: <span className="font-medium">{suggestion.suggestedBy.name}</span>
                      </div>
                      
                      {/* Status Badge */}
                      <div className="mt-3">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            suggestion.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : suggestion.status === 'approved'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {suggestion.status.charAt(0).toUpperCase() + suggestion.status.slice(1)}
                        </span>
                      </div>

                      {/* Admin Notes */}
                      {suggestion.adminNotes && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-700">
                            <span className="font-medium">Admin Note:</span> {suggestion.adminNotes}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Vote Section */}
                {suggestion.status === 'pending' && (
                  <div className="mt-4 md:mt-0 md:ml-6 flex-shrink-0">
                    <button
                      onClick={() => handleVote(suggestion._id)}
                      className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all ${
                        hasUserVoted(suggestion)
                          ? 'bg-blue-50 border-blue-500 text-blue-600'
                          : 'bg-white border-gray-300 text-gray-600 hover:border-blue-500 hover:text-blue-600'
                      }`}
                    >
                      <ThumbsUp
                        className={`h-6 w-6 mb-2 ${
                          hasUserVoted(suggestion) ? 'fill-current' : ''
                        }`}
                      />
                      <span className="text-2xl font-bold">{suggestion.voteCount}</span>
                      <span className="text-xs">
                        {suggestion.voteCount === 1 ? 'Vote' : 'Votes'}
                      </span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card text-center py-12">
          <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No suggestions found</h3>
          <p className="text-gray-500 mb-4">
            {statusFilter === 'pending'
              ? 'Be the first to suggest a book!'
              : 'No suggestions match your filter.'}
          </p>
          <Link to="/suggest-book" className="btn-primary inline-flex items-center">
            <Plus className="h-4 w-4 mr-2" />
            Suggest a Book
          </Link>
        </div>
      )}
    </div>
  )
}

export default BookSuggestions

