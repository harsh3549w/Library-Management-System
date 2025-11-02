import { useState } from 'react'
import { Users, AlertCircle, CheckCircle, Loader } from 'lucide-react'

const BatchRegister = () => {
  const [formData, setFormData] = useState({
    degree: 'btech',
    year: '1',
    branch: 'cs',
    startRoll: '',
    endRoll: ''
  })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

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

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    setError('')
    setResult(null)
  }

  const generateRollNumber = (rollNum) => {
    const degreePrefix = degrees.find(d => d.value === formData.degree)?.prefix || '1'
    const yearCode = years.find(y => y.value === formData.year)?.code || '25'
    const branch = formData.branch
    const paddedRoll = String(rollNum).padStart(4, '0')
    
    return `${degreePrefix}${yearCode}${branch}${paddedRoll}`
  }

  const generateEmail = (rollNumber) => {
    return `${rollNumber}@iiitk.ac.in`
  }

  const generatePassword = (rollNumber) => {
    return `${rollNumber}@lib`
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setResult(null)

    const startRoll = parseInt(formData.startRoll)
    const endRoll = parseInt(formData.endRoll)

    // Validation
    if (!formData.startRoll || !formData.endRoll) {
      setError('Please enter both start and end roll numbers')
      return
    }

    if (isNaN(startRoll) || isNaN(endRoll)) {
      setError('Roll numbers must be valid numbers')
      return
    }

    if (startRoll > endRoll) {
      setError('Start roll number must be less than or equal to end roll number')
      return
    }

    if (endRoll - startRoll > 100) {
      setError('Cannot register more than 100 users at once')
      return
    }

    setLoading(true)

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

      setResult({
        success: true,
        message: `Successfully registered ${users.length} users. Welcome emails with temporary passwords have been sent to all students.`,
        count: users.length,
        sample: users[0]
      })

      // Reset form
      setFormData({
        degree: 'btech',
        year: '1',
        branch: 'cs',
        startRoll: '',
        endRoll: ''
      })

    } catch (err) {
      setError(err.message || 'An error occurred while registering users')
    } finally {
      setLoading(false)
    }
  }

  // Preview roll number generation
  const previewRollNumber = formData.startRoll ? generateRollNumber(parseInt(formData.startRoll)) : ''
  const previewEmail = previewRollNumber ? generateEmail(previewRollNumber) : ''
  const previewPassword = previewRollNumber ? generatePassword(previewRollNumber) : ''

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Batch Register Students</h1>
        <p className="text-gray-600">Register multiple students with auto-generated credentials</p>
      </div>

      {/* Success Message */}
      {result && result.success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start">
            <CheckCircle className="h-5 w-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-green-800 font-medium">{result.message}</h3>
              <p className="text-green-700 text-sm mt-1">
                Sample: {result.sample.email} / Password: {generatePassword(result.sample.rollNumber)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-600 mr-3" />
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      )}

      {/* Batch Form */}
      <form onSubmit={handleSubmit} className="card">
        <div className="flex items-center mb-6">
          <div className="flex-shrink-0 p-3 bg-blue-100 rounded-lg">
            <Users className="h-6 w-6 text-blue-600" />
          </div>
          <div className="ml-4">
            <h2 className="text-lg font-medium text-gray-900">Student Information</h2>
            <p className="text-sm text-gray-500">Configure batch registration parameters</p>
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
              value={formData.degree}
              onChange={handleChange}
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
              value={formData.year}
              onChange={handleChange}
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
              value={formData.branch}
              onChange={handleChange}
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
              value={formData.startRoll}
              onChange={handleChange}
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
              value={formData.endRoll}
              onChange={handleChange}
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
              <p><span className="font-medium">Total Students:</span> {formData.endRoll && formData.startRoll ? parseInt(formData.endRoll) - parseInt(formData.startRoll) + 1 : 0}</p>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex items-center gap-2"
          >
            {loading ? (
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
            <p><span className="font-medium">Format:</span> [Degree][Year][Branch][RollNo]</p>
            <p><span className="font-medium">Email:</span> [rollnumber]@iiitk.ac.in</p>
            <p><span className="font-medium">Degree Prefix:</span> B.Tech = 1, Dual = 5</p>
            <p><span className="font-medium">Year Code:</span> 1st = 25, 2nd = 24, 3rd = 23, 4th = 22</p>
            <p><span className="font-medium">Branch Codes:</span> CS, ECE, ME, AD</p>
            <p className="mt-2 pt-2 border-t border-gray-300">
              <span className="font-medium">Example:</span> 125cs0003@iiitk.ac.in
            </p>
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
            <p className="mt-3 pt-2 border-t border-blue-300">
              <span className="font-medium">Note:</span> Students must change their password on first login for security.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BatchRegister
