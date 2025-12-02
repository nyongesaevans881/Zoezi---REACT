import React, { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { IoClose } from 'react-icons/io5'
import { MdAttachFile } from 'react-icons/md'

const ATTACHMENT_TYPES = [
  { value: 'none', label: 'No Attachment' },
  { value: 'youtube', label: 'YouTube Link' },
  { value: 'vimeo', label: 'Vimeo Link' },
  { value: 'mp4', label: 'MP4 Video' },
  { value: 'pdf', label: 'PDF Document' },
  { value: 'article', label: 'Article' },
  { value: 'document', label: 'Document' }
]

const StudentCourseView = ({ userData, courseId }) => {
  const [group, setGroup] = useState(null)
  const [tutor, setTutor] = useState(null)
  const [courseEnroll, setCourseEnroll] = useState(null)
  const [loading, setLoading] = useState(true)
  const [expandedItemId, setExpandedItemId] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [responseText, setResponseText] = useState('')
  const [attachmentUrl, setAttachmentUrl] = useState('')
  const [attachmentType, setAttachmentType] = useState('none')
  const [isQuestion, setIsQuestion] = useState(false)
  const [isPublic, setIsPublic] = useState(false)

  // Fetch curriculum on mount
  useEffect(() => {
    const fetchCurriculum = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          toast.error('Not authenticated')
          return
        }

        const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/student-curriculum?courseId=${courseId}`, {
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
  }, [courseId])

  // Handle payment notification close
  const handleHidePaymentNotification = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/student-curriculum/hide-payment-notification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ courseId })
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

  // Handle response submission
  const handleSubmitResponse = async (itemId) => {
    if (!responseText.trim()) {
      toast.error('Please enter a response')
      return
    }

    // Validate attachment if type is selected
    if (attachmentType !== 'none' && !attachmentUrl.trim()) {
      toast.error('Please provide an attachment URL')
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
          attachmentUrl: attachmentUrl || '',
          attachmentType: attachmentType,
          isQuestion,
          isPublic: isQuestion ? isPublic : false
        })
      })

      const json = await res.json()
      if (json.status === 'success') {
        toast.success('Response submitted successfully')
        setResponseText('')
        setAttachmentUrl('')
        setAttachmentType('none')
        setIsQuestion(false)
        setIsPublic(false)
        // Refresh group data
        setGroup(json.data.group)
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
      const releaseDateTime = new Date(item.releaseDate)
      return new Date() >= releaseDateTime
    } catch (err) {
      return true
    }
  }

  // Format date/time for display
  const formatDateTime = (dateString) => {
    if (!dateString) return ''
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return 'Invalid Date'
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch (err) {
      return 'Invalid Date'
    }
  }

  // Get item type color
  const getTypeColor = (type) => {
    const colors = {
      lesson: 'bg-blue-500 text-white',
      event: 'bg-green-500 text-white',
      cat: 'bg-orange-500 text-white',
      exam: 'bg-red-500 text-white'
    }
    return colors[type] || 'bg-gray-500 text-white'
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
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-700">Unable to load course curriculum. Please contact your tutor.</p>
      </div>
    )
  }

  const progress = calculateProgress()
  const course = userData.courses.find(c => String(c.courseId) === String(courseId))
  const showPaymentWidget = 
    courseEnroll && 
    !courseEnroll.paymentNotificationHidden && 
    courseEnroll.payment && 
    courseEnroll.payment.status

  return (
    <div className="space-y-6 p-6">
      {/* Progress Bar */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold text-primary-dark">Progress</h3>
          <span className="text-2xl font-bold text-primary-gold">{progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-primary-gold to-accent-orange h-3 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          {group.curriculumItems?.filter(i => i.isCompleted).length || 0} of {group.curriculumItems?.length || 0} items completed
        </p>
      </div>

      {/* Payment Notification Widget */}
      {showPaymentWidget && (
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-primary-gold">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h4 className="font-semibold text-primary-dark mb-2">Payment Status</h4>
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

      {/* Assigned Tutor Widget */}
      {tutor && (
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-accent-orange">
          <h4 className="font-semibold text-primary-dark mb-4">Your Tutor</h4>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Name</p>
              <p className="font-medium text-primary-dark">{tutor.firstName} {tutor.lastName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="font-medium text-primary-gold">{tutor.email}</p>
            </div>
            {tutor.phone && (
              <div>
                <p className="text-sm text-gray-600">Phone</p>
                <p className="font-medium text-primary-dark">{tutor.phone}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Curriculum Items */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h4 className="font-semibold text-primary-dark mb-4 text-lg">Course Materials</h4>
        
        {(!group.curriculumItems || group.curriculumItems.length === 0) ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No curriculum items yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {group.curriculumItems.map((item, idx) => {
              const released = isItemReleased(item)
              const isExpanded = expandedItemId === item._id

              return (
                <div key={item._id} className={`border rounded-lg overflow-hidden transition-all ${
                  released ? 'border-gray-300 cursor-pointer hover:shadow-md' : 'border-gray-200 opacity-60'
                }`}>
                  {/* Item Header */}
                  <div
                    onClick={() => {
                      if (released) setExpandedItemId(isExpanded ? null : item._id)
                    }}
                    className={`p-4 ${released ? 'hover:bg-gray-50' : ''}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 flex items-start gap-4">
                        <div className="text-2xl font-bold text-gray-300 min-w-fit pt-1">{idx + 1}</div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${getTypeColor(item.type)}`}>
                              {item.type.toUpperCase()}
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
                          </div>
                          <h5 className="font-semibold text-primary-dark text-lg">{item.name}</h5>
                          {item.responses && item.responses.length > 0 && (
                            <p className="text-sm text-primary-gold font-medium mt-1">
                              {item.responses.length} response{item.responses.length !== 1 ? 's' : ''}
                            </p>
                          )}
                        </div>
                      </div>
                      {released && (
                        <button className="text-primary-gold hover:text-primary-brown transition text-lg">
                          {isExpanded ? '▼' : '▶'}
                        </button>
                      )}
                    </div>

                    {/* Release/Due dates */}
                    <div className="flex gap-6 text-xs text-gray-600 mt-3 ml-8">
                      {item.releaseDate && (
                        <div>
                          <span className="font-medium">Available On:</span> {formatDateTime(item.releaseDate)}
                        </div>
                      )}
                      {item.dueDate && (
                        <div>
                          <span className="font-medium">Due:</span> {formatDateTime(item.dueDate)}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Item Details - Expandable */}
                  {isExpanded && released && (
                    <div className="bg-gray-50 border-t border-gray-200 p-6 space-y-6">
                      {/* Description */}
                      {item.description && (
                        <div>
                          <h6 className="font-semibold text-primary-dark mb-2">Description</h6>
                          <p className="text-gray-700">{item.description}</p>
                        </div>
                      )}

                      {/* Attachment */}
                      {item.attachmentUrl && (
                        <div>
                          <h6 className="font-semibold text-primary-dark mb-2">Attachment</h6>
                          <a
                            href={item.attachmentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-primary-gold hover:text-primary-brown transition"
                          >
                            <MdAttachFile size={18} />
                            <span>View attachment ({item.attachmentType})</span>
                          </a>
                        </div>
                      )}

                      {/* Responses Section */}
                      {item.responses && item.responses.length > 0 && (
                        <div>
                          <h6 className="font-semibold text-primary-dark mb-3">
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
                                      <p className="font-semibold text-primary-dark">{response.studentName}</p>
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
                                      {formatDateTime(response.createdAt)}
                                    </span>
                                  </div>

                                  <p className="text-gray-700 mb-3">{response.responseText}</p>

                                  {response.attachmentUrl && (
                                    <a
                                      href={response.attachmentUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex items-center gap-2 text-primary-gold hover:text-primary-brown transition text-sm mb-3"
                                    >
                                      <MdAttachFile size={16} />
                                      <span>Attachment</span>
                                    </a>
                                  )}

                                  {/* Tutor Remark */}
                                  {response.tutorRemark && (
                                    <div className="mt-4 pt-4 border-t border-gray-200 bg-yellow-50 p-3 rounded">
                                      <p className="text-xs font-semibold text-primary-gold uppercase mb-1">Tutor's Remark</p>
                                      <p className="text-gray-700 text-sm">{response.tutorRemark}</p>
                                      {response.tutorRemarkAt && (
                                        <p className="text-xs text-gray-500 mt-1">
                                          {formatDateTime(response.tutorRemarkAt)}
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
                        <h6 className="font-semibold text-primary-dark mb-4">Submit Response</h6>
                        <div className="space-y-4">
                          <textarea
                            value={responseText}
                            onChange={(e) => setResponseText(e.target.value)}
                            placeholder="Type your response, answer, or question here..."
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-gold focus:ring-2 focus:ring-primary-gold focus:ring-opacity-50 resize-none"
                            rows="4"
                            disabled={submitting}
                          />

                          <div>
                            <label className="block text-sm font-semibold text-primary-dark mb-2">
                              Attachment Type
                            </label>
                            <select
                              value={attachmentType}
                              onChange={(e) => {
                                setAttachmentType(e.target.value)
                                if (e.target.value === 'none') {
                                  setAttachmentUrl('')
                                }
                              }}
                              disabled={submitting}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-gold focus:ring-2 focus:ring-primary-gold focus:ring-opacity-50"
                            >
                              {ATTACHMENT_TYPES.map(type => (
                                <option key={type.value} value={type.value}>
                                  {type.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          {attachmentType !== 'none' && (
                            <input
                              type="url"
                              value={attachmentUrl}
                              onChange={(e) => setAttachmentUrl(e.target.value)}
                              placeholder={`Enter ${ATTACHMENT_TYPES.find(t => t.value === attachmentType)?.label} URL`}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-gold focus:ring-2 focus:ring-primary-gold focus:ring-opacity-50"
                              disabled={submitting}
                            />
                          )}

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
                            className="w-full px-4 py-2 bg-gradient-to-r from-primary-gold to-accent-orange text-white font-semibold rounded-lg hover:shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed"
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
