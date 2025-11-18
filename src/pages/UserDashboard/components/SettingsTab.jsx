import { FaLock } from 'react-icons/fa'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { useState } from 'react'

const API_BASE_URL = import.meta.env.VITE_SERVER_URL

export default function SettingsTab({ userData }) {
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    showCurrentPassword: false,
    showNewPassword: false,
    showConfirmPassword: false,
  })
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  const handlePasswordFieldChange = (field, value) => {
    setPasswordForm((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const togglePasswordVisibility = (field) => {
    setPasswordForm((prev) => ({
      ...prev,
      [field]: !prev[field],
    }))
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()

    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      toast.error('Please fill in all password fields')
      return
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match')
      return
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    if (passwordForm.newPassword === passwordForm.currentPassword) {
      toast.error('New password must be different from current password')
      return
    }

    setIsChangingPassword(true)
    try {
      const response = await fetch(`${API_BASE_URL}/alumni/${userData._id}/change-password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
          confirmPassword: passwordForm.confirmPassword,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to change password')
      }

      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        showCurrentPassword: false,
        showNewPassword: false,
        showConfirmPassword: false,
      })
      toast.success('Password changed successfully!')
    } catch (error) {
      console.error('Password change error:', error)
      toast.error(error.message || 'Failed to change password')
    } finally {
      setIsChangingPassword(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4 sm:space-y-6"
    >
      <h2 className="text-xl sm:text-2xl font-bold" style={{ color: 'var(--color-primary-dark)' }}>⚙️ Settings</h2>

      <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-bold mb-4 sm:mb-6" style={{ color: 'var(--color-primary-dark)' }}>Change Password</h3>

        <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
          <PasswordInputField
            label="Current Password"
            value={passwordForm.currentPassword}
            onChange={(e) => handlePasswordFieldChange('currentPassword', e.target.value)}
            showPassword={passwordForm.showCurrentPassword}
            onToggle={() => togglePasswordVisibility('showCurrentPassword')}
            placeholder="Enter current password"
          />

          <PasswordInputField
            label="New Password"
            value={passwordForm.newPassword}
            onChange={(e) => handlePasswordFieldChange('newPassword', e.target.value)}
            showPassword={passwordForm.showNewPassword}
            onToggle={() => togglePasswordVisibility('showNewPassword')}
            placeholder="Enter new password"
          />

          <PasswordInputField
            label="Confirm New Password"
            value={passwordForm.confirmPassword}
            onChange={(e) => handlePasswordFieldChange('confirmPassword', e.target.value)}
            showPassword={passwordForm.showConfirmPassword}
            onToggle={() => togglePasswordVisibility('showConfirmPassword')}
            placeholder="Confirm new password"
          />

          <button
            type="submit"
            disabled={isChangingPassword}
            className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2 text-white rounded-lg hover:opacity-90 disabled:opacity-50 transition font-medium w-full mt-6 text-sm sm:text-base"
            style={{ backgroundColor: 'var(--color-primary-gold)', color: 'var(--color-primary-dark)' }}
          >
            <FaLock /> {isChangingPassword ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </motion.div>
  )
}

function PasswordInputField({ label, value, onChange, showPassword, onToggle, placeholder }) {
  return (
    <div>
      <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--color-primary-dark)' }}>{label}</label>
      <div className="relative">
        <input
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full px-3 sm:px-4 py-2 pr-12 border rounded-lg outline-none focus:ring-2 transition text-sm sm:text-base"
          style={{
            borderColor: 'var(--color-text-light)',
            color: 'var(--color-primary-dark)'
          }}
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-lg cursor-pointer hover:opacity-70"
        >
          {showPassword ? '🙈' : '👁️'}
        </button>
      </div>
    </div>
  )
}
