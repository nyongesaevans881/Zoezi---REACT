import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useRef } from 'react'

const API = import.meta.env.VITE_SERVER_URL

const ITEM_TYPES = {
  lesson: { label: 'Lesson', color: 'bg-blue-500', lightBg: 'bg-blue-50', borderColor: 'border-blue-500' },
  event: { label: 'Event', color: 'bg-green-500', lightBg: 'bg-green-50', borderColor: 'border-green-500' },
  cat: { label: 'CAT', color: 'bg-orange-500', lightBg: 'bg-orange-50', borderColor: 'border-orange-500' },
  exam: { label: 'Exam', color: 'bg-red-500', lightBg: 'bg-red-50', borderColor: 'border-red-500' }
}

const ATTACHMENT_TYPES = [
  { value: 'none', label: 'No Attachment' },
  { value: 'youtube', label: 'YouTube Video' },
  { value: 'vimeo', label: 'Vimeo Video' },
  { value: 'mp4', label: 'MP4 Video' },
  { value: 'pdf', label: 'PDF Document' },
  { value: 'article', label: 'Article' },
  { value: 'document', label: 'Document' }
]

export default function Curriculum({ userData }) {
  const [curriculums, setCurriculums] = useState([])
  const [tutorCourses, setTutorCourses] = useState([])
  const [selectedCourseId, setSelectedCourseId] = useState('')
  const [currentCurriculum, setCurrentCurriculum] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingItemId, setEditingItemId] = useState(null)
  const [draggedItemId, setDraggedItemId] = useState(null)
  
  const [formData, setFormData] = useState({
    type: 'lesson',
    name: '',
    description: '',
    attachmentUrl: '',
    attachmentType: 'none'
  })

  const tutorId = userData?._id
  const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` })

  useEffect(() => { fetchData() }, [tutorId])

  const fetchData = async () => {
    if (!tutorId) return
    setLoading(true)
    const loadingToast = toast.loading('Loading curriculums...')
    try {
      // Fetch tutor with courses
      const tRes = await fetch(`${API}/tutors/${tutorId}`, { headers: authHeader() })
      const tData = await tRes.json()
      if (tRes.ok && tData.data?.tutor) {
        setTutorCourses(tData.data.tutor.courses || [])
      }

      // Fetch curriculums
      const cRes = await fetch(`${API}/curriculums?tutorId=${tutorId}`, { headers: authHeader() })
      const cData = await cRes.json()
      if (cRes.ok) {
        setCurriculums(cData.data.curriculums || [])
      }

      toast.dismiss(loadingToast)
      toast.success('Data loaded')
    } catch (err) {
      toast.dismiss(loadingToast)
      toast.error(err.message || 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleCourseSelect = async (courseId) => {
    setSelectedCourseId(courseId)
    
    // Find existing curriculum for this course
    const existing = curriculums.find(c => String(c.courseId) === String(courseId))
    if (existing) {
      setCurrentCurriculum(existing)
    } else {
      // Create new curriculum
      try {
        const r = await fetch(`${API}/curriculums`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...authHeader() },
          body: JSON.stringify({ tutorId, courseId })
        })
        const d = await r.json()
        if (!r.ok) throw new Error(d.message)
        setCurrentCurriculum(d.data.curriculum)
        setCurriculums([...curriculums, d.data.curriculum])
        toast.success('Curriculum created')
      } catch (err) {
        toast.error(err.message)
        setSelectedCourseId('')
      }
    }
  }

  const handleAddItem = async () => {
    if (!currentCurriculum) return toast.error('No curriculum selected')
    if (!formData.name.trim()) return toast.error('Item name is required')

    try {
      const r = await fetch(`${API}/curriculums/${currentCurriculum._id}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body: JSON.stringify(formData)
      })
      const d = await r.json()
      if (!r.ok) throw new Error(d.message)
      
      setCurrentCurriculum(d.data.curriculum)
      setCurriculums(curriculums.map(c => String(c._id) === String(currentCurriculum._id) ? d.data.curriculum : c))
      setFormData({ type: 'lesson', name: '', description: '', attachmentUrl: '', attachmentType: 'none' })
      setShowForm(false)
      toast.success('Item added')
    } catch (err) {
      toast.error(err.message)
    }
  }

  const handleUpdateItem = async (itemId) => {
    if (!currentCurriculum) return

    try {
      const r = await fetch(`${API}/curriculums/${currentCurriculum._id}/items/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body: JSON.stringify(formData)
      })
      const d = await r.json()
      if (!r.ok) throw new Error(d.message)
      
      setCurrentCurriculum(d.data.curriculum)
      setCurriculums(curriculums.map(c => String(c._id) === String(currentCurriculum._id) ? d.data.curriculum : c))
      setEditingItemId(null)
      setFormData({ type: 'lesson', name: '', description: '', attachmentUrl: '', attachmentType: 'none' })
      setShowForm(false)
      toast.success('Item updated')
    } catch (err) {
      toast.error(err.message)
    }
  }

  const handleDeleteItem = async (itemId) => {
    if (!confirm('Delete this item?')) return
    if (!currentCurriculum) return

    try {
      const r = await fetch(`${API}/curriculums/${currentCurriculum._id}/items/${itemId}`, {
        method: 'DELETE',
        headers: authHeader()
      })
      const d = await r.json()
      if (!r.ok) throw new Error(d.message)
      
      setCurrentCurriculum(d.data.curriculum)
      setCurriculums(curriculums.map(c => String(c._id) === String(currentCurriculum._id) ? d.data.curriculum : c))
      toast.success('Item deleted')
    } catch (err) {
      toast.error(err.message)
    }
  }

  const handleDragStart = (itemId) => {
    setDraggedItemId(itemId)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = async (targetItemId) => {
    if (!draggedItemId || draggedItemId === targetItemId || !currentCurriculum) return

    try {
      const items = currentCurriculum.items
      const draggedIndex = items.findIndex(i => i._id === draggedItemId)
      const targetIndex = items.findIndex(i => i._id === targetItemId)

      if (draggedIndex === -1 || targetIndex === -1) return

      // Reorder
      const newOrder = [...items]
      const [draggedItem] = newOrder.splice(draggedIndex, 1)
      newOrder.splice(targetIndex, 0, draggedItem)

      // Send to API
      const r = await fetch(`${API}/curriculums/${currentCurriculum._id}/reorder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body: JSON.stringify({ itemOrder: newOrder.map(i => i._id) })
      })
      const d = await r.json()
      if (!r.ok) throw new Error(d.message)

      setCurrentCurriculum(d.data.curriculum)
      setCurriculums(curriculums.map(c => String(c._id) === String(currentCurriculum._id) ? d.data.curriculum : c))
    } catch (err) {
      toast.error('Failed to reorder: ' + err.message)
    } finally {
      setDraggedItemId(null)
    }
  }

  const openEditForm = (item) => {
    setEditingItemId(item._id)
    setFormData({
      type: item.type,
      name: item.name,
      description: item.description,
      attachmentUrl: item.attachmentUrl,
      attachmentType: item.attachmentType
    })
    setShowForm(true)
  }

  if (loading) return <div className="p-6 text-center text-gray-500">Loading...</div>

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
        <h1 className='font-bold text-2xl '>Curriculum Management</h1>
      {/* COURSE SELECTOR */}
      <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-brand-gold">
        <h2 className="text-2xl font-bold text-brand-dark mb-4">📚 Select Course</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {tutorCourses.length === 0 ? (
            <p className="col-span-full text-gray-500">No courses available. Enroll in courses first.</p>
          ) : (
            tutorCourses.map(course => (
              <button
                key={course._id}
                onClick={() => handleCourseSelect(course._id)}
                className={`cursor-pointer p-4 rounded-lg border-2 transition font-semibold ${
                  String(selectedCourseId) === String(course._id)
                    ? 'border-brand-gold bg-brand-gold text-white'
                    : 'border-gray-200 bg-gray-50 text-gray-900 hover:border-brand-gold'
                }`}
              >
                {course.name}
              </button>
            ))
          )}
        </div>
      </div>

      {/* CURRICULUM EDITOR */}
      {currentCurriculum && (
        <div className="space-y-6">
          {/* ADD ITEM BUTTON & FORM */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-brand-dark">✏️ Curriculum Items</h3>
              {!showForm && (
                <button
                  onClick={() => {
                    setEditingItemId(null)
                    setFormData({ type: 'lesson', name: '', description: '', attachmentUrl: '', attachmentType: 'none' })
                    setShowForm(true)
                  }}
                  className="px-4 py-2 bg-brand-gold text-white rounded-lg hover:bg-opacity-90 font-semibold"
                >
                  + Add Item
                </button>
              )}
            </div>

            {/* ADD/EDIT FORM */}
            {showForm && (
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 mb-6 border-2 border-blue-200">
                <h4 className="text-lg font-bold mb-4 text-brand-dark">
                  {editingItemId ? 'Edit Item' : 'Create New Item'}
                </h4>
                
                <div className="space-y-4">
                  {/* Item Type */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Item Type</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {Object.entries(ITEM_TYPES).map(([key, val]) => (
                        <button
                          key={key}
                          onClick={() => setFormData({ ...formData, type: key })}
                          className={`px-3 py-2 rounded-lg font-semibold text-sm transition ${
                            formData.type === key
                              ? `${val.color} text-white`
                              : `${val.lightBg} ${val.borderColor} border-2`
                          }`}
                        >
                          {val.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Name */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Item Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Introduction to Algebra"
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-brand-gold focus:outline-none"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={e => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Add any notes or description for this item"
                      rows="3"
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-brand-gold focus:outline-none"
                    />
                  </div>

                  {/* Attachment Type */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Attachment Type</label>
                    <select
                      value={formData.attachmentType}
                      onChange={e => setFormData({ ...formData, attachmentType: e.target.value })}
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-brand-gold focus:outline-none"
                    >
                      {ATTACHMENT_TYPES.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Attachment URL */}
                  {formData.attachmentType !== 'none' && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {ATTACHMENT_TYPES.find(t => t.value === formData.attachmentType)?.label} URL
                      </label>
                      <input
                        type="url"
                        value={formData.attachmentUrl}
                        onChange={e => setFormData({ ...formData, attachmentUrl: e.target.value })}
                        placeholder="https://example.com/file"
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-brand-gold focus:outline-none"
                      />
                    </div>
                  )}

                  {/* Form Actions */}
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => editingItemId ? handleUpdateItem(editingItemId) : handleAddItem()}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
                    >
                      {editingItemId ? 'Update Item' : 'Add Item'}
                    </button>
                    <button
                      onClick={() => {
                        setShowForm(false)
                        setEditingItemId(null)
                        setFormData({ type: 'lesson', name: '', description: '', attachmentUrl: '', attachmentType: 'none' })
                      }}
                      className="flex-1 px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 font-semibold"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ITEMS LIST */}
            {currentCurriculum.items && currentCurriculum.items.length > 0 ? (
              <div className="space-y-3">
                {currentCurriculum.items
                  .sort((a, b) => a.position - b.position)
                  .map((item, idx) => {
                    const type = ITEM_TYPES[item.type]
                    return (
                      <div
                        key={item._id}
                        draggable
                        onDragStart={() => handleDragStart(item._id)}
                        onDragOver={handleDragOver}
                        onDrop={() => handleDrop(item._id)}
                        className={`p-4 rounded-lg border-l-4 cursor-move transition ${
                          draggedItemId === item._id ? 'opacity-50 bg-gray-100' : type.lightBg
                        } ${type.borderColor} border-l-4 hover:shadow-md`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className={`${type.color} text-white text-xs font-bold px-2 py-1 rounded`}>
                                {type.label}
                              </span>
                              <h4 className="text-lg font-bold text-gray-900">{item.name}</h4>
                              <span className="text-xs text-gray-500">#{idx + 1}</span>
                            </div>
                            
                            {item.description && (
                              <p className="text-sm text-gray-700 mb-2">{item.description}</p>
                            )}
                            
                            {item.attachmentUrl && (
                              <div className="text-xs text-blue-600 mt-2">
                                📎 {item.attachmentType.toUpperCase()}: <a href={item.attachmentUrl} target="_blank" rel="noopener noreferrer" className="underline">{item.attachmentUrl.slice(0, 50)}...</a>
                              </div>
                            )}
                          </div>

                          <div className="flex gap-2 ml-4">
                            <button
                              onClick={() => openEditForm(item)}
                              className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => handleDeleteItem(item._id)}
                              className="px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
              </div>
            ) : (
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-8 text-center border-2 border-dashed border-gray-300">
                <div className="text-4xl mb-2">📝</div>
                <p className="text-lg font-semibold text-gray-700">No items yet</p>
                <p className="text-sm text-gray-600 mt-1">Click "Add Item" to start building your curriculum</p>
              </div>
            )}
          </div>

          {/* CURRICULUM STATS */}
          {currentCurriculum.items && currentCurriculum.items.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg p-4 shadow text-center border-t-2 border-blue-500">
                <div className="text-2xl font-bold text-blue-600">
                  {currentCurriculum.items.filter(i => i.type === 'lesson').length}
                </div>
                <p className="text-xs text-gray-600 mt-1">Lessons</p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow text-center border-t-2 border-green-500">
                <div className="text-2xl font-bold text-green-600">
                  {currentCurriculum.items.filter(i => i.type === 'event').length}
                </div>
                <p className="text-xs text-gray-600 mt-1">Events</p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow text-center border-t-2 border-orange-500">
                <div className="text-2xl font-bold text-orange-600">
                  {currentCurriculum.items.filter(i => i.type === 'cat').length}
                </div>
                <p className="text-xs text-gray-600 mt-1">CATs</p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow text-center border-t-2 border-red-500">
                <div className="text-2xl font-bold text-red-600">
                  {currentCurriculum.items.filter(i => i.type === 'exam').length}
                </div>
                <p className="text-xs text-gray-600 mt-1">Exams</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
