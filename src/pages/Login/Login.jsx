
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { useAuth } from '../../hooks/useAuth';

const API_BASE_URL = import.meta.env.VITE_SERVER_URL

const USER_TYPES = [
  { value: 'student', label: 'Student' },
  { value: 'tutor', label: 'Tutor' },
  { value: 'alumni', label: 'Alumni' },
]

export default function Login() {
  const navigate = useNavigate()
  const [userType, setUserType] = useState('student')
  const [showRegister, setShowRegister] = useState(false)

  const { login } = useAuth();
  
  // Login form
  const [loginId, setLoginId] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)

  const [showLoginPassword, setShowLoginPassword] = useState(false)
  const [showRegisterPassword, setShowRegisterPassword] = useState(false)

  // Register form
  const [regForm, setRegForm] = useState({
    firstName: '', lastName: '', email: '', phone: '', idNumber: '', dob: '', password: ''
  })
  const [regLoading, setRegLoading] = useState(false)

  // Login handler
const handleLogin = async (e) => {
  e.preventDefault();
  if (!loginId.trim() || !loginPassword.trim()) {
    toast.error('Please enter all fields');
    return;
  }
  setLoginLoading(true);
  try {
    const endpoint = '/auth/login';
    const body = { userType, email: loginId, password: loginPassword };
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Login failed');
    
    // Use the new login function
    login(data.data.user, data.data.token, data.data.user.userType || userType);
    
    toast.success('Login successful!');
    if (data.data.user.userType === 'student') navigate('/student/dashboard');
    else if (data.data.user.userType === 'tutor') navigate('/tutor/dashboard');
    else if (data.data.user.userType === 'alumni') navigate('/alumni/dashboard');
  } catch (err) {
    toast.error(err.message || 'Login failed');
  } finally {
    setLoginLoading(false);
  }
};

  // Register handler
  const handleRegister = async (e) => {
    e.preventDefault()
    for (const key in regForm) {
      if (!regForm[key].trim()) {
        toast.error('Please fill all fields')
        return
      }
    }
    setRegLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(regForm)
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message || 'Registration failed')
      toast.success('Account created! You can now login.')
      setShowRegister(false)
      setRegForm({ firstName: '', lastName: '', email: '', phone: '', idNumber: '', dob: '', password: '' })
    } catch (err) {
      toast.error(err.message || 'Registration failed')
    } finally {
      setRegLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary px-2 py-8">
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-2xl flex flex-col md:flex-row overflow-hidden">
        {/* Image Side */}
        <div className="md:w-1/2 w-full h-64 md:h-auto flex items-center justify-center bg-brand-gold relative">
          <div className='absolute inset-0 bg-black/80 flex flex-col items-center justify-center gap-4'>
            <h2 className='text-3xl text-white font-bold'>Don't have an Account?</h2>
            <p className='mx-5 text-sm text-white text-center text-gray-200'>Create a free account to access all courses offered by the Nairobi Zoezi Institute</p>
            <button type="button" className="text-brand-gold font-semibold border-2 px-4 py-1 rounded-lg cursor-pointer" onClick={() => setShowRegister(true)}>
              Create Student Account
            </button>
          </div>
          <img src="/gallery/3.jpg" alt="Login" className="object-cover w-full h-full" />
        </div>
        {/* Form Side */}
        <div className="md:w-1/2 w-full flex flex-col justify-center p-8">
          <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
            <h2 className="text-3xl font-bold text-gray-600 mb-6 text-center">{showRegister ? 'Create Student Account' : 'Login to NZI'}</h2>
            {/* User Type Selection */}
            {!showRegister && (
              <div className="flex justify-center gap-4 mb-8">
                {USER_TYPES.map(type => (
                  <button
                    key={type.value}
                    className={`cursor-pointer px-6 py-1 rounded-xl font-bold text-lg border-2 transition-colors ${userType === type.value ? 'bg-brand-gold text-white border-brand-gold' : 'bg-light-gray text-brand-dark border-gray-200'}`}
                    onClick={() => setUserType(type.value)}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            )}
            {/* Login Form */}
            {!showRegister && (
              <form onSubmit={handleLogin} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-primary mb-2">Email Address</label>
                  <input
                    type="email"
                    className="w-full px-4 py-3 rounded-lg border-2 border-brand-gold focus:outline-none text-lg"
                    placeholder="Enter email address"
                    value={loginId}
                    onChange={e => setLoginId(e.target.value)}
                    disabled={loginLoading}
                  />
                </div>
                <div className="relative">
                  <label className="block text-sm font-semibold text-primary mb-2">Password</label>
                  <input
                    type={showLoginPassword ? "text" : "password"}
                    className="w-full px-4 py-3 rounded-lg border-2 border-brand-gold focus:outline-none text-lg pr-12"
                    placeholder={userType === 'tutor' || userType === 'alumni' ? 'If first time, use phone number as password' : 'Enter password'}
                    value={loginPassword}
                    onChange={e => setLoginPassword(e.target.value)}
                    disabled={loginLoading}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-14 transform -translate-y-1/2 text-gray-500 hover:text-brand-gold cursor-pointer"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                  >
                    {showLoginPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.59 6.59m9.02 9.02l3.83 3.83" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                <button type="submit" className="w-full py-3 rounded-lg font-bold text-lg bg-brand-gold text-white hover:bg-brand-gold/90 transition-all disabled:opacity-50 cursor-pointer" disabled={loginLoading}>
                  {loginLoading ? 'Logging in...' : 'Login'}
                </button>
                <div className="flex justify-between mt-2">
                  <button type="button" className="text-brand-gold font-semibold cursor-pointer" onClick={() => setShowRegister(true)}>
                    Create Student Account
                  </button>
                  <button type="button" className="text-secondary cursor-pointer font-bold" onClick={() => navigate('/forgot-password')}>
                    Forgot Password?
                  </button>
                </div>
              </form>
            )}
            {/* Register Form */}
            {showRegister && (
              <form onSubmit={handleRegister} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-primary mb-2">First Name</label>
                    <input type="text" className="w-full px-4 py-3 rounded-lg border-2 border-brand-gold focus:outline-none text-lg" value={regForm.firstName} onChange={e => setRegForm(f => ({ ...f, firstName: e.target.value }))} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-primary mb-2">Last Name</label>
                    <input type="text" className="w-full px-4 py-3 rounded-lg border-2 border-brand-gold focus:outline-none text-lg" value={regForm.lastName} onChange={e => setRegForm(f => ({ ...f, lastName: e.target.value }))} />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-primary mb-2">Email</label>
                    <input type="email" className="w-full px-4 py-3 rounded-lg border-2 border-brand-gold focus:outline-none text-lg" value={regForm.email} onChange={e => setRegForm(f => ({ ...f, email: e.target.value }))} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-primary mb-2">Phone</label>
                    <input type="text" className="w-full px-4 py-3 rounded-lg border-2 border-brand-gold focus:outline-none text-lg" value={regForm.phone} onChange={e => setRegForm(f => ({ ...f, phone: e.target.value }))} />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-primary mb-2">ID Number</label>
                    <input type="text" className="w-full px-4 py-3 rounded-lg border-2 border-brand-gold focus:outline-none text-lg" value={regForm.idNumber} onChange={e => setRegForm(f => ({ ...f, idNumber: e.target.value }))} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-primary mb-2">Date of Birth</label>
                    <input type="date" className="w-full px-4 py-3 rounded-lg border-2 border-brand-gold focus:outline-none text-lg" value={regForm.dob} onChange={e => setRegForm(f => ({ ...f, dob: e.target.value }))} />
                  </div>
                </div>
                <div className="relative">
                  <label className="block text-sm font-semibold text-primary mb-2">Password</label>
                  <input
                    type={showRegisterPassword ? "text" : "password"}
                    className="w-full px-4 py-3 rounded-lg border-2 border-brand-gold focus:outline-none text-lg pr-12"
                    value={regForm.password}
                    onChange={e => setRegForm(f => ({ ...f, password: e.target.value }))}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-14 transform -translate-y-1/2 text-gray-500 hover:text-brand-gold cursor-pointer"
                    onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                  >
                    {showRegisterPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.59 6.59m9.02 9.02l3.83 3.83" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                <button type="submit" className="w-full py-3 rounded-lg font-bold text-lg bg-brand-gold text-white hover:bg-brand-gold/90 transition-all disabled:opacity-50 cursor-pointer" disabled={regLoading}>
                  {regLoading ? 'Creating Account...' : 'Create Account'}
                </button>
                <div className="flex justify-center mt-2">
                  <button type="button" className="cursor-pointer text-brand-dark font-semibold" onClick={() => setShowRegister(false)}>
                    Back to Login
                  </button>
                </div>
              </form>
            )}
            {/* Info for tutors/alumni login */}
            {!showRegister && (
              <div className="mt-6 text-center text-sm text-secondary">
                <span className="font-bold text-brand-gold">Note:</span> If first time login as Tutor or Alumni, use your phone number as password.
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}
