import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, Link } from 'react-router-dom'
import { login } from '../../store/slices/authSlice'
import { Communication } from "./Communication";
import { GeneralLock } from "./GeneralLock";
import rectangle1 from "./rectangle-1.png.jpeg";
import "./style.css";

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { loading, isAuthenticated, error } = useSelector((state) => state.auth)

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard')
    }
  }, [isAuthenticated, navigate])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (formData.email && formData.password) {
      dispatch(login(formData))
    }
  }

  return (
    <div className="frame">
      <div className="iiitdm-logo">
        <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="60" cy="60" r="58" stroke="black" strokeWidth="4" fill="white"/>
          <text x="60" y="40" textAnchor="middle" fontSize="16" fontWeight="bold" fill="black">IIITDM</text>
          <text x="60" y="58" textAnchor="middle" fontSize="12" fill="black">KURNOOL</text>
          <text x="60" y="80" textAnchor="middle" fontSize="8" fill="black">Indian Institute of Information</text>
          <text x="60" y="90" textAnchor="middle" fontSize="8" fill="black">Technology Design &amp; Manufacturing</text>
        </svg>
      </div>

      <div className="div" />

      <form onSubmit={handleSubmit}>
        <div className="div-2">
          <Communication />
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email"
            className="email-input"
            required
          />
        </div>

        <div className="div-3">
          <GeneralLock />
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Password"
            className="password-input"
            required
          />
        </div>

        <button type="submit" className="div-4" disabled={loading}>
          <div className="text-wrapper-3">
            {loading ? 'Logging in...' : 'Login'}
          </div>
        </button>
      </form>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="forgot-password-link">
        <Link to="/forgot-password">Forgot your password?</Link>
      </div>
    </div>
  );
};

export default Login;
