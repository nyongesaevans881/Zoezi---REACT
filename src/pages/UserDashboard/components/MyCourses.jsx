import React, { useEffect, useState } from 'react'
import { FaClock, FaBook } from 'react-icons/fa'
import MpesaPayment from '../../../components/MpesaPayment'

const API_BASE = import.meta.env.VITE_SERVER_URL

export default function MyCourses({ userData, setUserData }) {
  const [available, setAvailable] = useState([])
  const [enrolled, setEnrolled] = useState(() => userData?.courses || [])
  const [loading, setLoading] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    fetchAvailableCourses()
    fetchEnrolledCourses()
  }, [])

  const fetchEnrolledCourses = async () => {
    if (!userData?._id) return
    try {
      const res = await fetch(`${API_BASE}/users/${userData._id}/courses`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to fetch enrolled courses')
      setEnrolled(data.data || [])
    } catch (err) {
      console.error('Failed to load enrolled courses', err)
    }
  }

  useEffect(() => {
    setEnrolled(userData?.courses || [])
  }, [userData])

  const fetchAvailableCourses = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/courses?courseType=online&limit=100&status=active`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to fetch courses')

      const courses = data.data?.courses || data.data || []
      console.log('Fetched courses:', courses)
      const enrolledIds = new Set(
        (userData?.courses || [])
          .filter(Boolean)
          .map(c => String(c?.courseId || c?._id))
      )
      const filtered = courses.filter(c => !enrolledIds.has(String(c._id)))
      console.log('Available courses after filtering:', filtered)
      setAvailable(filtered)
    } catch (err) {
      console.error('Failed to load courses', err)
    } finally {
      setLoading(false)
    }
  }

  const openEnroll = (course) => {
    setSelectedCourse(course)
    setShowModal(true)
  }

  const handleEnrollSuccess = (enrollRecord) => {
    const updated = [...(enrolled || []), enrollRecord]
    setEnrolled(updated)
    const stored = JSON.parse(localStorage.getItem('user') || '{}')
    stored.courses = updated
    localStorage.setItem('user', JSON.stringify(stored))
    if (setUserData) setUserData(stored)
    setAvailable(prev => prev.filter(c => String(c._id) !== String(enrollRecord.courseId)))
  }

  const handlePaymentSuccess = async (paymentData) => {
    try {
      const res = await fetch(`${API_BASE}/users/enroll`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          userId: userData._id,
          courseId: selectedCourse._id,
          paymentData: paymentData,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Enrollment failed')

      // Refresh enrolled courses from server instead of local-only update
      await fetchEnrolledCourses()
      // refresh available list too
      await fetchAvailableCourses()
      setShowModal(false)
      setSelectedCourse(null)
    } catch (err) {
      console.error('Enrollment error:', err)
      alert('Enrollment failed: ' + err.message)
    }
  }

  return (
    <div className="space-y-8">
      {/* Enrolled Courses Section */}
      <section>
        <h3 className="text-2xl font-bold text-brand-dark mb-4 flex items-center gap-2">
          <FaBook className="text-brand-gold" /> My Enrolled Courses
        </h3>
        {enrolled && enrolled.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrolled.filter(Boolean).map((c) => (
              <div
                key={c?.courseId || c?._id}
                className="border-2 border-brand-gold rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 bg-white"
              >
                <div className="h-40 bg-gradient-to-br from-brand-gold to-brand-yellow flex items-center justify-center">
                  <FaBook className="text-white text-4xl" />
                </div>
                <div className="p-4">
                  <h5 className="font-bold text-lg text-brand-dark mb-2 line-clamp-2">{c?.name || 'Untitled Course'}</h5>
                  <div className="flex items-center gap-2 text-sm text-secondary mb-2">
                    <FaClock className="text-brand-gold" />
                    <span>{c?.duration || '-'} {c?.durationType || ''}</span>
                  </div>
                  <div className="mb-3 pt-2 border-t border-gray-200">
                    <p className="text-xs text-secondary">Payment Status</p>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mt-1 ${
                        (c?.payment?.status || c?.paymentStatus || 'PENDING') === 'PAID'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {c?.payment?.status || c?.paymentStatus || 'PENDING'}
                    </span>
                  </div>
                  <p className="text-xs text-light">
                    Enrolled: {new Date(c?.enrolledAt || c?.timeOfEnrollment || Date.now()).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white border-2 border-gray-200 rounded-xl p-8 text-center">
            <FaBook className="text-brand-gold text-4xl mx-auto mb-3 opacity-50" />
            <p className="text-secondary text-lg">You have not enrolled in any courses yet.</p>
            <p className="text-light text-sm mt-2">Browse available courses below to get started!</p>
          </div>
        )}
      </section>

      {/* Available Courses Section */}
      <section>
        <h3 className="text-2xl font-bold text-brand-dark mb-4 flex items-center gap-2">
          <FaBook className="text-brand-gold" /> Available Online Courses
        </h3>
        {loading ? (
          <div className="bg-white border-2 border-gray-200 rounded-xl p-12 text-center">
            <div className="inline-block">
              <div className="w-10 h-10 border-4 rounded-full animate-spin border-gray-200 border-t-brand-gold"></div>
            </div>
            <p className="text-secondary text-lg mt-4">Loading courses...</p>
          </div>
        ) : available && available.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {available.map((course) => (
              <div
                key={course._id}
                className="border-2 border-gray-200 rounded-xl overflow-hidden hover:shadow-lg hover:border-brand-gold transition-all duration-300 bg-white flex flex-col"
              >
                {/* Course Image */}
                <div className="h-48 bg-gray-200 relative overflow-hidden">
                  {course.coverImage?.url ? (
                    <img
                      src={course.coverImage.url}
                      alt={course.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-brand-gold to-brand-yellow flex items-center justify-center">
                      <FaBook className="text-white text-5xl opacity-80" />
                    </div>
                  )}
                  <div className="absolute top-3 right-3">
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-brand-gold text-white">
                      Online
                    </span>
                  </div>
                </div>

                {/* Course Info */}
                <div className="p-4 flex-1 flex flex-col">
                  <h5 className="font-bold text-lg text-primary mb-2 line-clamp-2">{course.name}</h5>
                  <p className="text-sm text-secondary mb-3 line-clamp-2">{course.description}</p>

                  <div className="flex items-center justify-between text-sm text-secondary mb-3 mt-auto">
                    <div className="flex items-center gap-1">
                      <FaClock className="text-brand-gold" />
                      <span>{course.duration} {course.durationType}</span>
                    </div>
                    <div className="text-right">
                      {course.offerPrice ? (
                        <>
                          <span className="line-through text-light text-xs">KES {course.courseFee?.toLocaleString()}</span>
                          <span className="font-bold text-brand-gold ml-2">KES {course.offerPrice?.toLocaleString()}</span>
                        </>
                      ) : (
                        <span className="font-bold text-brand-gold">KES {course.courseFee?.toLocaleString()}</span>
                      )}
                    </div>
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={() => openEnroll(course)}
                    className="w-full px-4 py-2 rounded-lg font-semibold transition-colors bg-brand-gold text-white hover:bg-brand-yellow border-2 border-brand-gold mt-4 cursor-pointer"
                  >
                    Enroll Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white border-2 border-gray-200 rounded-xl p-8 text-center">
            <FaBook className="text-brand-gold text-4xl mx-auto mb-3 opacity-50" />
            <p className="text-secondary text-lg">No online courses available at the moment.</p>
            <p className="text-light text-sm mt-2">Check back soon for new courses!</p>
          </div>
        )}
      </section>

      {showModal && selectedCourse && userData && (
        <MpesaPayment
          amount={selectedCourse.offerPrice || selectedCourse.courseFee}
          userId={userData._id}
          onClose={() => {
            setShowModal(false)
            setSelectedCourse(null)
          }}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  )
}
