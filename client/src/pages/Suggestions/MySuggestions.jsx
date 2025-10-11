import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { getMySuggestions } from '../../store/slices/suggestionSlice'
import { BookOpen, Plus, ThumbsUp, Calendar, Tag, User, CheckCircle, XCircle, Clock } from 'lucide-react'

const MySuggestions = () => {
  const dispatch = useDispatch()
  const { mySuggestions, loading } = useSelector((state) => state.suggestions)

  useEffect(() => {
    dispatch(getMySuggestions())
  }, [dispatch])

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-600" />
      default:
        return <Clock className="h-5 w-5 text-yellow-600" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Suggestions</h1>
          <p className="text-gray-600">Track the status of your book suggestions</p>
        </div>
        <Link to="/suggest-book" className="btn-primary inline-flex items-center mt-4 sm:mt-0">
          <Plus className="h-4 w-4 mr-2" />
          Suggest New Book
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{mySuggestions.length}</p>
            </div>
            <BookOpen className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">
                {mySuggestions.filter((s) => s.status === 'pending').length}
              </p>
            </div>
            <Clock className="h-8 w-8 text-yellow-600" />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-green-600">
                {mySuggestions.filter((s) => s.status === 'approved').length}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Votes</p>
              <p className="text-2xl font-bold text-blue-600">
                {mySuggestions.reduce((sum, s) => sum + s.voteCount, 0)}
              </p>
            </div>
            <ThumbsUp className="h-8 w-8 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Suggestions List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : mySuggestions.length > 0 ? (
        <div className="space-y-4">
          {mySuggestions.map((suggestion) => (
            <div key={suggestion._id} className="card">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                {/* Book Info */}
                <div className="flex-1">
                  <div className="flex items-start mb-3">
                    <BookOpen className="h-6 w-6 text-blue-600 mr-3 mt-1 flex-shrink-0" />
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {suggestion.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-2">
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
                      <p className="text-gray-700 text-sm mb-3">{suggestion.description}</p>

                      {/* Status Badge */}
                      <div className={`inline-flex items-center px-3 py-1 rounded-full border ${getStatusColor(suggestion.status)}`}>
                        {getStatusIcon(suggestion.status)}
                        <span className="ml-2 text-sm font-medium">
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

                      {/* Approval/Rejection Date */}
                      {(suggestion.approvedAt || suggestion.rejectedAt) && (
                        <p className="text-xs text-gray-500 mt-2">
                          {suggestion.status === 'approved' ? 'Approved' : 'Rejected'} on{' '}
                          {formatDate(suggestion.approvedAt || suggestion.rejectedAt)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Vote Count */}
                <div className="mt-4 md:mt-0 md:ml-6 flex-shrink-0">
                  <div className="flex flex-col items-center justify-center p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                    <ThumbsUp className="h-6 w-6 text-blue-600 mb-2" />
                    <span className="text-2xl font-bold text-blue-600">{suggestion.voteCount}</span>
                    <span className="text-xs text-blue-600">
                      {suggestion.voteCount === 1 ? 'Vote' : 'Votes'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card text-center py-12">
          <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No suggestions yet</h3>
          <p className="text-gray-500 mb-4">
            You haven't suggested any books yet. Start by suggesting a book you'd like to see in our library!
          </p>
          <Link to="/suggest-book" className="btn-primary inline-flex items-center">
            <Plus className="h-4 w-4 mr-2" />
            Suggest Your First Book
          </Link>
        </div>
      )}
    </div>
  )
}

export default MySuggestions

