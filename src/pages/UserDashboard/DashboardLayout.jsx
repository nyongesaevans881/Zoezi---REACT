import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import DashboardSidebar from './DashboardSidebar'

const API_BASE_URL = import.meta.env.VITE_SERVER_URL

export default function DashboardLayout({ userType, children }) {
  const navigate = useNavigate()
  const [userData, setUserData] = useState(null)
  const [isLoadingPage, setIsLoadingPage] = useState(true)

  // Load and validate user data on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    const token = localStorage.getItem('token')

    if (!storedUser || !token) {
      toast.error('Please login first')
      navigate('/login')
      return
    }

    try {
      const user = JSON.parse(storedUser)
      // Verify user type matches the dashboard
      const storedUserType = localStorage.getItem('userType')
      if (storedUserType !== userType) {
        toast.error('Access denied: wrong user type')
        navigate('/login')
        return
      }
      setUserData(user)
    } catch (error) {
      console.error('Error loading user data:', error)
      toast.error('Failed to load user data')
      navigate('/login')
    } finally {
      setIsLoadingPage(false)
    }
  }, [userType, navigate])

  const handleLogout = () => {
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    localStorage.removeItem('userType')
    toast.success('Logged out successfully!')
    navigate('/')
  }

  if (isLoadingPage) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-primary">
        <div className="w-10 h-10 border-4 rounded-full animate-spin border-light-gray border-t-brand-gold"></div>
        <p className="font-medium text-primary-dark">Loading dashboard...</p>
      </div>
    )
  }

  if (!userData) {
    return null
  }

  return (
    <div className="flex min-h-screen bg-primary">
      {/* Sidebar */}
      <DashboardSidebar
        userData={userData}
        onLogout={handleLogout}
        userType={userType}
      />

      {/* Main Content */}
      <main className="flex-1 md:ml-72 p-4 sm:p-6 md:p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          {children({ userData, setUserData, handleLogout })}
        </div>
      </main>
    </div>
  )
}
