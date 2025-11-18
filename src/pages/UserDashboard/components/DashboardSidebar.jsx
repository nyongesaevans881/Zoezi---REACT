import { FaUser, FaCog, FaEye, FaWallet, FaSignOutAlt, FaBars, FaTimes, FaAward } from 'react-icons/fa'
import { motion } from 'framer-motion'
import { useState } from 'react'

export default function DashboardSidebar({ activeTab, setActiveTab, userData, onLogout }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const handleTabClick = (tab) => {
    setActiveTab(tab)
    setIsMobileOpen(false)
  }

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="fixed bottom-5 left-4 md:hidden z-9999 p-2 rounded-lg" 
        style={{ backgroundColor: 'var(--color-primary-gold)' }}
      >
        {isMobileOpen ? 
        (<div className='flex font-bold items-center'><FaTimes size={24} /> Close Mobile Menu</div>) : 
        (<div className='flex font-bold items-center gap-2'><FaBars size={24} /> Open Mobile Menu</div>)}
      </button>

      {/* Sidebar */}
      <motion.aside
        className="fixed left-0 top-18 max-md:top-8 h-screen w-72 md:w-70 text-white overflow-y-auto z-40 pt-8 px-6 md:pt-10 md:px-8"
        style={{ backgroundColor: 'var(--color-primary-dark)' }}
        initial={{ x: -300 }}
        animate={{ x: isMobileOpen || window.innerWidth >= 768 ? 0 : -300 }}
        transition={{ duration: 0.3 }}
      >
        {/* Profile Section */}
        <div className="mb-8 pb-8 border-b" style={{ borderColor: 'var(--color-primary-gold)' }}>
          <div className="flex items-center gap-4">
            <img
              src={userData.profilePicture || 'https://via.placeholder.com/60'}
              alt={`${userData.firstName} ${userData.lastName}`}
              className="w-16 h-16 rounded-full border-3 object-cover flex-shrink-0"
              style={{ borderColor: 'var(--color-primary-gold)' }}
            />
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-sm truncate">
                {userData.firstName} {userData.lastName}
              </h4>
              <p className="text-xs" style={{ color: 'var(--color-text-light)' }}>
                {userData.practiceStatus?.replace('_', ' ') || 'Alumnus'}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="space-y-2 mb-8">
          <NavButton
            icon={FaUser}
            label="Dashboard"
            isActive={activeTab === 'profile'}
            onClick={() => handleTabClick('profile')}
          />
          <NavButton
            icon={FaWallet}
            label="Subscription"
            isActive={activeTab === 'subscription'}
            onClick={() => handleTabClick('subscription')}
          />
          {userData.verified && (
            <NavButton
              icon={FaAward}
              label="CPD Records"
              isActive={activeTab === 'cpd'}
              onClick={() => handleTabClick('cpd')}
            />
          )}
          <NavButton
            icon={FaCog}
            label="Settings"
            isActive={activeTab === 'settings'}
            onClick={() => handleTabClick('settings')}
          />
          <NavButton
            icon={FaEye}
            label="Preview Profile"
            isActive={activeTab === 'preview'}
            onClick={() => handleTabClick('preview')}
          />
        </nav>

        {/* Logout Button */}
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg transition-all font-medium text-sm hover:opacity-90"
          style={{
            backgroundColor: 'var(--color-error)',
            color: 'white'
          }}
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

function NavButton({ icon: Icon, label, isActive, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all font-medium text-sm ${
        isActive ? 'text-black' : 'hover:opacity-80'
      }`}
      style={{
        backgroundColor: isActive ? 'var(--color-primary-gold)' : 'transparent',
        color: isActive ? 'var(--color-primary-dark)' : 'var(--color-text-white)'
      }}
    >
      <Icon className="flex-shrink-0" /> <span className="truncate">{label}</span>
    </button>
  )
}
