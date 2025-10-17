import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { extendDueDate } from '../../store/slices/borrowSlice'
import { Calendar, Clock, User, BookOpen, AlertCircle } from 'lucide-react'

const ExtendDue = () => {
  const [formData, setFormData] = useState({
    email: '',
    isbn: ''
  })
  const [errors, setErrors] = useState({})

  const dispatch = useDispatch()
  const { loading, success, error } = useSelector((state) => state.borrow)

  const validateForm = () => {
    const newErrors = {}

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid'
    }

    if (!formData.isbn.trim()) {
      newErrors.isbn = 'ISBN is required'
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
      dispatch(extendDueDate(formData))
      // Reset form on success
      if (success) {
        setFormData({ email: '', isbn: '' })
      }
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center mb-6">
        <div className="flex-shrink-0 p-3 bg-green-100 rounded-lg">
          <Calendar className="h-6 w-6 text-green-600" />
        </div>
        <div className="ml-4">
          <h3 className="text-lg font-medium text-gray-900">Extend Due Date</h3>
          <p className="text-sm text-gray-500">Extend book due date by 7 days</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              User Email *
            </label>
            <div className="relative">
              <input
                type="email"
                id="email"
                name="email"
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter user's email"
                value={formData.email}
                onChange={handleChange}
              />
              <User className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
          </div>

          {/* ISBN Field */}
          <div>
            <label htmlFor="isbn" className="block text-sm font-medium text-gray-700 mb-1">
              ISBN No. *
            </label>
            <div className="relative">
              <input
                type="text"
                id="isbn"
                name="isbn"
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.isbn ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter ISBN number"
                value={formData.isbn}
                onChange={handleChange}
              />
              <BookOpen className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
            {errors.isbn && <p className="mt-1 text-sm text-red-600">{errors.isbn}</p>}
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <Clock className="h-5 w-5 text-blue-400" />
            </div>
            <div className="ml-3">
              <h4 className="text-sm font-medium text-blue-800">Extension Details</h4>
              <div className="mt-2 text-sm text-blue-700">
                <ul className="list-disc list-inside space-y-1">
                  <li>Due date will be extended by 7 days from current due date</li>
                  <li>Only works for currently borrowed books</li>
                  <li>Use exact ISBN number for precise book identification</li>
                  <li>User will be notified via email about the extension</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <h4 className="text-sm font-medium text-red-800">Error</h4>
                <p className="mt-1 text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <Calendar className="h-5 w-5 text-green-400" />
              </div>
              <div className="ml-3">
                <h4 className="text-sm font-medium text-green-800">Success</h4>
                <p className="mt-1 text-sm text-green-700">Due date extended successfully by 7 days!</p>
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <Calendar className="h-4 w-4 mr-2" />
            )}
            {loading ? 'Extending...' : 'Extend Due Date'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default ExtendDue
