import React, { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { IoClose } from 'react-icons/io5'
import { FaUsers, FaChalkboardTeacher, FaBook, FaCalendarAlt, FaClipboardCheck, FaGraduationCap, FaPaperclip } from 'react-icons/fa'
import AttachmentPreview from './AttachmentPreview' // Import the reusable component

const ATTACHMENT_TYPES = [
  { value: 'none', label: 'No Attachment', icon: FaBook },
  { value: 'youtube', label: 'YouTube Link', icon: FaBook },
  { value: 'vimeo', label: 'Vimeo Link', icon: FaBook },
  { value: 'mp4', label: 'MP4 Video', icon: FaBook },
  { value: 'pdf', label: 'PDF Document', icon: FaBook },
  { value: 'article', label: 'Article', icon: FaBook },
  { value: 'document', label: 'Document', icon: FaBook }
]

const ITEM_TYPES = {
  lesson: {
    label: 'Lesson',
    color: 'bg-blue-500',
    lightBg: 'bg-blue-50',
    icon: FaBook
  },
  event: {
    label: 'Event',
    color: 'bg-green-500',
    lightBg: 'bg-green-50',
    icon: FaCalendarAlt
  },
  cat: {
    label: 'CAT',
    color: 'bg-orange-500',
    lightBg: 'bg-orange-50',
    icon: FaClipboardCheck
  },
  exam: {
    label: 'Exam',
    color: 'bg-red-500',
    lightBg: 'bg-red-50',
    icon: FaGraduationCap
  }
}

const StudentCourseView = ({ userData, courseId }) => {
  const [group, setGroup] = useState(null)
  const [tutor, setTutor] = useState(null)
  const [courseEnroll, setCourseEnroll] = useState(null)
  const [loading, setLoading] = useState(true)
  const [expandedItemId, setExpandedItemId] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [responseText, setResponseText] = useState('')
  const [attachments, setAttachments] = useState([{ type: 'none', url: '', title: '' }])
  const [isQuestion, setIsQuestion] = useState(false)
  const [isPublic, setIsPublic] = useState(false)

   // Get userType from localStorage
  const userType = localStorage.getItem('userType')

 // Fetch curriculum on mount - UPDATED to include userType
  useEffect(() => {
    const fetchCurriculum = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          toast.error('Not authenticated')
          return
        }

        const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/student-curriculum?courseId=${courseId}&userType=${userType}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        })

        const json = await res.json()
        if (json.status === 'success') {
          setGroup(json.data.group)
          setTutor(json.data.tutor)
          setCourseEnroll(json.data.courseEnroll)
        } else {
          toast.error(json.message || 'Failed to fetch curriculum')
        }
      } catch (err) {
        console.error('Fetch curriculum error:', err)
        toast.error('Failed to fetch curriculum')
      } finally {
        setLoading(false)
      }
    }

    fetchCurriculum()
  }, [courseId, userType])


 // Handle payment notification close - UPDATED to include userType
  const handleHidePaymentNotification = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/student-curriculum/hide-payment-notification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          courseId,
          userType // Add userType to body
        })
      })

      const json = await res.json()
      if (json.status === 'success') {
        setCourseEnroll(prev => ({ ...prev, paymentNotificationHidden: true }))
        toast.success('Notification closed')
      } else {
        toast.error(json.message || 'Failed to hide notification')
      }
    } catch (err) {
      console.error('Hide notification error:', err)
      toast.error('Failed to hide notification')
    }
  }

  // Add attachment field
  const addAttachmentField = () => {
    setAttachments([...attachments, { type: 'none', url: '', title: '' }])
  }

  // Remove attachment field
  const removeAttachmentField = (index) => {
    if (attachments.length > 1) {
      const newAttachments = attachments.filter((_, i) => i !== index)
      setAttachments(newAttachments)
    }
  }

  // Update attachment field
  const updateAttachment = (index, field, value) => {
    const newAttachments = [...attachments]
    newAttachments[index] = { ...newAttachments[index], [field]: value }
    setAttachments(newAttachments)
  }

