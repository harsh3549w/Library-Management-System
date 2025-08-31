import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { verifyOTP } from '../../store/slices/authSlice'
import { BookOpen, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

const VerifyOTP = () => {
  const [otp, setOtp] = useState('')
  const [errors, setErrors] = useState({})

  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { loading, isAuthenticated, otpSent, verificationEmail } = useSelector((state) => state.auth)

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard')
    }
    if (!otpSent) {
      navigate('/register')
    }
  }, [isAuthenticated, otpSent, navigate])

  const validateOTP = () => {
    if (!otp.trim()) {
      setErrors({ otp: 'OTP is required' })
      return false
    }
    if (otp.length !== 6) {
      setErrors({ otp: 'OTP must be 6 digits' })
      return false
    }
    setErrors({})
    return true
  }

  const handleChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6)
    setOtp(value)
    if (errors.otp) {
      setErrors({})
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (validateOTP()) {
      dispatch(verifyOTP({ otp, email: verificationEmail }))
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 bg-blue-600 rounded-lg flex items-center justify-center">
            <BookOpen className="h-8 w-8 text-white" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Verify your email
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            We've sent a verification code to your email address
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
              Verification Code
            </label>
            <div className="mt-1">
              <input
                id="otp"
                name="otp"
                type="text"
                autoComplete="one-time-code"
                required
                className={`input-field text-center text-2xl tracking-widest ${errors.otp ? 'border-red-500' : ''}`}
                placeholder="000000"
                value={otp}
                onChange={handleChange}
                maxLength={6}
              />
            </div>
            {errors.otp && <p className="mt-1 text-sm text-red-600">{errors.otp}</p>}
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                'Verify Email'
              )}
            </button>
          </div>

          <div className="text-center">
            <Link
              to="/register"
              className="flex items-center justify-center text-sm text-blue-600 hover:text-blue-500"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to registration
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

export default VerifyOTP
