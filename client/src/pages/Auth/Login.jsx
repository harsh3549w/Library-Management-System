import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { User, Lock, AlertCircle } from 'lucide-react'
import { login } from '../../store/slices/authSlice'
import bgImage from './rectangle-1.png.jpeg'
import './style.css'
import iiitdmLogo from './iiitdm-logo.jpeg'

// Updated IIITDM logo component to use the uploaded image
const IIITDMLogo = () => (
  <div className="absolute top-6 right-6 z-10">
    <img
      src={iiitdmLogo}
      alt="IIITDM Logo"
      className="w-28 h-28 bg-white/90 backdrop-blur-sm rounded-full border-2 border-gray-400 shadow-lg object-cover"
    />
  </div>
)

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' })
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { loading, isAuthenticated, error } = useSelector((s) => s.auth)

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard')
  }, [isAuthenticated, navigate])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((p) => ({ ...p, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    dispatch(login(formData))
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative">
      {/* Blurred background */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: `url(${bgImage})`,
          filter: 'blur(4px)',
          transform: 'scale(1.1)' // Slight scale to hide blur edges
        }}
      />
  <div className="absolute inset-0 bg-page-overlay" />

      <IIITDMLogo />

      <div className="relative z-10 w-[450px] h-[420px] bg-login-card backdrop-blur-md border-2 border-login-card rounded-3xl shadow-2xl p-8">
        <form onSubmit={handleSubmit} className="h-full flex flex-col justify-center space-y-6">
          <div className="relative">
            <div className="bg-login-input border-2 border-gray-400/30 rounded-3xl h-16 flex items-center px-6 transition-all duration-200 hover:border-gray-400/50 focus-within:border-gray-400/70">
              <User className="w-5 h-5 text-login-text-primary mr-4 flex-shrink-0" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email"
                className="bg-transparent border-none text-login-text-primary placeholder:text-login-text-secondary text-base font-normal focus:outline-none p-0 h-auto w-full"
                required
              />
            </div>
          </div>

          <div className="relative">
            <div className="bg-login-input border-2 border-gray-400/30 rounded-3xl h-16 flex items-center px-6 transition-all duration-200 hover:border-gray-400/50 focus-within:border-gray-400/70">
              <Lock className="w-5 h-5 text-login-text-primary mr-4 flex-shrink-0" />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
                className="bg-transparent border-none text-login-text-primary placeholder:text-login-text-secondary text-base font-normal focus:outline-none p-0 h-auto w-full"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-login-button hover:bg-login-button-hover border-2 border-gray-400/30 rounded-3xl h-16 text-login-text-primary text-2xl font-semibold transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>

          {error && (
            <div className="bg-red-100/90 border border-red-400 rounded-2xl p-3 flex items-center justify-center text-red-700 text-sm">
              <AlertCircle className="w-4 h-4 mr-2" />
              {error}
            </div>
          )}

          <div className="text-center">
            <Link to="/forgot-password" className="text-blue-600 text-sm font-medium hover:underline transition-all duration-200">
              Forgot your password?
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Login
