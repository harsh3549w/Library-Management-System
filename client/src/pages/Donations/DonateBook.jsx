import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { createDonationRequest, clearSuccess, clearError } from '../../store/slices/donationSlice'
import { BookOpen, User, Calendar, FileText, AlertCircle, CheckCircle } from 'lucide-react'

const DonateBook = () => {
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    publicationYear: '',
    genre: '',
    condition: 'Good',
    description: ''
  })

  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { loading, success, error, message } = useSelector((state) => state.donations)

  useEffect(() => {
    if (success) {
      setTimeout(() => {
        dispatch(clearSuccess())
        navigate('/my-donations')
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

  const handleSubmit = (e) => {
    e.preventDefault()
    dispatch(createDonationRequest(formData))
  }

  const conditions = ['Excellent', 'Good', 'Fair', 'Poor']
  const genres = [
    'Fiction',
    'Non-Fiction',
    'Science Fiction',
    'Mystery',
    'Romance',
    'Thriller',
    'Fantasy',
    'Biography',
    'History',
    'Science',
    'Technology',
    'Philosophy',
    'Self-Help',
    'Business',
    'Education',
    'Attention',
    'Other'
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Donate a Book</h1>
        <p className="text-gray-600">Share your books with the library community</p>
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
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              <BookOpen className="inline h-4 w-4 mr-1" />
              Book Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="input-field"
              placeholder="Enter book title"
              required
            />
          </div>

          {/* Author */}
          <div>
            <label htmlFor="author" className="block text-sm font-medium text-gray-700 mb-2">
              <User className="inline h-4 w-4 mr-1" />
              Author *
            </label>
            <input
              type="text"
              id="author"
              name="author"
              value={formData.author}
              onChange={handleChange}
              className="input-field"
              placeholder="Enter author name"
              required
            />
          </div>

          {/* ISBN */}
          <div>
            <label htmlFor="isbn" className="block text-sm font-medium text-gray-700 mb-2">
              ISBN (Optional)
            </label>
            <input
              type="text"
              id="isbn"
              name="isbn"
              value={formData.isbn}
              onChange={handleChange}
              className="input-field"
              placeholder="Enter ISBN if available"
            />
          </div>

          {/* Publication Year */}
          <div>
            <label htmlFor="publicationYear" className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="inline h-4 w-4 mr-1" />
              Publication Year (Optional)
            </label>
            <input
              type="number"
              id="publicationYear"
              name="publicationYear"
              value={formData.publicationYear}
              onChange={handleChange}
              className="input-field"
              placeholder="e.g., 2024"
              min="1900"
              max={new Date().getFullYear()}
            />
          </div>

          {/* Genre */}
          <div>
            <label htmlFor="genre" className="block text-sm font-medium text-gray-700 mb-2">
              Genre (Optional)
            </label>
            <select
              id="genre"
              name="genre"
              value={formData.genre}
              onChange={handleChange}
              className="input-field"
            >
              <option value="">Select a genre</option>
              {genres.map((genre) => (
                <option key={genre} value={genre}>
                  {genre}
                </option>
              ))}
            </select>
          </div>

          {/* Condition */}
          <div>
            <label htmlFor="condition" className="block text-sm font-medium text-gray-700 mb-2">
              Book Condition *
            </label>
            <select
              id="condition"
              name="condition"
              value={formData.condition}
              onChange={handleChange}
              className="input-field"
              required
            >
              {conditions.map((condition) => (
                <option key={condition} value={condition}>
                  {condition}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Please select the current condition of your book
            </p>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              <FileText className="inline h-4 w-4 mr-1" />
              Additional Notes (Optional)
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              className="input-field"
              placeholder="Any additional information about the book..."
            />
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
                  Submitting...
                </div>
              ) : (
                <>
                  <BookOpen className="inline h-4 w-4 mr-2" />
                  Submit Donation Request
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate('/my-donations')}
              className="btn-secondary flex-1"
            >
              View My Donations
            </button>
          </div>
        </form>
      </div>

      {/* Information Card */}
      <div className="card bg-blue-50 border-blue-200">
        <div className="flex items-start">
          <AlertCircle className="h-5 w-5 text-blue-600 mr-3 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-blue-900 mb-2">Donation Process</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Your donation request will be reviewed by library administrators</li>
              <li>• You will receive an email notification once the request is processed</li>
              <li>• If approved, you can bring the book to the library</li>
              <li>• The book will be added to the library catalog for all users to borrow</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DonateBook