// Handle response submission - UPDATED to include userType
  const handleSubmitResponse = async (itemId) => {
    if (!responseText.trim()) {
      toast.error('Please enter a response')
      return
    }

    // Validate attachments
    const validAttachments = attachments.filter(att =>
      att.type !== 'none' && att.url.trim() && att.title.trim()
    )

    if (validAttachments.length === 0 && attachments.some(att => att.type !== 'none')) {
      toast.error('Please provide complete attachment details (type, URL, and title)')
      return
    }

    setSubmitting(true)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/student-curriculum/${group._id}/items/${itemId}/respond`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          responseText,
          attachments: validAttachments,
          isQuestion,
          isPublic: isQuestion ? isPublic : false,
          userType // Add userType to body
        })
      })

      const json = await res.json()
      if (json.status === 'success') {
        toast.success('Response submitted successfully')
        setResponseText('')
        setAttachments([{ type: 'none', url: '', title: '' }])
        setIsQuestion(false)
        setIsPublic(false)
        // Refresh group data
        setGroup(json.data.group)
        setExpandedItemId(itemId) // Keep item expanded to show the response
      } else {
        toast.error(json.message || 'Failed to submit response')
      }
    } catch (err) {
      console.error('Submit response error:', err)
      toast.error('Failed to submit response')
    } finally {
      setSubmitting(false)
    }
  }

  // Calculate progress
  const calculateProgress = () => {
    if (!group || !group.curriculumItems || group.curriculumItems.length === 0) return 0
    const completed = group.curriculumItems.filter(item => item.isCompleted).length
    return Math.round((completed / group.curriculumItems.length) * 100)
  }

  // Check if item is released
  const isItemReleased = (item) => {
    if (!item.releaseDate) return true
    try {
      const releaseDateTime = new Date(`${item.releaseDate}T${item.releaseTime || '00:00'}`)
      return new Date() >= releaseDateTime
    } catch (err) {
      return true
    }
  }

  // Check if item is due
  const isItemDue = (item) => {
    if (!item.dueDate) return false
    try {
      const dueDateTime = new Date(`${item.dueDate}T${item.dueTime || '23:59'}`)
      return new Date() >= dueDateTime
    } catch (err) {
      return false
    }
  }

  // Format date/time for display
  const formatDateTime = (dateString, timeString) => {
    if (!dateString) return ''
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return 'Invalid Date'
      const dateOnly = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
      const time = timeString || '00:00'
      return `${dateOnly} at ${time}`
    } catch (err) {
      return 'Invalid Date'
    }
  }

  // Get payment status color
  const getPaymentStatusColor = (status) => {
    const colors = {
      'PAID': 'bg-green-100 text-green-800',
      'PENDING': 'bg-yellow-100 text-yellow-800',
      'FAILED': 'bg-red-100 text-red-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-gold border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading curriculum...</p>
        </div>
      </div>
    )
  }

  if (!group) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
        <h2 className='text-2xl font-bold text-gray-400 mb-4'>
          Pending Assignment
        </h2>
        <p className='text-lg text-gray-600 mb-4'>You have not been assigned to a cohort by your tutor yet</p>
      </div>
    )
  }

  const progress = calculateProgress()
  const showPaymentWidget =
    courseEnroll &&
    !courseEnroll.paymentNotificationHidden &&
    courseEnroll.payment &&
    courseEnroll.payment.status

  return (
    <div className="space-y-6 p-6">
      {/* Group Info Widget */}
      <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-brand-gold">
        <h3 className="text-lg font-semibold text-brand-dark mb-4 flex items-center gap-2">
          <FaUsers /> Your Study Group
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-gray-700 mb-3">Group Details</h4>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Group Name</p>
                <p className="font-medium text-brand-dark">{group.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Group Members</p>
                <p className="font-medium text-brand-dark">{group.students?.length || 0} students</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Curriculum Items</p>
                <p className="font-medium text-brand-dark">{group.curriculumItems?.length || 0} items</p>
              </div>
            </div>
          </div>

          {tutor && (
            <div>
              <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <FaChalkboardTeacher /> Your Tutor
              </h4>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="font-medium text-brand-dark">{tutor.firstName} {tutor.lastName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium text-brand-gold">{tutor.email}</p>
                </div>
                {tutor.phone && (
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="font-medium text-brand-dark">{tutor.phone}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold text-brand-dark">Course Progress</h3>
          <span className="text-2xl font-bold text-brand-gold">{progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-brand-gold to-accent-orange h-3 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          {group.curriculumItems?.filter(i => i.isCompleted).length || 0} of {group.curriculumItems?.length || 0} items completed
        </p>
      </div>

      {/* Payment Notification Widget */}
      {showPaymentWidget && (
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-brand-gold">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h4 className="font-semibold text-brand-dark mb-2">Payment Status</h4>
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPaymentStatusColor(courseEnroll.payment.status)}`}>
                  {courseEnroll.payment.status}
                </span>
                {courseEnroll.payment.paidDate && (
                  <span className="text-sm text-gray-600">
                    Paid on {new Date(courseEnroll.payment.paidDate).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={handleHidePaymentNotification}
              className="text-gray-400 hover:text-gray-600 transition"
              title="Close notification"
            >
              <IoClose size={24} />
            </button>
          </div>
        </div>
      )}

      {/* Curriculum Items */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h4 className="font-semibold text-brand-dark mb-6 text-xl">Course Materials</h4>

        {(!group.curriculumItems || group.curriculumItems.length === 0) ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No curriculum items yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {group.curriculumItems.map((item, idx) => {
              const released = isItemReleased(item)
              const due = isItemDue(item)
              const isExpanded = expandedItemId === item._id
              const type = ITEM_TYPES[item.type] || ITEM_TYPES.lesson
              const TypeIcon = type.icon
              const hasAttachments = item.attachments?.length > 0
              const hasResponses = item.responses?.length > 0

              return (
                <div key={item._id} className={`border rounded-lg overflow-hidden transition-all ${released ? 'border-gray-300 hover:shadow-md' : 'border-gray-200 opacity-60'}`}>
                  {/* Item Header */}
                  <div
                    onClick={() => {
                      if (released) setExpandedItemId(isExpanded ? null : item._id)
                    }}
                    className={`p-5 ${released ? 'hover:bg-gray-50 cursor-pointer' : 'cursor-not-allowed'}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 flex items-start gap-4">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white border border-gray-300 flex items-center justify-center">
                          <span className="text-sm font-semibold text-gray-700">{idx + 1}</span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${type.color} text-white flex items-center gap-1`}>
                              <TypeIcon size={10} /> {type.label}
                            </span>
                            {item.isCompleted && (
                              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                                COMPLETED
                              </span>
                            )}
                            {!released && (
                              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                                UPCOMING
                              </span>
                            )}
                            {due && released && !item.isCompleted && (
                              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                                OVERDUE
                              </span>
                            )}
                          </div>
                          <h5 className="font-semibold text-brand-dark text-lg">{item.name}</h5>

                          {item.description && (
                            <p className="text-sm text-gray-600 mt-2 line-clamp-2">{item.description}</p>
                          )}

                          <div className="flex items-center gap-4 text-xs text-gray-500 mt-3">
                            {hasAttachments && (
                              <span className="flex items-center gap-1">
                                <FaBook size={10} /> {item.attachments.length} attachment{item.attachments.length !== 1 ? 's' : ''}
                              </span>
                            )}
                            {hasResponses && (
                              <span className="flex items-center gap-1">
                                <FaUsers size={10} /> {item.responses.length} response{item.responses.length !== 1 ? 's' : ''}
                              </span>
                            )}
                          </div>

                          {/* Release/Due dates */}
                          <div className="flex gap-6 text-xs text-gray-600 mt-3">
                            {item.releaseDate && (
                              <div className="flex items-center gap-1">
                                <span className="font-medium">Available:</span> {formatDateTime(item.releaseDate, item.releaseTime)}
                              </div>
                            )}
                            {item.dueDate && (
                              <div className="flex items-center gap-1">
                                <span className="font-medium">Due:</span> {formatDateTime(item.dueDate, item.dueTime)}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      {released && (
                        <button className="text-brand-gold hover:text-brand-brown transition text-lg">
                          {isExpanded ? '▼' : '▶'}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Item Details - Expandable */}
                  {isExpanded && released && (
                    <div className="bg-gray-50 border-t border-gray-200 p-6 space-y-6">
                      {/* Description */}
                      {item.description && (
                        <div>
                          <h6 className="font-semibold text-brand-dark mb-2">Description</h6>
                          <p className="text-gray-700">{item.description}</p>
                        </div>
                      )}

                      {/* Attachments using reusable component */}
                      {hasAttachments && (
                        <div className="mt-4">
                          <h5 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                            <FaPaperclip /> Attachments ({item.attachments.length})
                          </h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {item.attachments.map((attachment, idx) => (
                              <AttachmentPreview
                                key={idx}
                                type={attachment.type}
                                url={attachment.url}
                                title={attachment.title}
                                className="h-full"
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Responses Section */}
                      {hasResponses && (
                        <div>
                          <h6 className="font-semibold text-brand-dark mb-3">
                            Submissions & Questions ({item.responses.length})
                          </h6>
                          <div className="space-y-4">
                            {item.responses.map((response, ridx) => {
                              // Show if public or if student owns it or if user is tutor
                              const canSee =
                                response.isPublic ||
                                String(response.studentId) === String(userData._id) ||
                                String(group.tutorId) === String(userData._id)

                              if (!canSee) return null

                              return (
                                <div key={ridx} className="bg-white rounded-lg p-4 border border-gray-200">
                                  <div className="flex items-start justify-between mb-3">
                                    <div>
                                      <p className="font-semibold text-brand-dark">{response.studentName}</p>
                                      <div className="flex items-center gap-2 mt-1">
                                        {response.isQuestion && (
                                          <span className="px-2 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-800">
                                            QUESTION
                                          </span>
                                        )}
                                        {response.isPublic && (
                                          <span className="px-2 py-0.5 rounded text-xs font-semibold bg-green-100 text-green-800">
                                            PUBLIC
                                          </span>
                                        )}
                                        {response.isQuestion && !response.isPublic && (
                                          <span className="px-2 py-0.5 rounded text-xs font-semibold bg-gray-100 text-gray-700">
                                            PRIVATE
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                    <span className="text-xs text-gray-500">
                                      {new Date(response.createdAt).toLocaleString()}
                                    </span>
                                  </div>

                                  <p className="text-gray-700 mb-3">{response.responseText}</p>

                                  {/* Response Attachments using reusable component */}
                                  {response.attachments?.length > 0 && (
                                    <div className="mb-3">
                                      <h6 className="text-sm font-semibold text-gray-700 mb-2">Student Attachments</h6>
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                        {response.attachments.map((attachment, idx) => (
                                          <AttachmentPreview
                                            key={idx}
                                            type={attachment.type}
                                            url={attachment.url}
                                            title={attachment.title}
                                            className="max-w-xs"
                                          />
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {/* Tutor Remark */}
                                  {response.tutorRemark && (
                                    <div className="mt-4 pt-4 border-t border-gray-200 bg-yellow-50 p-3 rounded">
                                      <p className="text-xs font-semibold text-brand-gold uppercase mb-1">Tutor's Remark</p>
                                      <p className="text-gray-700 text-sm">{response.tutorRemark}</p>
                                      {response.tutorRemarkAt && (
                                        <p className="text-xs text-gray-500 mt-1">
                                          {new Date(response.tutorRemarkAt).toLocaleString()}
                                        </p>
                                      )}
                                    </div>
                                  )}
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )}

                      {/* Submit Response Form */}
                      <div className="pt-6 border-t border-gray-200">
                        <h6 className="font-semibold text-brand-dark mb-4">Submit Response</h6>
                        <div className="space-y-4">
                          <textarea
                            value={responseText}
                            onChange={(e) => setResponseText(e.target.value)}
                            placeholder="Type your response, answer, or question here..."
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-brand-gold focus:ring-2 focus:ring-brand-gold focus:ring-opacity-50 resize-none"
                            rows="4"
                            disabled={submitting}
                          />

                          {/* Multiple Attachments */}
                          <div>
                            <div className="flex items-center justify-between mb-3">
                              <label className="block text-sm font-semibold text-brand-dark">
                                Attachments
                              </label>
                              <button
                                type="button"
                                onClick={addAttachmentField}
                                className="text-sm text-brand-gold hover:text-brand-dark flex items-center gap-1"
                                disabled={submitting}
                              >
                                <FaBook size={12} /> Add Attachment
                              </button>
                            </div>

                            <div className="space-y-3">
                              {attachments.map((attachment, index) => (
                                <div key={index} className="p-3 border border-gray-200 rounded-lg bg-white">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-gray-700">Attachment {index + 1}</span>
                                    {attachments.length > 1 && (
                                      <button
                                        type="button"
                                        onClick={() => removeAttachmentField(index)}
                                        className="text-red-500 hover:text-red-700 text-sm"
                                        disabled={submitting}
                                      >
                                        Remove
                                      </button>
                                    )}
                                  </div>

                                  {/* Attachment Type */}
                                  <div className="mb-2">
                                    <select
                                      value={attachment.type}
                                      onChange={(e) => updateAttachment(index, 'type', e.target.value)}
                                      disabled={submitting}
                                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-brand-gold text-sm"
                                    >
                                      {ATTACHMENT_TYPES.map(opt => (
                                        <option key={opt.value} value={opt.value}>
                                          {opt.label}
                                        </option>
                                      ))}
                                    </select>
                                  </div>

                                  {/* Title */}
                                  <div className="mb-2">
                                    <input
                                      type="text"
                                      value={attachment.title}
                                      onChange={(e) => updateAttachment(index, 'title', e.target.value)}
                                      placeholder="Attachment title"
                                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-brand-gold text-sm"
                                      disabled={submitting}
                                    />
                                  </div>

                                  {/* URL */}
                                  {attachment.type !== 'none' && (
                                    <div>
                                      <input
                                        type="url"
                                        value={attachment.url}
                                        onChange={(e) => updateAttachment(index, 'url', e.target.value)}
                                        placeholder="https://example.com/file"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-brand-gold text-sm"
                                        disabled={submitting}
                                      />
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={isQuestion}
                                onChange={(e) => setIsQuestion(e.target.checked)}
                                disabled={submitting}
                                className="w-4 h-4"
                              />
                              <span className="text-sm text-gray-700">This is a question</span>
                            </label>

                            {isQuestion && (
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={isPublic}
                                  onChange={(e) => setIsPublic(e.target.checked)}
                                  disabled={submitting}
                                  className="w-4 h-4"
                                />
                                <span className="text-sm text-gray-700">Allow Everyone in Class to see your Question</span>
                              </label>
                            )}
                          </div>

                          <button
                            onClick={() => handleSubmitResponse(item._id)}
                            disabled={submitting}
                            className="w-full px-4 py-2 bg-gradient-to-r from-brand-gold to-accent-orange text-white font-semibold rounded-lg hover:shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {submitting ? 'Submitting...' : 'Submit Response'}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default StudentCourseView