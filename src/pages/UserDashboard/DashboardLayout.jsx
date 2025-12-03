// Update DashboardLayout.js - FIXED VERSION
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import DashboardSidebar from './DashboardSidebar'
import TopNav from './components/TopNav'
import { useAuth } from '../../hooks/useAuth'

const API_BASE_URL = import.meta.env.VITE_SERVER_URL

export default function DashboardLayout({ userType, children }) {
  const navigate = useNavigate()
  const { user, logout, checkSessionExpiry } = useAuth()
  const [userData, setUserData] = useState(null)
  const [isLoadingPage, setIsLoadingPage] = useState(true)

  useEffect(() => {
    refreshUserData();
  }, [])

  // Check session on mount
  useEffect(() => {
    const token = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')

    if (!token || !storedUser) {
      toast.error('Please login first')
      navigate('/login')
      return
    }

    try {
      const parsedUser = JSON.parse(storedUser)
      const storedUserType = localStorage.getItem('userType')

      if (storedUserType !== userType) {
        toast.error('Access denied: wrong user type')
        navigate('/login')
        return
      }

      setUserData(parsedUser)
      setIsLoadingPage(false)
    } catch (error) {
      console.error('Error loading user data:', error)
      localStorage.clear()
      navigate('/login')
    }
  }, [userType, navigate])

  // In DashboardLayout.js, update the refreshUserData function:
  const refreshUserData = async () => {

    try {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (!token || !storedUser) {
        throw new Error('No token or user found');
      }

      const parsedUser = JSON.parse(storedUser);
      const response = await fetch(`${API_BASE_URL}/auth/user-data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: parsedUser._id,
          userType: localStorage.getItem('userType')
        })
      });


      if (response.ok) {
        toast.success(`Layout Data Updated`);
        const data = await response.json();
        const newUserData = data.data.user;
        setUserData(newUserData);
        localStorage.setItem('user', JSON.stringify(newUserData));
        return newUserData;
      } else {
        throw new Error('Failed to fetch user data');
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
      toast.error('Failed to refresh user data');
      return null;
    }
  };

  // Check session expiry periodically
  useEffect(() => {
    const checkSession = () => {
      if (checkSessionExpiry()) {
        logout()
      }
    }

    const interval = setInterval(checkSession, 60000) // Check every minute
    return () => clearInterval(interval)
  }, [checkSessionExpiry, logout])

  const handleLogout = () => {
    logout()
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

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:ml-72">
        {/* Top Navigation */}
        <TopNav />

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {children({
              userData,
              setUserData,
              handleLogout,
              refreshUserData
            })}
          </div>
        </main>
      </div>
    </div>
  )
}