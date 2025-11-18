import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FaEnvelope, FaLock, FaSignInAlt } from 'react-icons/fa'
import toast from 'react-hot-toast'
import './Login.css'

const API_BASE_URL = import.meta.env.VITE_SERVER_URL

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()

    if (!email.trim() || !password.trim()) {
      toast.error('Please enter both email and password')
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Please enter a valid email address')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch(`${API_BASE_URL}/alumni/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Login failed')
      }

      // Store user data and token in localStorage
      localStorage.setItem('user', JSON.stringify(data.data))
      localStorage.setItem('token', data.data.token)

      toast.success('Login successful!')
      navigate('/dashboard')
    } catch (error) {
      console.error('Login error:', error)
      toast.error(error.message || 'Login failed. Please check your credentials.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <motion.div
          className="login-card"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >


          {/* Form */}
          <form onSubmit={handleLogin} className="login-form">
            <h2>Login to Your NZI Account</h2>

            {/* Email Field */}
            <div className="form-group">
              <label htmlFor="email">
                <FaEnvelope /> Email Address
              </label>
              <input
                type="email"
                id="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
                disabled={isLoading}
              />
            </div>

            {/* Password Field */}
            <div className="form-group">
              <label htmlFor="password">
                <FaLock /> Password
              </label>
              <div className="password-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="login-btn"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="spinner-small"></div>
                  Logging in...
                </>
              ) : (
                <>
                  <FaSignInAlt /> Login
                </>
              )}
            </button>

            {/* Forgot Password Link */}
            <button
              type="button"
              className="forgot-password-link"
              onClick={() => navigate('/forgot-password')}
              disabled={isLoading}
            >
              Forgot Password?
            </button>
          </form>

        </motion.div>

        {/* Side Info */}
        <motion.div
          className="login-info"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <div className="info-card">
            <h3>✨ Imprtance of an active NZI Account</h3>
            <ul>
              <li>Certificate Verification</li>
              <li>Online Portfolio / Landing Page</li>
              <li>Appear on Popular Search engines like Google and Bing</li>
              <li>Display contact info to Potential Clients</li>
            </ul>
          </div>

          <div className="info-card">
            <h3>🎧 Need Any Help</h3>
            <p>Reach our support team any time for help.</p>
            <p className='flex justify-between text-sm text-blue-700'>
              <span>Phone:</span>
              <span className='font-bold'>+254 746 139 413</span>
            </p>
            <p className='flex justify-between text-sm text-blue-700'>
              <span>Email:</span>
              <span className='font-bold'>info@zoezi.co.ke</span>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
