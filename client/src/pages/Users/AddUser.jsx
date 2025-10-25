import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { registerNewUser } from '../../store/slices/userSlice'
import { UserPlus, ArrowLeft, Eye, EyeOff, User, Mail, Phone, Users, AlertCircle, CheckCircle, Loader } from 'lucide-react'
import { Link } from 'react-router-dom'

const AddUser = () => {
  const [activeTab, setActiveTab] = useState('single') // 'single' or 'batch'
  
  // Single user form state
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
  
  // Batch register form state
  const [batchFormData, setBatchFormData] = useState({
    degree: 'btech',
    year: '1',
    branch: 'cs',
    startRoll: '',
    endRoll: ''
  })
  const [batchLoading, setBatchLoading] = useState(false)
  const [batchResult, setBatchResult] = useState(null)
  const [batchError, setBatchError] = useState('')

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
      const { confirmPassword, ...userData } = formData
      dispatch(registerNewUser(userData))
      navigate('/admin/users')
    }
  }

  // Batch register functions
  const degrees = [
    { value: 'btech', label: 'B.Tech', prefix: '1' },
    { value: 'dual', label: 'Dual Degree', prefix: '5' }
  ]

  const years = [
    { value: '1', label: '1st Year', code: '25' },
    { value: '2', label: '2nd Year', code: '24' },
    { value: '3', label: '3rd Year', code: '23' },
    { value: '4', label: '4th Year', code: '22' }
  ]

  const branches = [
    { value: 'cs', label: 'Computer Science (CS)' },
    { value: 'ece', label: 'Electronics & Communication (ECE)' },
    { value: 'me', label: 'Mechanical Engineering (ME)' },
    { value: 'ad', label: 'Artificial Intelligence & Data Science (AD)' }
  ]

  const handleBatchChange = (e) => {
    setBatchFormData({
      ...batchFormData,
      [e.target.name]: e.target.value
    })
    setBatchError('')
    setBatchResult(null)
  }

  const generateRollNumber = (rollNum) => {
    const degreePrefix = degrees.find(d => d.value === batchFormData.degree)?.prefix || '1'
    const yearCode = years.find(y => y.value === batchFormData.year)?.code || '25'
    const branch = batchFormData.branch
    const paddedRoll = String(rollNum).padStart(4, '0')
    
    return `${degreePrefix}${yearCode}${branch}${paddedRoll}`
  }

  const generateEmail = (rollNumber) => {
    return `${rollNumber}@iiitk.ac.in`
  }

  const generatePassword = (rollNumber) => {
    return `${rollNumber}@lib`
  }

  const handleBatchSubmit = async (e) => {
    e.preventDefault()
    setBatchError('')
    setBatchResult(null)

    const startRoll = parseInt(batchFormData.startRoll)
    const endRoll = parseInt(batchFormData.endRoll)

    // Validation
    if (!batchFormData.startRoll || !batchFormData.endRoll) {
      setBatchError('Please enter both start and end roll numbers')
      return
    }

    if (isNaN(startRoll) || isNaN(endRoll)) {
      setBatchError('Roll numbers must be valid numbers')
      return
    }

    if (startRoll > endRoll) {
      setBatchError('Start roll number must be less than or equal to end roll number')
      return
    }

    if (endRoll - startRoll > 100) {
      setBatchError('Cannot register more than 100 users at once')
      return
    }

    setBatchLoading(true)

    try {
      // Generate users array
      const users = []
      for (let i = startRoll; i <= endRoll; i++) {
        const rollNumber = generateRollNumber(i)
        const email = generateEmail(rollNumber)
        const password = generatePassword(rollNumber)

        users.push({
          email,
          password,
          name: `Student ${rollNumber}`,
          rollNumber,
          phone: '0000000000',
          address: 'IIIT Kurnool',
          role: 'User'
        })
      }

      // Call API
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1'
      const response = await fetch(`${API_URL}/admin/batch-register`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ users })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to register users')
      }

      setBatchResult({
        success: true,
        message: `Successfully registered ${users.length} users. Welcome emails with temporary passwords have been sent to all students.`,
        count: users.length,
        sample: users[0]
      })

      // Reset form
      setBatchFormData({
        degree: 'btech',
        year: '1',
        branch: 'cs',
        startRoll: '',
        endRoll: ''
      })

    } catch (err) {
      setBatchError(err.message || 'An error occurred while registering users')
    } finally {
      setBatchLoading(false)
    }
  }

  // Preview roll number generation
  const previewRollNumber = batchFormData.startRoll ? generateRollNumber(parseInt(batchFormData.startRoll)) : ''
  const previewEmail = previewRollNumber ? generateEmail(previewRollNumber) : ''
  const previewPassword = previewRollNumber ? generatePassword(previewRollNumber) : ''

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Add Users</h1>
        <p className="text-gray-600">Create user accounts individually or in batch</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm p-2 mb-4">
        <nav className="flex space-x-2">
          <button
            type="button"
            onClick={() => setActiveTab('single')}
            className={`${
              activeTab === 'single'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-100'
            } flex-1 py-3 px-4 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-all duration-200`}
          >
            <UserPlus className="h-5 w-5" />
            Single User
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('batch')}
            className={`${
              activeTab === 'batch'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-100'
            } flex-1 py-3 px-4 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-all duration-200`}
          >
            <Users className="h-5 w-5" />
            Batch Register
          </button>
        </nav>
      </div>

      {/* Single User Form */}
      {activeTab === 'single' && (
        <div className="card max-w-2xl">
        <div className="flex items-center mb-6">
          <div className="flex-shrink-0 p-3 bg-blue-100 rounded-lg">
            <UserPlus className="h-6 w-6 text-blue-600" />
          </div>
          <div className="ml-4">
            <h2 className="text-lg font-medium text-gray-900">User Account Details</h2>
            <p className="text-sm text-gray-500">Fill in the details for the new user</p>
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

          {/* Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <UserPlus className="h-5 w-5 text-blue-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  User Account Creation
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>
                    This will create a new user account with the following features:
                  </p>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li>User role (not admin)</li>
                    <li>Account will be automatically verified</li>
                    <li>User can borrow books and make reservations</li>
                    <li>User will need to login with the provided password</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                'Create User Account'
              )}
            </button>
          </div>
        </form>
      </div>
      )}

      {/* Batch Register Form */}
      {activeTab === 'batch' && (
        <div className="space-y-6">
          {/* Success Message */}
          {batchResult && batchResult.success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="text-green-800 font-medium">{batchResult.message}</h3>
                  <p className="text-green-700 text-sm mt-1">Sample: {batchResult.sample.email} / Password: {generatePassword(batchResult.sample.rollNumber)}</p>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {batchError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-600 mr-3" />
                <p className="text-red-800">{batchError}</p>
              </div>
            </div>
          )}

          {/* Batch Form */}
          <form onSubmit={handleBatchSubmit} className="card">
            <div className="flex items-center mb-6">
              <div className="flex-shrink-0 p-3 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <h2 className="text-lg font-medium text-gray-900">Batch Student Registration</h2>
                <p className="text-sm text-gray-500">Register multiple students with auto-generated credentials</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Degree */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Degree Program *
                </label>
                <select
                  name="degree"
                  value={batchFormData.degree}
                  onChange={handleBatchChange}
                  className="input-field"
                  required
                >
                  {degrees.map(degree => (
                    <option key={degree.value} value={degree.value}>
                      {degree.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Year */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Year *
                </label>
                <select
                  name="year"
                  value={batchFormData.year}
                  onChange={handleBatchChange}
                  className="input-field"
                  required
                >
                  {years.map(year => (
                    <option key={year.value} value={year.value}>
                      {year.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Branch */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Branch *
                </label>
                <select
                  name="branch"
                  value={batchFormData.branch}
                  onChange={handleBatchChange}
                  className="input-field"
                  required
                >
                  {branches.map(branch => (
                    <option key={branch.value} value={branch.value}>
                      {branch.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Start Roll Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Roll Number *
                </label>
                <input
                  type="number"
                  name="startRoll"
                  value={batchFormData.startRoll}
                  onChange={handleBatchChange}
                  className="input-field"
                  placeholder="e.g., 1"
                  min="1"
                  required
                />
              </div>

              {/* End Roll Number */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Roll Number *
                </label>
                <input
                  type="number"
                  name="endRoll"
                  value={batchFormData.endRoll}
                  onChange={handleBatchChange}
                  className="input-field"
                  placeholder="e.g., 50"
                  min="1"
                  required
                />
              </div>
            </div>

            {/* Preview */}
            {previewRollNumber && (
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="text-sm font-medium text-blue-900 mb-2">Preview (First Student)</h3>
                <div className="space-y-1 text-sm text-blue-800">
                  <p><span className="font-medium">Roll Number:</span> {previewRollNumber}</p>
                  <p><span className="font-medium">Email:</span> {previewEmail}</p>
                  <p><span className="font-medium">Password:</span> {previewPassword}</p>
                  <p><span className="font-medium">Total Students:</span> {batchFormData.endRoll && batchFormData.startRoll ? parseInt(batchFormData.endRoll) - parseInt(batchFormData.startRoll) + 1 : 0}</p>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="mt-6 flex justify-end">
              <button
                type="submit"
                disabled={batchLoading}
                className="btn-primary flex items-center gap-2"
              >
                {batchLoading ? (
                  <>
                    <Loader className="h-5 w-5 animate-spin" />
                    Registering...
                  </>
                ) : (
                  <>
                    <Users className="h-5 w-5" />
                    Register Students
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Information Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Roll Number Format */}
            <div className="card bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Roll Number Format</h3>
              <div className="space-y-2 text-sm text-gray-700">
                <p><span className="font-medium">Format:</span> [Degree][Year][Branch][RollNo]@iiitk.ac.in</p>
                <p><span className="font-medium">Degree Prefix:</span> B.Tech = 1, Dual Degree = 5</p>
                <p><span className="font-medium">Year Code:</span> 1st = 25, 2nd = 24, 3rd = 23, 4th = 22</p>
                <p><span className="font-medium">Branch Codes:</span> CS, ECE, ME, AD</p>
                <p><span className="font-medium">Example:</span> 123cs0003@iiitk.ac.in</p>
                <p><span className="font-medium">Password:</span> [rollnumber]@lib</p>
              </div>
            </div>

            {/* Email Notification Info */}
            <div className="card bg-blue-50 border border-blue-200">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">📧 Email Notifications</h3>
              <div className="space-y-2 text-sm text-blue-800">
                <p>✅ Each student will automatically receive:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Email address and roll number</li>
                  <li>Temporary password</li>
                  <li>Login instructions</li>
                  <li>Profile update reminders</li>
                </ul>
                <p className="mt-3"><span className="font-medium">Note:</span> Students must change their password on first login.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AddUser
