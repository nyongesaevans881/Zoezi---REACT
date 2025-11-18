import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FaCalendar, FaCheckCircle, FaTimesCircle, FaAward } from 'react-icons/fa'
import toast from 'react-hot-toast'

const API_BASE_URL = import.meta.env.VITE_SERVER_URL

export default function CPDHistoryTab({ user }) {
  const [cpdRecords, setCpdRecords] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?._id) {
      fetchCpdHistory()
    }
  }, [user])

  const fetchCpdHistory = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/alumni/${user._id}/cpd-history`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch CPD history')
      }

      const data = await response.json()
      setCpdRecords(data.data || [])
    } catch (error) {
      console.error('Error fetching CPD history:', error)
      toast.error('Failed to load CPD history')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2" style={{ borderColor: 'var(--color-primary-gold)' }} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-md p-6"
      >
        <div className="flex items-center gap-3 mb-2">
          <FaAward size={24} style={{ color: 'var(--color-primary-gold)' }} />
          <h2 className="text-2xl font-bold" style={{ color: 'var(--color-primary-dark)' }}>
            Continuing Professional Development (CPD)
          </h2>
        </div>
        <p className="text-gray-600">View your CPD exam history and certification status</p>
      </motion.div>

      {/* CPD Records */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="space-y-3"
      >
        {cpdRecords.length > 0 ? (
          cpdRecords.reverse().map((record, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white rounded-lg shadow-md p-6 border-l-4"
              style={{ borderColor: record.result === 'pass' ? '#2b8a3e' : '#d32f2f' }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-xl font-bold" style={{ color: 'var(--color-primary-dark)' }}>
                      {record.year} CPD Exam
                    </h3>
                    {record.result === 'pass' ? (
                      <span className="px-3 py-1 rounded-full text-sm font-bold bg-green-100 text-green-800 flex items-center gap-1">
                        <FaCheckCircle size={14} /> PASS
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-sm font-bold bg-red-100 text-red-800 flex items-center gap-1">
                        <FaTimesCircle size={14} /> FAIL
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
                    <div className="flex items-center gap-2">
                      <FaCalendar size={16} style={{ color: 'var(--color-primary-gold)' }} />
                      <div>
                        <p className="text-xs text-gray-600 font-semibold">Date Taken</p>
                        <p className="font-semibold">
                          {record.dateTaken ? new Date(record.dateTaken).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          }) : 'N/A'}
                        </p>
                      </div>
                    </div>

                    {record.score && (
                      <div className="flex items-center gap-2">
                        <FaAward size={16} style={{ color: 'var(--color-primary-gold)' }} />
                        <div>
                          <p className="text-xs text-gray-600 font-semibold">CPD Points</p>
                          <p className="font-semibold">{record.score}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {record.remarks && (
                    <div className="mt-3 p-3 bg-gray-50 rounded border-l-2" style={{ borderColor: 'var(--color-primary-gold)' }}>
                      <p className="text-xs text-gray-600 font-semibold mb-1">Remarks</p>
                      <p className="text-gray-700">{record.remarks}</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-lg shadow-md p-8 text-center"
          >
            <FaAward size={48} className="mx-auto mb-4 text-gray-300" />
            <p className="text-gray-600 text-lg">No CPD records yet</p>
            <p className="text-sm text-gray-500 mt-2">Your CPD exam history will appear here</p>
          </motion.div>
        )}
      </motion.div>

      {/* Summary Stats */}
      {cpdRecords.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <div className="bg-white rounded-lg shadow-md p-6 text-center border-t-4" style={{ borderColor: 'var(--color-primary-gold)' }}>
            <p className="text-gray-600 text-sm font-semibold mb-1">Total Exams</p>
            <p className="text-3xl font-bold" style={{ color: 'var(--color-primary-dark)' }}>
              {cpdRecords.length}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 text-center border-t-4" style={{ borderColor: '#2b8a3e' }}>
            <p className="text-gray-600 text-sm font-semibold mb-1">Passed</p>
            <p className="text-3xl font-bold text-green-600">
              {cpdRecords.filter(r => r.result === 'pass').length}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 text-center border-t-4" style={{ borderColor: '#d32f2f' }}>
            <p className="text-gray-600 text-sm font-semibold mb-1">Failed</p>
            <p className="text-3xl font-bold text-red-600">
              {cpdRecords.filter(r => r.result === 'fail').length}
            </p>
          </div>
        </motion.div>
      )}
    </div>
  )
}
