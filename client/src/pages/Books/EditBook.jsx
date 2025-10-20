import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams, useNavigate } from 'react-router-dom'
import { updateBook, getAllBooks } from '../../store/slices/bookSlice'
import { BookOpen, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

const EditBook = () => {
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    publicationYear: '',
    quantity: '',
    price: '',
    description: '',
    genre: '',
    publisher: '',
  })
  const [errors, setErrors] = useState({})
  const [coverImageFile, setCoverImageFile] = useState(null)

  const { id } = useParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { books, loading } = useSelector((state) => state.books)

  useEffect(() => {
    dispatch(getAllBooks())
  }, [dispatch])

  useEffect(() => {
    const book = books.find(b => b._id === id)
    if (book) {
      setFormData({
        title: book.title || '',
        author: book.author || '',
        isbn: book.isbn || '',
        publicationYear: book.publicationYear || '',
        quantity: book.quantity || '',
        price: book.price || '',
        description: book.description || '',
        genre: book.genre || '',
        publisher: book.publisher || '',
      })
    }
  }, [books, id])

  const validateForm = () => {
    const newErrors = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
    }

    if (!formData.author.trim()) {
      newErrors.author = 'Author is required'
    }

    if (!formData.quantity || formData.quantity < 1) {
      newErrors.quantity = 'Quantity must be at least 1'
    }

    if (!formData.price || formData.price < 0) {
      newErrors.price = 'Price is required and must be positive'
    }

    if (formData.publicationYear && (formData.publicationYear < 1800 || formData.publicationYear > new Date().getFullYear())) {
      newErrors.publicationYear = 'Publication year must be between 1800 and current year'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      })
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (validateForm()) {
      // Use FormData when uploading an image
      let payload
      if (coverImageFile) {
        const fd = new FormData()
        Object.entries({
          ...formData,
          quantity: parseInt(formData.quantity),
          price: parseFloat(formData.price),
          publicationYear: formData.publicationYear ? parseInt(formData.publicationYear) : ''
        }).forEach(([k, v]) => {
          if (v !== undefined && v !== '') fd.append(k, v)
        })
        fd.append('coverImage', coverImageFile)
        payload = fd
      } else {
        payload = {
          ...formData,
          quantity: parseInt(formData.quantity),
          price: parseFloat(formData.price),
          publicationYear: formData.publicationYear ? parseInt(formData.publicationYear) : undefined,
        }
      }
      dispatch(updateBook({ id, bookData: payload }))
      navigate('/books')
    }
  }

  const book = books.find(b => b._id === id)

  if (!book) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Link
            to="/books"
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Books
          </Link>
        </div>
        <div className="card text-center py-12">
          <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Book not found</h3>
          <p className="text-gray-500">
            The book you're looking for doesn't exist or has been removed.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link
          to="/books"
          className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Books
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Book</h1>
          <p className="text-gray-600">Update book information</p>
        </div>
      </div>

      {/* Form */}
      <div className="card max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Cover Image */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                Cover Image
              </label>
              <div className="mt-1 flex items-center gap-4">
                {book?.coverImage?.url ? (
                  <img src={book.coverImage.url} alt={book.title} className="h-24 w-24 object-cover rounded" />
                ) : (
                  <div className="h-24 w-24 rounded bg-gray-100 flex items-center justify-center text-gray-400">
                    <BookOpen className="h-6 w-6" />
                  </div>
                )}
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setCoverImageFile(e.target.files?.[0] || null)}
                    className="block w-full text-sm text-gray-900 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                  />
                  <p className="text-xs text-gray-500 mt-1">PNG, JPG up to ~5MB.</p>
                </div>
              </div>
            </div>
            {/* Title */}
            <div className="md:col-span-2">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Book Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                className={`input-field mt-1 ${errors.title ? 'border-red-500' : ''}`}
                placeholder="Enter book title"
                value={formData.title}
                onChange={handleChange}
              />
              {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
            </div>

            {/* Author */}
            <div className="md:col-span-2">
              <label htmlFor="author" className="block text-sm font-medium text-gray-700">
                Author *
              </label>
              <input
                type="text"
                id="author"
                name="author"
                className={`input-field mt-1 ${errors.author ? 'border-red-500' : ''}`}
                placeholder="Enter author name"
                value={formData.author}
                onChange={handleChange}
              />
              {errors.author && <p className="mt-1 text-sm text-red-600">{errors.author}</p>}
            </div>

            {/* ISBN */}
            <div>
              <label htmlFor="isbn" className="block text-sm font-medium text-gray-700">
                ISBN
              </label>
              <input
                type="text"
                id="isbn"
                name="isbn"
                className="input-field mt-1"
                placeholder="Enter ISBN"
                value={formData.isbn}
                onChange={handleChange}
              />
            </div>

            {/* Publication Year */}
            <div>
              <label htmlFor="publicationYear" className="block text-sm font-medium text-gray-700">
                Publication Year
              </label>
              <input
                type="number"
                id="publicationYear"
                name="publicationYear"
                className={`input-field mt-1 ${errors.publicationYear ? 'border-red-500' : ''}`}
                placeholder="e.g., 2023"
                min="1800"
                max={new Date().getFullYear()}
                value={formData.publicationYear}
                onChange={handleChange}
              />
              {errors.publicationYear && <p className="mt-1 text-sm text-red-600">{errors.publicationYear}</p>}
            </div>

            {/* Quantity */}
            <div>
              <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
                Quantity *
              </label>
              <input
                type="number"
                id="quantity"
                name="quantity"
                className={`input-field mt-1 ${errors.quantity ? 'border-red-500' : ''}`}
                placeholder="Number of copies"
                min="1"
                value={formData.quantity}
                onChange={handleChange}
              />
              {errors.quantity && <p className="mt-1 text-sm text-red-600">{errors.quantity}</p>}
            </div>

            {/* Price */}
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                Price (₹) *
              </label>
              <input
                type="number"
                id="price"
                name="price"
                step="0.01"
                className={`input-field mt-1 ${errors.price ? 'border-red-500' : ''}`}
                placeholder="Book price"
                min="0"
                value={formData.price}
                onChange={handleChange}
              />
              {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price}</p>}
            </div>

            {/* Genre */}
            <div>
              <label htmlFor="genre" className="block text-sm font-medium text-gray-700">
                Genre
              </label>
              <select
                id="genre"
                name="genre"
                className="input-field mt-1"
                value={formData.genre}
                onChange={handleChange}
              >
                <option value="">Select genre</option>
                <option value="Fiction">Fiction</option>
                <option value="Non-Fiction">Non-Fiction</option>
                <option value="Science Fiction">Science Fiction</option>
                <option value="Fantasy">Fantasy</option>
                <option value="Mystery">Mystery</option>
                <option value="Romance">Romance</option>
                <option value="Thriller">Thriller</option>
                <option value="Biography">Biography</option>
                <option value="History">History</option>
                <option value="Science">Science</option>
                <option value="Technology">Technology</option>
                <option value="Self-Help">Self-Help</option>
                <option value="Business">Business</option>
                <option value="Philosophy">Philosophy</option>
                <option value="Religion">Religion</option>
                <option value="Poetry">Poetry</option>
                <option value="Drama">Drama</option>
                <option value="Children">Children</option>
                <option value="Young Adult">Young Adult</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Publisher */}
            <div>
              <label htmlFor="publisher" className="block text-sm font-medium text-gray-700">
                Publisher
              </label>
              <input
                type="text"
                id="publisher"
                name="publisher"
                className="input-field mt-1"
                placeholder="Enter publisher name"
                value={formData.publisher}
                onChange={handleChange}
              />
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                className="input-field mt-1"
                placeholder="Enter book description"
                value={formData.description}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <Link
              to="/books"
              className="btn-secondary"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                'Update Book'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditBook
