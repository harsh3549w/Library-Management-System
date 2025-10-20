import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import {
  getAllArchives,
  deleteArchive,
  clearSuccess,
  clearError
} from '../../store/slices/archiveSlice'
import {
  FileText,
  Eye,
  Calendar,
  User,
  Tag,
  Search,
  Filter,
  TrendingUp,
  Upload,
  Trash2
} from 'lucide-react'

const Archives = () => {
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('recent')

  const dispatch = useDispatch()
  const { archives, loading, success, message, error } = useSelector((state) => state.archives)
  const { user } = useSelector((state) => state.auth)
  const isAdmin = user?.role === 'Admin'

  useEffect(() => {
    dispatch(getAllArchives({ category: categoryFilter, search: searchTerm, sortBy }))
  }, [dispatch, categoryFilter, sortBy])

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

  const handleSearch = (e) => {
    e.preventDefault()
    dispatch(getAllArchives({ category: categoryFilter, search: searchTerm, sortBy }))
  }

  const handleDelete = (archive) => {
    if (window.confirm(`Are you sure you want to delete "${archive.title}"? This action cannot be undone.`)) {
      dispatch(deleteArchive(archive._id))
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  const categories = [
    'Research Papers',
    'Thesis',
    'Dissertations',
    'Conference Papers',
    'Journals',
    'Reports',
    'Presentations',
    'Other'
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Academic Archives</h1>
          <p className="text-gray-600">Browse and view academic resources</p>
        </div>
        <Link to="/upload-archive" className="btn-primary inline-flex items-center mt-4 sm:mt-0">
          <Upload className="h-4 w-4 mr-2" />
          Upload Archive
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

      {/* Search and Filters */}
      <div className="card space-y-4">
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search archives by title, description, or tags..."
              className="input-field pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button type="submit" className="btn-primary">
            Search
          </button>
        </form>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Filter className="inline h-4 w-4 mr-1" />
              Category
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="input-field"
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

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
              <option value="recent">Most Recent</option>
              <option value="oldest">Oldest First</option>
              <option value="popular">Most Downloaded</option>
              <option value="views">Most Viewed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Archives List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : archives.length > 0 ? (
        <div className="grid grid-cols-1 gap-6">
          {archives.map((archive) => (
            <div key={archive._id} className="card hover:shadow-lg transition-shadow">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                <div className="flex-1">
                  <div className="flex items-start">
                    <FileText className="h-6 w-6 text-blue-600 mr-3 mt-1 flex-shrink-0" />
                    <div className="flex-1">
                      <Link
                        to={`/archive/${archive._id}`}
                        className="text-xl font-semibold text-gray-900 hover:text-blue-600 mb-2 block"
                      >
                        {archive.title}
                      </Link>
                      <p className="text-gray-700 mb-3">{archive.description}</p>

                      {/* Metadata */}
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center">
                          <Tag className="h-4 w-4 mr-1" />
                          {archive.category}
                        </div>
                        {archive.author && (
                          <div className="flex items-center">
                            <User className="h-4 w-4 mr-1" />
                            {archive.author}
                          </div>
                        )}
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {formatDate(archive.createdAt)}
                        </div>
                        <div className="flex items-center">
                          <Eye className="h-4 w-4 mr-1" />
                          {archive.downloads} downloads
                        </div>
                        <div className="flex items-center">
                          <Eye className="h-4 w-4 mr-1" />
                          {archive.views} views
                        </div>
                      </div>

                      {/* Tags */}
                      {archive.tags && archive.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {archive.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* File Info */}
                      <div className="text-sm text-gray-500">
                        <span className="font-medium">File Size:</span> {formatFileSize(archive.fileSize)} •{' '}
                        <span className="font-medium">Format:</span> {archive.fileType.toUpperCase()}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-4 md:mt-0 md:ml-6 flex gap-2">
                  <Link
                    to={`/archive/${archive._id}`}
                    className="btn-primary inline-flex items-center"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </Link>
                  {isAdmin && (
                    <button
                      onClick={() => handleDelete(archive)}
                      className="btn-danger inline-flex items-center"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No archives found</h3>
          <p className="text-gray-500">
            {searchTerm || categoryFilter !== 'all'
              ? 'Try adjusting your search or filters.'
              : 'No archives have been uploaded yet.'}
          </p>
        </div>
      )}
    </div>
  )
}

export default Archives

