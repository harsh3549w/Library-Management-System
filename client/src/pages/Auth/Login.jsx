import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { User, Lock, AlertCircle, Eye, EyeOff } from 'lucide-react'
import { login, clearPasswordChangeRequirement } from '../../store/slices/authSlice'
import { CLOUDINARY_IMAGES } from '../../config/cloudinaryUrls'
import './style.css'

// IIITDM logo component
const IIITDMLogo = () => (
  <div className="relative">
    {/* White background for better contrast - only on desktop */}
    <div className="hidden sm:block absolute inset-0 bg-white rounded-full" />
    <img
      src={CLOUDINARY_IMAGES.logo}
      alt="IIITDM Logo"
      className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-2 border-gray-400 shadow-lg object-cover relative z-10"
      loading="eager"
      decoding="async"
    />
  </div>
)

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { loading, isAuthenticated, error, requiresPasswordChange, tempUser } = useSelector((s) => s.auth)

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard')
    if (requiresPasswordChange && tempUser) {
      navigate('/first-time-login-otp', { 
        state: { 
          email: tempUser.email,
          message: 'Password change required for first-time login. Please verify OTP and set a new password.' 
        } 
      })
      dispatch(clearPasswordChangeRequirement())
    }
  }, [isAuthenticated, navigate, requiresPasswordChange, tempUser, dispatch])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((p) => ({ ...p, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    dispatch(login(formData))
  }

  return (
    <div className="min-h-screen w-full flex flex-col sm:block items-center justify-start sm:justify-center relative px-4 pt-8 pb-8 sm:py-6">
      {/* Blurred background image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
       
      />
      <div className="absolute inset-0 bg-page-overlay" />

      {/* Logo - positioned absolutely on desktop, in flow on mobile */}
      <div className="sm:absolute sm:top-6 sm:right-6 relative z-10 mb-6 sm:mb-0">
        <IIITDMLogo />
      </div>

      {/* Container for centered form */}
      <div className="relative z-10 w-full max-w-[450px] sm:absolute sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2">
        <div className="w-full bg-login-card backdrop-blur-md border-2 border-login-card rounded-3xl shadow-2xl p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="flex flex-col justify-center space-y-5 sm:space-y-6 py-4">
          <div className="relative">
            <div className="bg-login-input border-2 border-gray-400/30 rounded-3xl h-14 sm:h-16 flex items-center px-4 sm:px-6 transition-all duration-200 hover:border-gray-400/50 focus-within:border-gray-400/70">
              <User className="w-5 h-5 text-login-text-primary mr-3 sm:mr-4 flex-shrink-0" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email"
                className="bg-transparent border-none text-login-text-primary placeholder:text-login-text-secondary text-sm sm:text-base font-normal focus:outline-none p-0 h-auto w-full"
                required
              />
            </div>
          </div>

          <div className="relative">
            <div className="bg-login-input border-2 border-gray-400/30 rounded-3xl h-14 sm:h-16 flex items-center px-4 sm:px-6 transition-all duration-200 hover:border-gray-400/50 focus-within:border-gray-400/70">
              <Lock className="w-5 h-5 text-login-text-primary mr-3 sm:mr-4 flex-shrink-0" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
                className="bg-transparent border-none text-login-text-primary placeholder:text-login-text-secondary text-sm sm:text-base font-normal focus:outline-none p-0 h-auto w-full"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="ml-2 text-login-text-primary hover:text-gray-600 focus:outline-none transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-login-button hover:bg-login-button-hover border-2 border-gray-400/30 rounded-3xl h-14 sm:h-16 text-login-text-primary text-xl sm:text-2xl font-semibold transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>

          {error && (
            <div className="bg-red-100/90 border border-red-400 rounded-2xl p-3 flex items-center justify-center text-red-700 text-xs sm:text-sm">
              <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
              <span className="break-words">{error}</span>
            </div>
          )}

          <div className="text-center">
            <Link to="/forgot-password" className="text-blue-600 text-xs sm:text-sm font-medium hover:underline transition-all duration-200">
              Forgot your password?
            </Link>
          </div>
        </form>
      </div>
      </div>
    </div>
  )
}

export default Login
