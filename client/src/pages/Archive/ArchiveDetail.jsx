import { useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {
  getArchiveById,
  downloadArchive,
  deleteArchive,
  clearCurrentArchive,
  clearSuccess,
  clearError
} from '../../store/slices/archiveSlice'
import {
  FileText,
  Eye,
  Calendar,
  User,
  Tag,
  ArrowLeft,
  Trash2,
  AlertCircle
} from 'lucide-react'

const ArchiveDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { currentArchive, loading, success, message, error } = useSelector((state) => state.archives)
  const { user } = useSelector((state) => state.auth)
  const isAdmin = user?.role === 'Admin'

  useEffect(() => {
    dispatch(getArchiveById(id))
    return () => {
      dispatch(clearCurrentArchive())
    }
  }, [dispatch, id])

  useEffect(() => {
    if (success && message) {
      setTimeout(() => {
        dispatch(clearSuccess())
        if (message.includes('deleted')) {
          navigate('/archives')
        }
      }, 2000)
    }
  }, [success, message, dispatch, navigate])

  useEffect(() => {
    if (error) {
      setTimeout(() => {
        dispatch(clearError())
      }, 5000)
    }
  }, [error, dispatch])

  const handleDownload = () => {
    dispatch(downloadArchive(id))
    window.open(currentArchive.fileUrl, '_blank')
  }

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this archive? This action cannot be undone.')) {
      dispatch(deleteArchive(id))
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
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

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!currentArchive) {
    return (
      <div className="card text-center py-12">
        <AlertCircle className="mx-auto h-12 w-12 text-red-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Archive not found</h3>
        <Link to="/archives" className="text-blue-600 hover:underline">
          Back to Archives
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link to="/archives" className="inline-flex items-center text-blue-600 hover:text-blue-700">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Archives
      </Link>

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

      {/* Archive Details */}
      <div className="card">
        <div className="flex items-start mb-6">
          <FileText className="h-8 w-8 text-blue-600 mr-4 mt-1 flex-shrink-0" />
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{currentArchive.title}</h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
              <div className="flex items-center">
                <Tag className="h-4 w-4 mr-1" />
                {currentArchive.category}
              </div>
              {currentArchive.author && (
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-1" />
                  {currentArchive.author}
                </div>
              )}
              {currentArchive.publishedYear && (
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  Published: {currentArchive.publishedYear}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Description</h2>
          <p className="text-gray-700 whitespace-pre-wrap">{currentArchive.description}</p>
        </div>

        {/* Tags */}
        {currentArchive.tags && currentArchive.tags.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Tags</h2>
            <div className="flex flex-wrap gap-2">
              {currentArchive.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* File Information */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">File Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center">
              <span className="font-medium text-gray-700 mr-2">Format:</span>
              <span className="text-gray-600">{currentArchive.fileType.toUpperCase()}</span>
            </div>
            <div className="flex items-center">
              <span className="font-medium text-gray-700 mr-2">Size:</span>
              <span className="text-gray-600">{formatFileSize(currentArchive.fileSize)}</span>
            </div>
            <div className="flex items-center">
              <Eye className="h-4 w-4 text-gray-600 mr-2" />
              <span className="font-medium text-gray-700 mr-2">Views:</span>
              <span className="text-gray-600">{currentArchive.views}</span>
            </div>
          </div>
        </div>

        {/* Upload Information */}
        <div className="border-t pt-4">
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
            <div>
              <span className="font-medium">Uploaded by:</span> {currentArchive.uploadedBy.name}
            </div>
            <div>
              <span className="font-medium">Uploaded on:</span> {formatDate(currentArchive.createdAt)}
            </div>
            <div>
              <span className="font-medium">Access Level:</span>{' '}
              <span className={`px-2 py-1 rounded-full text-xs ${
                currentArchive.accessLevel === 'public'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {currentArchive.accessLevel}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mt-6">
          <button
            onClick={handleDownload}
            className="btn-primary inline-flex items-center flex-1"
          >
            <Eye className="h-4 w-4 mr-2" />
            View PDF
          </button>
          {isAdmin && (
            <button
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg inline-flex items-center transition-colors"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default ArchiveDetail

