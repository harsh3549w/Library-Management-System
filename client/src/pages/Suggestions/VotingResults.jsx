import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { getVotingStats } from '../../store/slices/suggestionSlice'
import {
  TrendingUp,
  BookOpen,
  ThumbsUp,
  CheckCircle,
  XCircle,
  Clock,
  BarChart3,
  Tag
} from 'lucide-react'

const VotingResults = () => {
  const dispatch = useDispatch()
  const { stats, loading } = useSelector((state) => state.suggestions)

  useEffect(() => {
    dispatch(getVotingStats())
  }, [dispatch])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Voting Results & Analytics</h1>
          <p className="text-gray-600">Insights into book suggestions and voting patterns</p>
        </div>
        <Link to="/admin/manage-suggestions" className="btn-primary mt-4 sm:mt-0">
          Manage Suggestions
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : stats ? (
        <>
          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Suggestions</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <BookOpen className="h-10 w-10 text-blue-600" />
              </div>
            </div>

            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending Review</p>
                  <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
                </div>
                <Clock className="h-10 w-10 text-yellow-600" />
              </div>
            </div>

            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Approved</p>
                  <p className="text-3xl font-bold text-green-600">{stats.approved}</p>
                </div>
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
            </div>

            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Rejected</p>
                  <p className="text-3xl font-bold text-red-600">{stats.rejected}</p>
                </div>
                <XCircle className="h-10 w-10 text-red-600" />
              </div>
            </div>
          </div>

          {/* Top Voted Suggestions */}
          <div className="card">
            <div className="flex items-center mb-6">
              <TrendingUp className="h-6 w-6 text-blue-600 mr-3" />
              <h2 className="text-xl font-bold text-gray-900">Top Voted Pending Suggestions</h2>
            </div>
            {stats.topVoted && stats.topVoted.length > 0 ? (
              <div className="space-y-3">
                {stats.topVoted.map((suggestion, index) => (
                  <div
                    key={suggestion._id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center flex-1">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mr-4">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{suggestion.title}</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                          <span>{suggestion.author}</span>
                          <span className="flex items-center">
                            <Tag className="h-3 w-3 mr-1" />
                            {suggestion.category}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(suggestion.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center ml-4">
                      <ThumbsUp className="h-5 w-5 text-blue-600 mr-2" />
                      <span className="text-2xl font-bold text-blue-600">{suggestion.voteCount}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No pending suggestions with votes</p>
            )}
          </div>

          {/* Category Breakdown */}
          <div className="card">
            <div className="flex items-center mb-6">
              <BarChart3 className="h-6 w-6 text-blue-600 mr-3" />
              <h2 className="text-xl font-bold text-gray-900">Category Breakdown (Pending)</h2>
            </div>
            {stats.categoryStats && stats.categoryStats.length > 0 ? (
              <div className="space-y-4">
                {stats.categoryStats.map((category) => (
                  <div key={category._id} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center">
                        <Tag className="h-4 w-4 text-gray-600 mr-2" />
                        <span className="font-medium text-gray-900">{category._id}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-gray-600">{category.count} suggestions</span>
                        <span className="flex items-center text-blue-600 font-semibold">
                          <ThumbsUp className="h-4 w-4 mr-1" />
                          {category.totalVotes} votes
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{
                          width: `${Math.min(
                            100,
                            (category.totalVotes / Math.max(...stats.categoryStats.map((c) => c.totalVotes))) * 100
                          )}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No category data available</p>
            )}
          </div>

          {/* Approval Rate */}
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Approval Statistics</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-gray-900 mb-2">
                  {stats.total > 0
                    ? Math.round((stats.approved / (stats.approved + stats.rejected)) * 100) || 0
                    : 0}
                  %
                </div>
                <p className="text-sm text-gray-600">Approval Rate</p>
                <p className="text-xs text-gray-500 mt-1">
                  {stats.approved} approved of {stats.approved + stats.rejected} reviewed
                </p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-yellow-600 mb-2">
                  {stats.total > 0 ? Math.round((stats.pending / stats.total) * 100) : 0}%
                </div>
                <p className="text-sm text-gray-600">Pending Review</p>
                <p className="text-xs text-gray-500 mt-1">
                  {stats.pending} of {stats.total} total
                </p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  {stats.topVoted && stats.topVoted.length > 0
                    ? Math.round(
                        stats.topVoted.reduce((sum, s) => sum + s.voteCount, 0) / stats.topVoted.length
                      )
                    : 0}
                </div>
                <p className="text-sm text-gray-600">Avg Votes (Top 10)</p>
                <p className="text-xs text-gray-500 mt-1">Average votes per suggestion</p>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="card text-center py-12">
          <BarChart3 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No data available</h3>
          <p className="text-gray-500">Statistics will appear once users start suggesting books</p>
        </div>
      )}
    </div>
  )
}

export default VotingResults

