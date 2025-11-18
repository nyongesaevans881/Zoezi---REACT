import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AiOutlineClose, AiOutlineLoading3Quarters, AiOutlineCheckCircle } from 'react-icons/ai'
import toast from 'react-hot-toast'

const API_BASE_URL = import.meta.env.VITE_SERVER_URL
const SUBSCRIPTION_AMOUNT = 1 // KSh per year

export default function SubscriptionPaymentModal({ user, selectedYear, onClose, onSuccess }) {
  const [phone, setPhone] = useState('')
  const [checkoutRequestId, setCheckoutRequestId] = useState('')
  const [loading, setLoading] = useState(false)
  const [paymentLoading, setPaymentLoading] = useState(false)
  const [status, setStatus] = useState(false)
  const [error, setError] = useState('')
  const [showStkSuccess, setShowStkSuccess] = useState(false)

  const totalAmount = SUBSCRIPTION_AMOUNT

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch(`${API_BASE_URL}/mpesa/stk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ 
          phone, 
          amount: totalAmount 
        })
      })

      const data = await response.json()

      if (response.ok) {
        setShowStkSuccess(true)
        setLoading(false)
        setCheckoutRequestId(data.CheckoutRequestID)

        if (!data.CheckoutRequestID) {
          throw new Error('Missing CheckoutRequestID in response')
        }

        // WebSocket connection for real-time payment status
        const ws = new WebSocket(import.meta.env.VITE_SOCKET_URL)

        ws.onopen = () => {
          console.log('[Subscription] WebSocket connected')
          ws.send(JSON.stringify({ action: 'register', checkoutRequestId: data.CheckoutRequestID }))
        }

        ws.onmessage = (event) => {
          const result = JSON.parse(event.data)
          console.log('[Subscription] WebSocket message received:', result)
          handleWebSocketResponse(result, ws)
        }

        ws.onerror = (error) => {
          console.error('[Subscription] WebSocket error:', error)
        }

        ws.onclose = () => {
          console.log('[Subscription] WebSocket connection closed')
        }
      } else {
        throw new Error(data.message || 'Failed to initiate payment')
      }
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  const handleWebSocketResponse = async (result, ws) => {
    if (result.status === 'success') {
      setStatus(true)
      toast.success('Payment Successful!')

      try {
        // Record subscription payment
        const recordResponse = await fetch(
          `${API_BASE_URL}/alumni/${user._id}/subscription-payment`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
              year: selectedYear,
              amount: totalAmount,
              transactionId: result.data?.transactionId || result.data?.TransactionID,
              numberOfYears: 1
            })
          }
        )

        const recordData = await recordResponse.json()

        if (!recordResponse.ok) {
          throw new Error(recordData.message || 'Failed to record payment')
        }

        setTimeout(() => {
          onSuccess()
        }, 2000)
      } catch (error) {
        console.error('[Subscription] Failed to record payment:', error)
        toast.error('Payment received but recording failed. Please contact support.')
        setTimeout(() => {
          onClose()
        }, 3000)
      } finally {
        if (ws && ws.readyState === WebSocket.OPEN) {
          ws.close()
        }
      }
    } else {
      toast.error(result.message)
      setError(result.message)
    }
  }

  const handleCheckPaymentStatus = async () => {
    if (!checkoutRequestId) {
      setError('Missing CheckoutRequestID. Please Initiate payment again.')
      return
    }
    setPaymentLoading(true)

    try {
      const response = await fetch(`${API_BASE_URL}/mpesa/paymentStatus`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ CheckoutRequestId: checkoutRequestId })
      })

      const data = await response.json()
      setPaymentLoading(false)

      if (response.ok) {
        if (data.ResultCode === '0') {
          setStatus(true)
          toast.success('Payment Successful!')

          try {
            const recordResponse = await fetch(
              `${API_BASE_URL}/alumni/${user._id}/subscription-payment`,
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                  year: selectedYear,
                  amount: totalAmount,
                  transactionId: data.TransactionID,
                  numberOfYears: 1
                })
              }
            )

            const recordData = await recordResponse.json()

            if (!recordResponse.ok) {
              throw new Error(recordData.message || 'Failed to record payment')
            }

            setTimeout(() => {
              onSuccess()
            }, 2000)
          } catch (error) {
            console.error('[Subscription] Failed to record payment:', error)
            toast.error('Payment received but recording failed.')
            setTimeout(() => {
              onClose()
            }, 3000)
          }
        } else if (data.ResultCode === '2001') {
          setError('The initiator information was invalid. Please check your PIN and try again')
        } else if (data.ResultCode === '1037') {
          setError('DS Timeout. Please initiate again and respond Quicker')
        } else {
          setError(data.ResultDesc || 'Failed to check payment status')
        }
      } else {
        setError(data.message || 'Failed to check payment status')
      }
    } catch (err) {
      setPaymentLoading(false)
      setError(err.message)
    }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-9000 flex items-center justify-center p-4 bg-black/80">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-white rounded-2xl p-8 max-w-md w-full relative shadow-2xl"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
          >
            <AiOutlineClose className="text-2xl" />
          </button>

          <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-primary-dark)' }}>
            Pay for {selectedYear}
          </h2>
          <p className="text-gray-600 mb-6 text-sm">Activate your profile for year {selectedYear}</p>

          {!status ? (
            <>
              {!showStkSuccess ? (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6 text-center">
                  <p className="text-gray-600 mb-2">Amount to Pay:</p>
                  <p className="text-4xl font-bold mb-2" style={{ color: 'var(--color-primary-gold)' }}>
                    KSh {totalAmount.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600">
                    {selectedYear} subscription
                  </p>
                </div>
              ) : (
                <div className="mb-6">
                  <div className="flex justify-center mb-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-4" style={{ borderColor: 'var(--color-primary-gold)' }}></div>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                    <p className="text-sm text-gray-700 font-medium">
                      An STK has been sent to your phone. Please Enter your PIN to complete the payment
                    </p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {!showStkSuccess && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">M-Pesa Phone Number</label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="254712345678 or 07XXXXXXXX"
                        pattern="^(254|0)[17][0-9]{8}$"
                        title="Please enter a valid phone number"
                        required
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-gray-500 transition-colors"
                      />
                    </div>
                  </>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-4 py-3 rounded-lg font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                  style={{ backgroundColor: 'var(--color-primary-gold)' }}
                >
                  {loading ? (
                    <>
                      <AiOutlineLoading3Quarters className="animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    `${!showStkSuccess ? 'Pay Now' : 'Resend STK'}`
                  )}
                </button>
              </form>

              {error && (
                <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-700 text-center text-sm">{error}</p>
                </div>
              )}

              {showStkSuccess && (
                <button
                  onClick={handleCheckPaymentStatus}
                  disabled={paymentLoading}
                  className="w-full mt-4 px-4 py-3 bg-gray-100 border border-gray-300 text-gray-900 rounded-lg font-medium hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                >
                  {paymentLoading ? (
                    <>
                      <AiOutlineLoading3Quarters className="animate-spin" />
                      <span>Checking...</span>
                    </>
                  ) : (
                    'Check Payment Status'
                  )}
                </button>
              )}
            </>
          ) : (
            <div className="text-center py-8">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', duration: 0.5 }}>
                <AiOutlineCheckCircle className="text-5xl mx-auto mb-4" style={{ color: 'var(--color-primary-gold)' }} />
              </motion.div>
              <h3 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-primary-dark)' }}>
                Payment Successful!
              </h3>
              <p className="text-gray-600 mb-4">Your profile is active for {selectedYear}</p>
              <button
                onClick={onClose}
                className="px-6 py-2 rounded-lg font-semibold text-white transition-all hover:opacity-90"
                style={{ backgroundColor: 'var(--color-primary-gold)' }}
              >
                Close
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
