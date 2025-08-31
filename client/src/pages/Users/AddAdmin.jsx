import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { registerNewAdmin } from '../../store/slices/userSlice'
import { Shield, ArrowLeft, Eye, EyeOff, User, Mail, Phone } from 'lucide-react'
import { Link } from 'react-router-dom'

const AddAdmin = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState({})

  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { loading } = useSelector((state) => state.users)

  const validateForm = () => {
    const newErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid'
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
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
      const { confirmPassword, ...adminData } = formData
      dispatch(registerNewAdmin(adminData))
      navigate('/admin/users')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link
          to="/admin/users"
          className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Users
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Add New Admin</h1>
          <p className="text-gray-600">Create a new administrator account</p>
        </div>
      </div>

      {/* Form */}
      <div className="card max-w-2xl">
        <div className="flex items-center mb-6">
          <div className="flex-shrink-0 p-3 bg-purple-100 rounded-lg">
            <Shield className="h-6 w-6 text-purple-600" />
          </div>
          <div className="ml-4">
            <h2 className="text-lg font-medium text-gray-900">Admin Account Details</h2>
            <p className="text-sm text-gray-500">Fill in the details for the new admin user</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <div className="md:col-span-2">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Full Name *
              </label>
              <div className="mt-1 relative">
                <input
                  type="text"
                  id="name"
                  name="name"
                  autoComplete="name"
                  required
                  className={`input-field ${errors.name ? 'border-red-500' : ''}`}
                  placeholder="Enter full name"
                  value={formData.name}
                  onChange={handleChange}
                />
                <User className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>

            {/* Email */}
            <div className="md:col-span-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address *
              </label>
              <div className="mt-1 relative">
                <input
                  type="email"
                  id="email"
                  name="email"
                  autoComplete="email"
                  required
                  className={`input-field ${errors.email ? 'border-red-500' : ''}`}
                  placeholder="Enter email address"
                  value={formData.email}
                  onChange={handleChange}
                />
                <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>

            {/* Phone */}
            <div className="md:col-span-2">
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Phone Number *
              </label>
              <div className="mt-1 relative">
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  autoComplete="tel"
                  required
                  className={`input-field ${errors.phone ? 'border-red-500' : ''}`}
                  placeholder="Enter phone number"
                  value={formData.phone}
                  onChange={handleChange}
                />
                <Phone className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
              {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password *
              </label>
              <div className="mt-1 relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  autoComplete="new-password"
                  required
                  className={`input-field pr-10 ${errors.password ? 'border-red-500' : ''}`}
                  placeholder="Enter password"
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm Password *
              </label>
              <div className="mt-1 relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  autoComplete="new-password"
                  required
                  className={`input-field pr-10 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                  placeholder="Confirm password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
            </div>
          </div>

          {/* Warning */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <Shield className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Admin Privileges
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>
                    This user will have full administrative access to the library system, including:
                  </p>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li>Adding, editing, and deleting books</li>
                    <li>Managing all borrowed books</li>
                    <li>Viewing all user accounts</li>
                    <li>Creating new admin accounts</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <Link
              to="/admin/users"
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
                'Create Admin Account'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddAdmin
