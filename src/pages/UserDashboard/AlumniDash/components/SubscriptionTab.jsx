import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import SubscriptionPaymentModal from './SubscriptionPaymentModal'

const API_BASE_URL = import.meta.env.VITE_SERVER_URL
const SUBSCRIPTION_AMOUNT = 1 // KSh per year

export default function SubscriptionTab({ user }) {
  const [subscriptionHistory, setSubscriptionHistory] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedYear, setSelectedYear] = useState(null)
  const [currentYear] = useState(new Date().getFullYear())

  useEffect(() => {
    fetchSubscriptionHistory()
  }, [])

  const fetchSubscriptionHistory = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(
        `${API_BASE_URL}/alumni/${user._id}/subscription-history`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      )

      const data = await response.json()

      if (response.ok) {
        setSubscriptionHistory(data.data.subscriptionPayments || [])
      } else {
        toast.error(data.message || 'Failed to load subscription history')
      }
    } catch (error) {
      console.error('Error fetching subscription history:', error)
      toast.error('Failed to load subscription history')
    } finally {
      setIsLoading(false)
    }
  }

  const getPaymentStatus = (payment) => {
    if (payment.status === 'paid') {
      return {
        label: 'PAID',
        color: '#10b981',
        bgColor: '#d1fae5'
      }
    } else if (payment.status === 'expired') {
      return {
        label: 'EXPIRED',
        color: '#ef4444',
        bgColor: '#fee2e2'
      }
    } else {
      return {
        label: 'PENDING',
        color: '#f59e0b',
        bgColor: '#fef3c7'
      }
    }
  }

  const handlePaymentSuccess = () => {
    setShowPaymentModal(false)
    setSelectedYear(null)
    // Refresh subscription history
    setTimeout(() => {
      fetchSubscriptionHistory()
    }, 2000)
  }

  // Get all years from 2017 to 5 years in future
  const getAllYears = () => {
    const years = []
    for (let year = 2017; year <= currentYear + 5; year++) {
      years.push(year)
    }
    return years.reverse() // Newest first
  }

  // Get payment status for a specific year
  const getYearPaymentStatus = (year) => {
    const payment = subscriptionHistory.find(p => p.year === year)
    if (!payment) {
      return { status: 'unpaid', label: 'Not Paid', color: '#d32f2f', bgColor: '#ffebee' }
    }
    if (payment.status === 'paid') {
      return { status: 'paid', label: 'PAID', color: '#2b8a3e', bgColor: '#e8f5e9' }
    } else if (payment.status === 'expired') {
      return { status: 'expired', label: 'EXPIRED', color: '#d32f2f', bgColor: '#ffebee' }
    }
    return { status: 'pending', label: 'PENDING', color: '#f59e0b', bgColor: '#fef3c7' }
  }

  // Scroll handlers
  const scroll = (direction) => {
    const container = scrollContainerRef.current
    if (container) {
      const scrollAmount = 300
      if (direction === 'left') {
        container.scrollBy({ left: -scrollAmount, behavior: 'smooth' })
      } else {
        container.scrollBy({ left: scrollAmount, behavior: 'smooth' })
      }
    }
  }

  const isPastYear = (year) => year < currentYear
  const allYears = getAllYears()

  const formatDate = (date) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-t-2 mx-auto mb-4" style={{ borderColor: 'var(--color-primary-gold)' }}></div>
          <p className="text-gray-600">Loading subscription history...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 rounded-lg">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2" style={{ color: 'var(--color-primary-dark)' }}>
          Annual Subscription
        </h2>
        <p className="text-gray-600">KSh 1,000 per year - Select a year to pay</p>
      </div>

      {/* Year Cards - Vertical Stack (Full Width) */}
      <div className="space-y-4 mb-8">
        <AnimatePresence>
          {allYears.map((year, idx) => {
            const paymentInfo = getYearPaymentStatus(year)
            const isPast = isPastYear(year)
            const isCurrent = year === currentYear
            const payment = subscriptionHistory.find(p => p.year === year)

            return (
              <motion.div
                key={year}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`w-full p-6 rounded-lg border-l-4 transition-all ${isCurrent ? 'bg-white' : isPast ? 'bg-gray-50' : 'bg-white'
                  }`}
                style={{
                  borderColor: isCurrent ? 'var(--color-primary-gold)' : paymentInfo.color,
                  opacity: isPast && !payment ? 0.7 : 1
                }}
              >
                <div className="flex items-center justify-between">
                  {/* Year and Status */}
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <h3 className="text-2xl font-bold" style={{ color: 'var(--color-primary-dark)' }}>
                        {year}
                      </h3>
                      {isCurrent && (
                        <span className="text-xs font-bold px-3 py-1 rounded" style={{ backgroundColor: '#fef08a', color: '#854d0e' }}>
                          CURRENT YEAR
                        </span>
                      )}
                      <span
                        className="px-3 py-1 rounded-full text-xs font-bold"
                        style={{ color: paymentInfo.color, backgroundColor: paymentInfo.bgColor }}
                      >
                        {paymentInfo.label}
                      </span>
                    </div>

                    {/* Payment Details for Paid Years */}
                    {payment && payment.status === 'paid' ? (
                      <div className="text-sm text-gray-600">
                        <p>✓ Paid on {formatDate(payment.paymentDate)}</p>
                        {payment.transactionId && (
                          <p className="text-xs text-gray-500">Transaction ID: {payment.transactionId}</p>
                        )}
                      </div>
                    ) : isPast ? (
                      <p className="text-sm text-gray-500">No payment recorded</p>
                    ) : (
                      <p className="text-sm text-gray-600">Amount: <span className="font-bold" style={{ color: 'var(--color-primary-gold)' }}>KSh {SUBSCRIPTION_AMOUNT.toLocaleString()}</span></p>
                    )}
                  </div>

                  {/* Action Button - Only for Current and Future Years */}
                  <div className="ml-4">
                    {!isPast && (!payment || payment.status !== 'paid') ? (
                      <button
                        onClick={() => {
                          setSelectedYear(year)
                          setShowPaymentModal(true)
                        }}
                        className="px-6 py-2 rounded-lg font-semibold text-white transition-all hover:opacity-90 whitespace-nowrap"
                        style={{ backgroundColor: 'var(--color-primary-gold)' }}
                      >
                        Pay Now
                      </button>
                    ) : payment && payment.status === 'paid' ? (
                      <div className="px-6 py-2 rounded-lg font-semibold text-white text-center whitespace-nowrap" style={{ backgroundColor: '#2b8a3e' }}>
                        ✓ Active
                      </div>
                    ) : null}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {/* Summary Stats */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="p-4 rounded-lg" style={{ backgroundColor: '#f9f9f9', borderLeft: '4px solid var(--color-primary-gold)' }}>
          <p className="text-sm text-gray-600 mb-1">Paid Years</p>
          <p className="text-2xl font-bold" style={{ color: 'var(--color-primary-dark)' }}>
            {subscriptionHistory.filter(p => p.status === 'paid').length}
          </p>
        </div>
        <div className="p-4 rounded-lg" style={{ backgroundColor: '#f9f9f9', borderLeft: '4px solid #f59e0b' }}>
          <p className="text-sm text-gray-600 mb-1">Current Year</p>
          <p className="text-2xl font-bold" style={{ color: 'var(--color-primary-dark)' }}>
            {currentYear}
            {subscriptionHistory.find(p => p.year === currentYear && p.status === 'paid') && (
              <span className="text-sm font-normal text-green-600 block">✓ Active</span>
            )}
          </p>
        </div>
        <div className="p-4 rounded-lg" style={{ backgroundColor: '#f9f9f9', borderLeft: '4px solid #2b8a3e' }}>
          <p className="text-sm text-gray-600 mb-1">Subcription Fee (Per Year)</p>
          <p className="text-2xl font-bold" style={{ color: 'var(--color-primary-dark)' }}>
            KSh {(subscriptionHistory.filter(p => p.status === 'paid').length * SUBSCRIPTION_AMOUNT).toLocaleString()}
          </p>
        </div>
      </motion.div>

      {/* Alternative Payment Methods Notice */}
      <div className="mt-4 p-4 rounded-lg bg-blue-50 border border-blue-200">
        <p className="text-sm text-blue-700">
          <strong>Need to pay via bank transfer, cash, or cheque?</strong> Please contact the administrator to complete your payment and activate your profile visibility.
        </p>
        <div>
          <p className='flex justify-between text-sm text-blue-700'>
            <span>Phone:</span>
            <span className='font-bold'>+254 746 139 413</span>
          </p>
          <p className='flex justify-between text-sm text-blue-700'>
            <span>Email:</span>
            <span className='font-bold'>info@zoezi.co.ke</span>
          </p>
          <p className='flex justify-between text-sm text-blue-700'>
            <span>Address:</span>
            <span className='font-bold'>11th Floor, Development House</span>
          </p>
        </div>
      </div>

      {/* Payment Modal */}
      <AnimatePresence>
        {showPaymentModal && selectedYear && (
          <SubscriptionPaymentModal
            user={user}
            selectedYear={selectedYear}
            onClose={() => setShowPaymentModal(false)}
            onSuccess={handlePaymentSuccess}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
