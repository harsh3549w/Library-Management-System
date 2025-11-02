import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { createSuggestion, clearSuccess, clearError } from '../../store/slices/suggestionSlice'
import { BookOpen, User, FileText, Hash, Tag, AlertCircle, CheckCircle, Calendar, ArrowLeft } from 'lucide-react'

const SuggestBook = () => {
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    category: '',
    publicationYear: '',
    description: '',
    notes: ''
  })

  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { loading, success, error, message } = useSelector((state) => state.suggestions)

  useEffect(() => {
    if (success) {
      const t = setTimeout(() => {
        dispatch(clearSuccess())
        navigate('/book-suggestions')
      }, 600)
      return () => clearTimeout(t)
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
    const extra = []
    if (formData.publicationYear) extra.push(`Publication Year: ${formData.publicationYear}`)
    if (formData.notes) extra.push(`Notes: ${formData.notes}`)
    const finalDescription = [formData.description, ...extra].filter(Boolean).join('\n\n')

    dispatch(createSuggestion({
      title: formData.title,
      author: formData.author,
      isbn: formData.isbn,
      category: formData.category,
      description: finalDescription
    }))
  }

  const categories = [
    'Fiction',
    'Non-Fiction',
    'Science',
    'Technology',
    'History',
    'Biography',
    'Self-Help',
    'Business',
    'Arts',
    'Philosophy',
    'Religion',
    'Other'
  ]

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back */}
      <div className="mb-4">
        <button onClick={() => navigate(-1)} className="inline-flex items-center text-slate-600 hover:text-slate-800">
          <ArrowLeft className="h-5 w-5 mr-2" /> Back
        </button>
      </div>

      {/* Header */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-slate-900">Suggest a Book</h1>
        <p className="text-slate-600">Recommend books you'd like to see in our library. Others can vote on your suggestion.</p>
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

      {/* Glass Form */}
      <div className="relative bg-gradient-to-b from-emerald-50/80 to-white/70 backdrop-blur-xl border border-emerald-200/70 rounded-2xl shadow-2xl p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Book Title *
            </label>
            <div className="relative">
              <BookOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input type="text" id="title" name="title" value={formData.title} onChange={handleChange}
                className="input-field pl-10 bg-emerald-50/60 ring-1 ring-emerald-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 rounded-full h-12"
                placeholder="Enter book title" required />
            </div>
          </div>

          {/* Author */}
          <div>
            <label htmlFor="author" className="block text-sm font-medium text-gray-700 mb-2">
              Author *
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input type="text" id="author" name="author" value={formData.author} onChange={handleChange}
                className="input-field pl-10 bg-emerald-50/60 ring-1 ring-emerald-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 rounded-full h-12"
                placeholder="Enter author name" required />
            </div>
          </div>

          {/* ISBN */}
          <div>
            <label htmlFor="isbn" className="block text-sm font-medium text-slate-700 mb-2">ISBN (Optional)</label>
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input type="text" id="isbn" name="isbn" value={formData.isbn} onChange={handleChange}
                className="input-field pl-10 bg-emerald-50/60 ring-1 ring-emerald-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 rounded-full h-12"
                placeholder="Enter ISBN if available" />
            </div>
          </div>

          {/* Publication Year */}
          <div>
            <label htmlFor="publicationYear" className="block text-sm font-medium text-slate-700 mb-2">
              <span className="inline-flex items-center gap-2"><Calendar className="h-4 w-4 text-slate-500"/> Publication Year (Optional)</span>
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input type="number" id="publicationYear" name="publicationYear" value={formData.publicationYear} onChange={handleChange}
                className="input-field pl-10 bg-emerald-50/60 ring-1 ring-emerald-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 rounded-full h-12"
                placeholder="e.g., 2024" min="1000" max="9999" />
            </div>
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-slate-700 mb-2">
              <span className="inline-flex items-center gap-2"><Tag className="h-4 w-4 text-slate-500"/> Genre *</span>
            </label>
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select id="category" name="category" value={formData.category} onChange={handleChange}
                className="input-field pl-10 bg-emerald-50/60 ring-1 ring-emerald-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 rounded-full h-12" required>
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-2">
              Description *
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <textarea id="description" name="description" value={formData.description} onChange={handleChange} rows="5"
                className="input-field pl-10 bg-emerald-50/60 ring-1 ring-emerald-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 rounded-2xl"
                placeholder="Why should we add this book to our library? What makes it valuable?" required />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-slate-700 mb-2">Additional Notes (Optional)</label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <textarea id="notes" name="notes" rows="3" value={formData.notes} onChange={handleChange}
                className="input-field pl-10 bg-emerald-50/60 ring-1 ring-emerald-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 rounded-2xl"
                placeholder="Any extra context or sources for this suggestion" />
            </div>
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
                'Submit Suggestion'
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate('/book-suggestions')}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

      {/* Info Box */}
      <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-xl p-3 mt-6">
        <h3 className="font-medium text-emerald-900 mb-2">How it works</h3>
        <ul className="text-sm text-emerald-800 space-y-1">
          <li>• Submit your book suggestion with details</li>
          <li>• Other users can vote on your suggestion</li>
          <li>• Librarians review highly-voted suggestions</li>
          <li>• Approved books are added to the library collection</li>
        </ul>
      </div>
    </div>
  )
}

export default SuggestBook

