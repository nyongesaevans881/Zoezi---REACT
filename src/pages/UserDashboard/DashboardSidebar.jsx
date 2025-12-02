import { FaUser, FaCog, FaEye, FaWallet, FaSignOutAlt, FaBars, FaTimes, FaAward, FaUsers, FaSwatchbook, FaGraduationCap, FaMoneyBillWave } from 'react-icons/fa'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { TbTableImport } from 'react-icons/tb'

export default function DashboardSidebar({ userData, onLogout, userType }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = searchParams.get('tab') || 'profile'

  const handleTabClick = (tab) => {
    setSearchParams({ tab })
    setIsMobileOpen(false)
  }

  // Define navigation based on user type
  const getNavItems = () => {
    const baseItems = [
      { icon: FaUser, label: 'Dashboard', id: 'profile' },
      { icon: FaCog, label: 'Settings', id: 'settings' }
    ]

    if (userType === 'alumni') {
      return [
        ...baseItems,
        { icon: FaWallet, label: 'Subscription', id: 'subscription' },
        { icon: FaAward, label: 'CPD Records', id: 'cpd', condition: userData?.verified },
        { icon: FaEye, label: 'Preview Profile', id: 'preview' }
      ]
    } else if (userType === 'student') {
      const studentItems = [
        ...baseItems,
        { icon: FaWallet, label: 'My Courses', id: 'courses' },
        { icon: FaGraduationCap, label: 'Certifications', id: 'certifications' }
      ]
      
      // Add dynamic course tabs for enrolled courses
      if (userData?.courses && userData.courses.length > 0) {
        userData.courses.forEach(course => {
          studentItems.push({
            icon: FaSwatchbook,
            label: course.name || `Course`,
            id: `course-${course.courseId}`,
            isCourseName: true
          })
        })
      }
      
      return studentItems
    } else if (userType === 'tutor') {
      return [
        ...baseItems,
        { icon: FaWallet, label: 'My Courses', id: 'courses' },
        { icon: FaUsers, label: 'My Students', id: 'mystudents' },
        { icon: FaSwatchbook, label: 'Curriculum', id: 'curriculum' },
        { icon: TbTableImport, label: 'Timetables', id: 'groupcurriculum' },
        { icon: FaGraduationCap, label: 'Certification', id: 'certification' },
        { icon: FaMoneyBillWave, label: 'Settlements', id: 'settlements' }
      ]
    }

    return baseItems
  }

  const navItems = getNavItems()

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="fixed bottom-5 left-4 md:hidden z-9999 p-2 rounded-lg bg-brand-gold text-white font-bold flex items-center gap-2"
      >
        {isMobileOpen ? (
          <>
            <FaTimes size={24} /> Close Menu
          </>
        ) : (
          <>
            <FaBars size={24} /> Open Menu
          </>
        )}
      </button>

      {/* Sidebar */}
      <motion.aside
        className="fixed left-0 top-0 h-screen w-72 bg-brand-dark text-white overflow-y-auto z-40 pt-8 px-6 md:pt-10 md:px-8"
        initial={{ x: -300 }}
        animate={{ x: isMobileOpen || window.innerWidth >= 768 ? 0 : -300 }}
        transition={{ duration: 0.3 }}
      >
        {/* Profile Section */}
        <div className="mb-8 pb-8 border-b border-brand-gold">
          <div className="flex items-center gap-4">
            <img
              src={userData?.profilePicture.url || '/placeholder-profile.jpg'}
              alt={`${userData?.firstName} ${userData?.lastName}`}
              className="w-16 h-16 rounded-full border-3 border-brand-gold object-cover flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-sm truncate">
                {userData?.firstName} {userData?.lastName}
              </h4>
              <p className="text-xs text-text-light capitalize">
                {userType}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-2 mb-8">
          {navItems.map((item) => {
            // Skip item if condition is false
            if (item.condition === false) return null
            return (
              <NavButton
                key={item.id}
                icon={item.icon}
                label={item.label}
                isActive={activeTab === item.id}
                onClick={() => handleTabClick(item.id)}
                isCourseName={item.isCourseName}
              />
            )
          })}
        </nav>

        {/* Logout Button */}
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg transition-all font-medium text-sm bg-red-600 hover:bg-red-700 text-white cursor-pointer"
        >
          <FaSignOutAlt /> Logout
        </button>
      </motion.aside>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </>
  )
}

function NavButton({ icon: Icon, label, isActive, onClick, isCourseName }) {
  return (
    <button
      onClick={onClick}
      className={`cursor-pointer w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all font-medium text-sm ${
        isActive
          ? 'bg-brand-gold text-brand-dark'
          : 'text-white hover:opacity-80'
      } ${isCourseName ? 'pl-8 text-sm' : ''}`}
    >
      <Icon className="flex-shrink-0" /> <span className="truncate">{label}</span>
    </button>
  )
}
