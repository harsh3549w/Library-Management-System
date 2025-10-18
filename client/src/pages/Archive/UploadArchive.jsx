import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { uploadArchive, clearSuccess, clearError } from '../../store/slices/archiveSlice'
import { FileText, Upload, Tag, User, Calendar } from 'lucide-react'

const UploadArchive = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    tags: '',
    accessLevel: 'public',
    author: '',
    publishedYear: ''
  })
  const [file, setFile] = useState(null)
  const [fileName, setFileName] = useState('')

  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { loading, success, error, message } = useSelector((state) => state.archives)
  const { user } = useSelector((state) => state.auth)

  useEffect(() => {
    if (success) {
      setTimeout(() => {
        dispatch(clearSuccess())
        navigate('/archives')
      }, 2000)
    }
  }, [success, dispatch, navigate])

  useEffect(() => {
    if (error) {
      setTimeout(() => {
        dispatch(clearError())
      }, 5000)
    }
  }, [error, dispatch])


  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      if (selectedFile.type !== 'application/pdf') {
        alert('Only PDF files are allowed')
        return
      }
      if (selectedFile.size > 50 * 1024 * 1024) {
        alert('File size should not exceed 50MB')
        return
      }
      setFile(selectedFile)
      setFileName(selectedFile.name)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!file) {
      alert('Please select a file to upload')
      return
    }

    const uploadData = new FormData()
    uploadData.append('file', file)
    uploadData.append('title', formData.title)
    uploadData.append('description', formData.description)
    uploadData.append('category', formData.category)
    uploadData.append('tags', formData.tags)
    uploadData.append('accessLevel', formData.accessLevel)
    // Always use S3 - no provider selection needed
    if (formData.author) uploadData.append('author', formData.author)
    if (formData.publishedYear) uploadData.append('publishedYear', formData.publishedYear)

    dispatch(uploadArchive(uploadData))
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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Upload Archive</h1>
        <p className="text-gray-600">Upload academic resources to the library archive</p>
      </div>

      {/* Success Message */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
          <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
          <p className="text-green-800">{message}</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
          <AlertCircle className="h-5 w-5 text-red-600 mr-3" />
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Form */}
      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FileText className="inline h-4 w-4 mr-1" />
              PDF File * (Max 50MB)
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-blue-500 transition-colors">
              <div className="space-y-1 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600">
                  <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500">
                    <span>Upload a file</span>
                    <input
                      type="file"
                      className="sr-only"
                      accept=".pdf"
                      onChange={handleFileChange}
                      required
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">PDF up to 50MB</p>
                {fileName && (
                  <p className="text-sm text-green-600 font-medium mt-2">
                    Selected: {fileName}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="input-field"
              placeholder="Enter archive title"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              className="input-field"
              placeholder="Describe the content of this archive"
              required
            />
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
              <Tag className="inline h-4 w-4 mr-1" />
              Category *
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="input-field"
              required
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Author */}
          <div>
            <label htmlFor="author" className="block text-sm font-medium text-gray-700 mb-2">
              <User className="inline h-4 w-4 mr-1" />
              Author (Optional)
            </label>
            <input
              type="text"
              id="author"
              name="author"
              value={formData.author}
              onChange={handleChange}
              className="input-field"
              placeholder="Enter author name"
            />
          </div>

          {/* Published Year */}
          <div>
            <label htmlFor="publishedYear" className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="inline h-4 w-4 mr-1" />
              Published Year (Optional)
            </label>
            <input
              type="number"
              id="publishedYear"
              name="publishedYear"
              value={formData.publishedYear}
              onChange={handleChange}
              className="input-field"
              placeholder="e.g., 2024"
              min="1900"
              max={new Date().getFullYear()}
            />
          </div>

          {/* Tags */}
          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
              Tags (Optional, comma-separated)
            </label>
            <input
              type="text"
              id="tags"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              className="input-field"
              placeholder="e.g., machine learning, AI, neural networks"
            />
            <p className="text-xs text-gray-500 mt-1">Separate tags with commas</p>
          </div>


          {/* Access Level */}
          <div>
            <label htmlFor="accessLevel" className="block text-sm font-medium text-gray-700 mb-2">
              Access Level *
            </label>
            <select
              id="accessLevel"
              name="accessLevel"
              value={formData.accessLevel}
              onChange={handleChange}
              className="input-field"
              required
            >
              <option value="public">Public (All users can access)</option>
              <option value="restricted">Restricted (Admin approval required)</option>
            </select>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex-1"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Uploading...
                </div>
              ) : (
                <>
                  <Upload className="inline h-4 w-4 mr-2" />
                  Upload Archive
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate('/archives')}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default UploadArchive

