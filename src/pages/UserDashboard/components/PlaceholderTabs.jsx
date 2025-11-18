import { motion } from 'framer-motion'
import { FaWallet, FaEye } from 'react-icons/fa'

export function SubscriptionTab() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4 sm:space-y-6"
    >
      <h2 className="text-xl sm:text-2xl font-bold" style={{ color: 'var(--color-primary-dark)' }}>💳 Subscription & Billing</h2>
      
      <div className="bg-white rounded-lg shadow-sm p-8 sm:p-12 text-center">
        <FaWallet size={48} className="mx-auto mb-3 sm:mb-4" style={{ color: 'var(--color-primary-gold)' }} />
        <h3 className="text-lg sm:text-xl font-bold mb-2" style={{ color: 'var(--color-primary-dark)' }}>Subscription Management</h3>
        <p style={{ color: 'var(--color-primary-brown)' }} className="text-sm sm:text-base">
          Subscription features coming soon. Here you'll be able to manage your profile visibility and payment plans.
        </p>
      </div>
    </motion.div>
  )
}

export function PreviewTab() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4 sm:space-y-6"
    >
      <h2 className="text-xl sm:text-2xl font-bold" style={{ color: 'var(--color-primary-dark)' }}> Public Profile Preview</h2>
      
      <div className="bg-white rounded-lg shadow-sm p-8 sm:p-12 text-center">
        <FaEye size={48} className="mx-auto mb-3 sm:mb-4" style={{ color: 'var(--color-primary-gold)' }} />
        <h3 className="text-lg sm:text-xl font-bold mb-2" style={{ color: 'var(--color-primary-dark)' }}>Profile Preview</h3>
      </div>
    </motion.div>
  )
}
