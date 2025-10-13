import { BookOpen, User, Tag, Calendar, ThumbsUp, CheckCircle, XCircle, Clock } from 'lucide-react'

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const statusBadgeClasses = (status) => {
  switch (status) {
    case 'approved':
      return 'bg-green-100 text-green-800 border-green-200'
    case 'rejected':
      return 'bg-red-100 text-red-800 border-red-200'
    default:
      return 'bg-yellow-100 text-yellow-800 border-yellow-200'
  }
}

const StatusIcon = ({ status }) => {
  if (status === 'approved') return <CheckCircle className="h-5 w-5 text-green-600" />
  if (status === 'rejected') return <XCircle className="h-5 w-5 text-red-600" />
  return <Clock className="h-5 w-5 text-yellow-600" />
}

/*
  SuggestionCard
  Props:
    - suggestion: suggestion object
    - variant: 'vote' | 'readonly' (controls right-side panel)
    - onVote?: (id) => void (used when variant==='vote')
    - hasUserVoted?: (suggestion) => boolean
    - showSuggestedBy?: boolean
    - showDecisionDate?: boolean (shows approved/rejected date if present)
*/
const SuggestionCard = ({
  suggestion,
  variant = 'readonly',
  onVote,
  hasUserVoted,
  showSuggestedBy = false,
  showDecisionDate = false,
}) => {
  const voteEnabled = variant === 'vote' && suggestion.status === 'pending'
  const voted = hasUserVoted ? hasUserVoted(suggestion) : false

  return (
    <div className="card hover:shadow-lg transition-shadow">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between">
        <div className="flex-1">
          <div className="flex items-start">
            <BookOpen className="h-6 w-6 text-blue-600 mr-3 mt-1 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{suggestion.title}</h3>
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
              {showSuggestedBy && (
                <div className="text-sm text-gray-500">
                  Suggested by: <span className="font-medium">{suggestion.suggestedBy?.name}</span>
                </div>
              )}

              <div className={`inline-flex items-center px-3 py-1 rounded-full border ${statusBadgeClasses(suggestion.status)} mt-3`}>
                <StatusIcon status={suggestion.status} />
                <span className="ml-2 text-sm font-medium">
                  {suggestion.status?.charAt(0).toUpperCase() + suggestion.status?.slice(1)}
                </span>
              </div>

              {suggestion.adminNotes && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Admin Note:</span> {suggestion.adminNotes}
                  </p>
                </div>
              )}

              {showDecisionDate && (suggestion.approvedAt || suggestion.rejectedAt) && (
                <p className="text-xs text-gray-500 mt-2">
                  {suggestion.status === 'approved' ? 'Approved' : 'Rejected'} on {formatDate(suggestion.approvedAt || suggestion.rejectedAt)}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="mt-4 md:mt-0 md:ml-6 flex-shrink-0">
          {voteEnabled ? (
            <button
              onClick={() => onVote && onVote(suggestion._id)}
              className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all ${
                voted
                  ? 'bg-blue-50 border-blue-500 text-blue-600'
                  : 'bg-white border-gray-300 text-gray-600 hover:border-blue-500 hover:text-blue-600'
              }`}
            >
              <ThumbsUp className={`h-6 w-6 mb-2 ${voted ? 'fill-current' : ''}`} />
              <span className="text-2xl font-bold">{suggestion.voteCount}</span>
              <span className="text-xs">{suggestion.voteCount === 1 ? 'Vote' : 'Votes'}</span>
            </button>
          ) : (
            <div className="flex flex-col items-center justify-center p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
              <ThumbsUp className="h-6 w-6 text-blue-600 mb-2" />
              <span className="text-2xl font-bold text-blue-600">{suggestion.voteCount}</span>
              <span className="text-xs text-blue-600">{suggestion.voteCount === 1 ? 'Vote' : 'Votes'}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SuggestionCard


