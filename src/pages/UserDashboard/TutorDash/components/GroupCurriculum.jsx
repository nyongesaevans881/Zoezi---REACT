import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

const API = import.meta.env.VITE_SERVER_URL

const ITEM_TYPES = {
  lesson: { label: 'Lesson', color: 'bg-blue-600', lightBg: 'bg-blue-50', borderColor: 'border-blue-600', textColor: 'text-blue-600' },
  event: { label: 'Event', color: 'bg-green-600', lightBg: 'bg-green-50', borderColor: 'border-green-600', textColor: 'text-green-600' },
  cat: { label: 'CAT', color: 'bg-orange-600', lightBg: 'bg-orange-50', borderColor: 'border-orange-600', textColor: 'text-orange-600' },
  exam: { label: 'Exam', color: 'bg-red-600', lightBg: 'bg-red-50', borderColor: 'border-red-600', textColor: 'text-red-600' }
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

export default function GroupCurriculum({ userData }) {
  const [groups, setGroups] = useState([])
  const [curriculums, setCurriculums] = useState([])
  const [selectedGroupId, setSelectedGroupId] = useState('')
  const [selectedGroup, setSelectedGroup] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [editingItemId, setEditingItemId] = useState(null)
  const [draggedItemId, setDraggedItemId] = useState(null)
  const [importMode, setImportMode] = useState('curriculum') // 'curriculum' or 'item'
  const [selectedCurriculumId, setSelectedCurriculumId] = useState('')
  const [selectedImportItemId, setSelectedImportItemId] = useState('')
  const [expandedItemId, setExpandedItemId] = useState(null)
  const [tutorRemarkText, setTutorRemarkText] = useState('')
  const [replying, setReplying] = useState(null) // { itemId, responseId }

  const [formData, setFormData] = useState({
    type: 'lesson',
    name: '',
    description: '',
    attachmentUrl: '',
    attachmentType: 'none',
    releaseDate: '',
    releaseTime: '00:00',
    dueDate: '',
    dueTime: '23:59'
  })

  const tutorId = userData?._id
  const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` })

  useEffect(() => { fetchData() }, [tutorId])

  const fetchData = async () => {
    if (!tutorId) return
    setLoading(true)
    const loadingToast = toast.loading('Loading groups and curriculums...')
    try {
      // Fetch groups
      const gRes = await fetch(`${API}/groups?tutorId=${tutorId}`, { headers: authHeader() })
      const gData = await gRes.json()
      if (gRes.ok) setGroups(gData.data.groups || [])

      // Fetch curriculums
      const cRes = await fetch(`${API}/curriculums?tutorId=${tutorId}`, { headers: authHeader() })
      const cData = await cRes.json()
      if (cRes.ok) setCurriculums(cData.data.curriculums || [])

      toast.dismiss(loadingToast)
      toast.success('Data loaded')
    } catch (err) {
      toast.dismiss(loadingToast)
      toast.error(err.message || 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleGroupSelect = async (groupId) => {
    setSelectedGroupId(groupId)
    try {
      const r = await fetch(`${API}/group-curriculum/${groupId}`, { headers: authHeader() })
      const d = await r.json()
      if (!r.ok) throw new Error(d.message)
      setSelectedGroup(d.data.group)
    } catch (err) {
      toast.error(err.message)
    }
  }

  const handleAddItem = async () => {
    if (!selectedGroup) return toast.error('No group selected')
    if (!formData.name.trim()) return toast.error('Item name is required')

    try {
      const r = await fetch(`${API}/group-curriculum/${selectedGroup._id}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body: JSON.stringify(formData)
      })
      const d = await r.json()
      if (!r.ok) throw new Error(d.message)

      setSelectedGroup(d.data.group)
      setFormData({
        type: 'lesson',
        name: '',
        description: '',
        attachmentUrl: '',
        attachmentType: 'none',
        releaseDate: '',
        releaseTime: '00:00',
        dueDate: '',
        dueTime: '23:59'
      })
      setShowForm(false)
      toast.success('Item added')
    } catch (err) {
      toast.error(err.message)
    }
  }

  const handleUpdateItem = async (itemId) => {
    if (!selectedGroup) return

    try {
      const r = await fetch(`${API}/group-curriculum/${selectedGroup._id}/items/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body: JSON.stringify(formData)
      })
      const d = await r.json()
      if (!r.ok) throw new Error(d.message)

      setSelectedGroup(d.data.group)
      setEditingItemId(null)
      setFormData({
        type: 'lesson',
        name: '',
        description: '',
        attachmentUrl: '',
        attachmentType: 'none',
        releaseDate: '',
        releaseTime: '00:00',
        dueDate: '',
        dueTime: '23:59'
      })
      setShowForm(false)
      toast.success('Item updated')
    } catch (err) {
      toast.error(err.message)
    }
  }

  const handleDeleteItem = async (itemId) => {
    if (!confirm('Delete this item?')) return
    if (!selectedGroup) return

    try {
      const r = await fetch(`${API}/group-curriculum/${selectedGroup._id}/items/${itemId}`, {
        method: 'DELETE',
        headers: authHeader()
      })
      const d = await r.json()
      if (!r.ok) throw new Error(d.message)

      setSelectedGroup(d.data.group)
      toast.success('Item deleted')
    } catch (err) {
      toast.error(err.message)
    }
  }

  const handleImportCurriculum = async () => {
    if (!selectedCurriculumId) return toast.error('Select a curriculum to import')
    if (!selectedGroup) return

    try {
      const r = await fetch(
        `${API}/group-curriculum/${selectedGroup._id}/import-curriculum/${selectedCurriculumId}`,
        { method: 'POST', headers: authHeader() }
      )
      const d = await r.json()
      if (!r.ok) throw new Error(d.message)

      setSelectedGroup(d.data.group)
      setShowImportModal(false)
      setSelectedCurriculumId('')
      toast.success('Curriculum imported')
    } catch (err) {
      toast.error(err.message)
    }
  }

  const handleImportItem = async () => {
    if (!selectedCurriculumId) return toast.error('Select a curriculum')
    if (!selectedImportItemId) return toast.error('Select an item to import')
    if (!selectedGroup) return

    try {
      const r = await fetch(
        `${API}/group-curriculum/${selectedGroup._id}/import-item/${selectedCurriculumId}/${selectedImportItemId}`,
        { method: 'POST', headers: authHeader() }
      )
      const d = await r.json()
      if (!r.ok) throw new Error(d.message)

      setSelectedGroup(d.data.group)
      setShowImportModal(false)
      setSelectedCurriculumId('')
      setSelectedImportItemId('')
      toast.success('Item imported')
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
    if (!draggedItemId || draggedItemId === targetItemId || !selectedGroup) return

    try {
      const items = selectedGroup.curriculumItems
      const draggedIndex = items.findIndex(i => i._id === draggedItemId)
      const targetIndex = items.findIndex(i => i._id === targetItemId)

      if (draggedIndex === -1 || targetIndex === -1) return

      const newOrder = [...items]
      const [draggedItem] = newOrder.splice(draggedIndex, 1)
      newOrder.splice(targetIndex, 0, draggedItem)

      const r = await fetch(`${API}/group-curriculum/${selectedGroup._id}/reorder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body: JSON.stringify({ itemOrder: newOrder.map(i => i._id) })
      })
      const d = await r.json()
      if (!r.ok) throw new Error(d.message)

      setSelectedGroup(d.data.group)
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
      attachmentType: item.attachmentType,
      releaseDate: item.releaseDate ? item.releaseDate.split('T')[0] : '',
      releaseTime: item.releaseTime || '00:00',
      dueDate: item.dueDate ? item.dueDate.split('T')[0] : '',
      dueTime: item.dueTime || '23:59'
    })
    setShowForm(true)
  }

  const isItemReleased = (item) => {
    if (!item.releaseDate) return true
    const releaseDateTime = new Date(`${item.releaseDate}T${item.releaseTime}`)
    return releaseDateTime <= new Date()
  }

  const isItemDue = (item) => {
    if (!item.dueDate) return false
    const dueDateTime = new Date(`${item.dueDate}T${item.dueTime}`)
    return dueDateTime <= new Date()
  }

  const formatDateTime = (dateString, timeString) => {
    if (!dateString) return ''
    try {
      // Handle ISO format like 2025-12-03T00:00:00.000+00:00
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

  const handleMarkItemComplete = async (itemId) => {
    if (!selectedGroup) return

    try {
      const r = await fetch(`${API}/group-curriculum/${selectedGroup._id}/items/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body: JSON.stringify({
          isCompleted: true
        })
      })
      const d = await r.json()
      if (!r.ok) throw new Error(d.message)

      setSelectedGroup(d.data.group)
      toast.success('Item marked as complete')
    } catch (err) {
      toast.error(err.message)
    }
  }

  const handleUnmarkItemComplete = async (itemId) => {
    if (!selectedGroup) return

    try {
      const r = await fetch(`${API}/group-curriculum/${selectedGroup._id}/items/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body: JSON.stringify({
          isCompleted: false
        })
      })
      const d = await r.json()
      if (!r.ok) throw new Error(d.message)

      setSelectedGroup(d.data.group)
      toast.success('Item marked as incomplete')
    } catch (err) {
      toast.error(err.message)
    }
  }

  const handleAddTutorRemark = async () => {
    if (!tutorRemarkText.trim()) {
      toast.error('Please enter a remark')
      return
    }

    if (!replying || !selectedGroup) return

    try {
      const { itemId, responseId } = replying
      const r = await fetch(`${API}/student-curriculum/${selectedGroup._id}/items/${itemId}/responses/${responseId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body: JSON.stringify({
          tutorRemark: tutorRemarkText
        })
      })
      const d = await r.json()
      if (!r.ok) throw new Error(d.message)

      setSelectedGroup(d.data.group)
      setTutorRemarkText('')
      setReplying(null)
      toast.success('Remark added')
    } catch (err) {
      toast.error(err.message)
    }
  }

  if (loading) return <div className="p-6 text-center text-gray-500">Loading...</div>

  return (
    <div className="p-4 md:p-6 space-y-6 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
    <h1 className='font-bold text-2xl '>Timetable Management</h1>
      {/* GROUP SELECTOR */}
      <div className="bg-white rounded-lg shadow-md p-4 md:p-6 border-l-4" style={{ borderLeftColor: 'var(--color-primary-gold)' }}>
        <h2 className="text-xl md:text-2xl font-bold mb-4" style={{ color: 'var(--color-primary-dark)' }}>
          📚 Select Group
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-3">
          {groups.length === 0 ? (
            <p className="col-span-full text-gray-500">No groups available. Create groups first.</p>
          ) : (
            groups.map(group => (
              <button
                key={group._id}
                onClick={() => handleGroupSelect(group._id)}
                className={`p-3 rounded-lg border-2 transition font-semibold text-sm md:text-base cursor-pointer ${
                  String(selectedGroupId) === String(group._id)
                    ? 'border-brand-gold text-white'
                    : 'border-gray-200 bg-gray-50 text-gray-900 hover:border-brand-gold'
                }`}
                style={String(selectedGroupId) === String(group._id) ? { backgroundColor: 'var(--color-primary-gold)' } : {}}
              >
                {group.name}
                <span className="text-xs ml-1 opacity-75">({group.students?.length || 0})</span>
              </button>
            ))
          )}
        </div>
      </div>

      {/* CURRICULUM EDITOR */}
      {selectedGroup && (
        <div className="space-y-6">
          {/* TOOLBAR */}
          <div className="bg-white rounded-lg shadow-md p-4 md:p-6 flex flex-col md:flex-row gap-3 md:gap-4">
            <button
              onClick={() => {
                setEditingItemId(null)
                setFormData({
                  type: 'lesson',
                  name: '',
                  description: '',
                  attachmentUrl: '',
                  attachmentType: 'none',
                  releaseDate: '',
                  releaseTime: '00:00',
                  dueDate: '',
                  dueTime: '23:59'
                })
                setShowForm(!showForm)
              }}
              className="flex-1 md:flex-none px-4 py-2 rounded-lg font-semibold text-white hover:bg-opacity-90 transition cursor-pointer"
              style={{ backgroundColor: 'var(--color-primary-gold)' }}
            >
              + Create Item
            </button>
            <button
              onClick={() => setShowImportModal(true)}
              className="flex-1 md:flex-none px-4 py-2 rounded-lg font-semibold text-white hover:bg-opacity-90 transition cursor-pointer"
              style={{ backgroundColor: 'var(--color-primary-brown)' }}
            >
              📥 Import
            </button>
          </div>

          {/* IMPORT MODAL */}
          {showImportModal && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 space-y-4">
                <h3 className="text-xl font-bold" style={{ color: 'var(--color-primary-dark)' }}>Import Content</h3>
                
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--color-primary-dark)' }}>
                    Import Mode
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setImportMode('curriculum')
                        setSelectedImportItemId('')
                      }}
                      className={`flex-1 px-3 py-2 rounded text-sm font-semibold transition cursor-pointer ${
                        importMode === 'curriculum'
                          ? 'text-white'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                      style={importMode === 'curriculum' ? { backgroundColor: 'var(--color-primary-gold)' } : {}}
                    >
                      Full Curriculum
                    </button>
                    <button
                      onClick={() => {
                        setImportMode('item')
                        setSelectedImportItemId('')
                      }}
                      className={`flex-1 px-3 py-2 rounded text-sm font-semibold transition cursor-pointer ${
                        importMode === 'item'
                          ? 'text-white'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                      style={importMode === 'item' ? { backgroundColor: 'var(--color-primary-gold)' } : {}}
                    >
                      Single Item
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--color-primary-dark)' }}>
                    Select Course Curriculum
                  </label>
                  <select
                    value={selectedCurriculumId}
                    onChange={e => setSelectedCurriculumId(e.target.value)}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded focus:border-brand-gold focus:outline-none cursor-pointer"
                  >
                    <option value="">-- Select --</option>
                    {curriculums.map(curr => (
                      <option key={curr._id} value={curr._id}>{curr.courseName}</option>
                    ))}
                  </select>
                </div>

                {importMode === 'item' && selectedCurriculumId && (
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--color-primary-dark)' }}>
                      Select Item
                    </label>
                    <select
                      value={selectedImportItemId}
                      onChange={e => setSelectedImportItemId(e.target.value)}
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded focus:border-brand-gold focus:outline-none max-h-48 overflow-y-auto"
                    >
                      <option value="">-- Select --</option>
                      {curriculums
                        .find(c => c._id === selectedCurriculumId)
                        ?.items?.map(item => (
                          <option key={item._id} value={item._id}>
                            {ITEM_TYPES[item.type]?.label} - {item.name}
                          </option>
                        ))}
                    </select>
                  </div>
                )}

                <div className="flex gap-2 pt-4">
                  <button
                    onClick={() => {
                      importMode === 'curriculum' ? handleImportCurriculum() : handleImportItem()
                    }}
                    className="flex-1 px-4 py-2 rounded font-semibold text-white cursor-pointer"
                    style={{ backgroundColor: 'var(--color-accent-orange)' }}
                  >
                    Import
                  </button>
                  <button
                    onClick={() => {
                      setShowImportModal(false)
                      setSelectedCurriculumId('')
                      setSelectedImportItemId('')
                    }}
                    className="flex-1 px-4 py-2 rounded font-semibold bg-gray-300 text-gray-700 cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ADD/EDIT FORM */}
          {showForm && (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 md:p-6 border-2" style={{ borderColor: 'var(--color-primary-gold)' }}>
              <h4 className="text-lg font-bold mb-4" style={{ color: 'var(--color-primary-dark)' }}>
                {editingItemId ? '✏️ Edit Item' : '✨ Create New Item'}
              </h4>

              <div className="space-y-4">
                {/* Item Type */}
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--color-primary-dark)' }}>
                    Item Type
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {Object.entries(ITEM_TYPES).map(([key, val]) => (
                      <button
                        key={key}
                        onClick={() => setFormData({ ...formData, type: key })}
                        className={`px-3 py-2 rounded text-sm font-semibold transition ${
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
                  <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--color-primary-dark)' }}>
                    Item Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Chapter 1 Lesson"
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded focus:border-brand-gold focus:outline-none"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--color-primary-dark)' }}>
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Add notes or content description"
                    rows="2"
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded focus:border-brand-gold focus:outline-none text-sm"
                  />
                </div>

                {/* Attachment Type */}
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--color-primary-dark)' }}>
                    Attachment Type
                  </label>
                  <select
                    value={formData.attachmentType}
                    onChange={e => setFormData({ ...formData, attachmentType: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded focus:border-brand-gold focus:outline-none text-sm"
                  >
                    {ATTACHMENT_TYPES.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                {/* Attachment URL */}
                {formData.attachmentType !== 'none' && (
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--color-primary-dark)' }}>
                      {ATTACHMENT_TYPES.find(t => t.value === formData.attachmentType)?.label} URL
                    </label>
                    <input
                      type="url"
                      value={formData.attachmentUrl}
                      onChange={e => setFormData({ ...formData, attachmentUrl: e.target.value })}
                      placeholder="https://example.com/file"
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded focus:border-brand-gold focus:outline-none text-sm"
                    />
                  </div>
                )}

                {/* Release Date & Time */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--color-primary-dark)' }}>
                      Release Date
                    </label>
                    <input
                      type="date"
                      value={formData.releaseDate}
                      onChange={e => setFormData({ ...formData, releaseDate: e.target.value })}
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded focus:border-brand-gold focus:outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--color-primary-dark)' }}>
                      Release Time
                    </label>
                    <input
                      type="time"
                      value={formData.releaseTime}
                      onChange={e => setFormData({ ...formData, releaseTime: e.target.value })}
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded focus:border-brand-gold focus:outline-none text-sm"
                    />
                  </div>
                </div>

                {/* Due Date & Time */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--color-primary-dark)' }}>
                      Due Date
                    </label>
                    <input
                      type="date"
                      value={formData.dueDate}
                      onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded focus:border-brand-gold focus:outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--color-primary-dark)' }}>
                      Due Time
                    </label>
                    <input
                      type="time"
                      value={formData.dueTime}
                      onChange={e => setFormData({ ...formData, dueTime: e.target.value })}
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded focus:border-brand-gold focus:outline-none text-sm"
                    />
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => editingItemId ? handleUpdateItem(editingItemId) : handleAddItem()}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded font-semibold hover:bg-green-700 transition text-sm md:text-base"
                  >
                    {editingItemId ? 'Update' : 'Add Item'}
                  </button>
                  <button
                    onClick={() => {
                      setShowForm(false)
                      setEditingItemId(null)
                      setFormData({
                        type: 'lesson',
                        name: '',
                        description: '',
                        attachmentUrl: '',
                        attachmentType: 'none',
                        releaseDate: '',
                        releaseTime: '00:00',
                        dueDate: '',
                        dueTime: '23:59'
                      })
                    }}
                    className="flex-1 px-4 py-2 bg-gray-400 text-white rounded font-semibold hover:bg-gray-500 transition text-sm md:text-base"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ITEMS LIST */}
          <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
            <h3 className="text-lg md:text-xl font-bold mb-4" style={{ color: 'var(--color-primary-dark)' }}>
              📋 Curriculum Items
            </h3>

            {selectedGroup.curriculumItems && selectedGroup.curriculumItems.length > 0 ? (
              <div className="space-y-3">
                {selectedGroup.curriculumItems
                  .sort((a, b) => a.position - b.position)
                  .map((item, idx) => {
                    const type = ITEM_TYPES[item.type]
                    const released = isItemReleased(item)
                    const due = isItemDue(item)

                    return (
                      <div
                        key={item._id}
                        draggable
                        onDragStart={() => handleDragStart(item._id)}
                        onDragOver={handleDragOver}
                        onDrop={() => handleDrop(item._id)}
                        className={`p-3 md:p-4 rounded-lg border-l-4 cursor-move transition ${
                          draggedItemId === item._id ? 'opacity-50 bg-gray-100' : type.lightBg
                        } ${type.borderColor} hover:shadow-md`}
                      >
                        <div className="flex justify-between items-start gap-2 md:gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 md:gap-3 flex-wrap mb-2">
                              <span className={`${type.color} text-white text-xs font-bold px-2 py-1 rounded whitespace-nowrap`}>
                                {type.label}
                              </span>
                              {item.isCompleted && (
                                <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded">
                                  ✓ COMPLETED
                                </span>
                              )}
                              <h4 className="text-sm md:text-base font-bold text-gray-900 break-words">{item.name}</h4>
                              <span className="text-xs text-gray-500 whitespace-nowrap">#{idx + 1}</span>
                            </div>

                            {/* Status Badges with Actual Dates */}
                            <div className="flex gap-2 flex-wrap mb-2">
                              {item.releaseDate && (
                                <span className={`text-xs px-2 py-1 rounded ${
                                  released ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                }`}>
                                  {released ? '✓ Released' : `⏳ ${formatDateTime(item.releaseDate, item.releaseTime)}`}
                                </span>
                              )}
                              {item.dueDate && (
                                <span className={`text-xs px-2 py-1 rounded ${
                                  due ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                                }`}>
                                  {due ? `🔴 Overdue` : `⏰ Due ${formatDateTime(item.dueDate, item.dueTime)}`}
                                </span>
                              )}
                              {item.responses && item.responses.length > 0 && (
                                <span className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded font-semibold">
                                  {item.responses.length} response{item.responses.length !== 1 ? 's' : ''}
                                </span>
                              )}
                            </div>

                            {item.description && (
                              <p className="text-xs md:text-sm text-gray-700 mb-2">{item.description}</p>
                            )}

                            {item.attachmentUrl && (
                              <div className="text-xs text-blue-600 mt-2">
                                📎 <a href={item.attachmentUrl} target="_blank" rel="noopener noreferrer" className="underline font-semibold hover:text-blue-800">
                                  {item.attachmentType.toUpperCase()}: View Attachment
                                </a>
                              </div>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex gap-2 ml-2 flex-shrink-0">
                            <button
                              onClick={() => setExpandedItemId(expandedItemId === item._id ? null : item._id)}
                              className="px-2 md:px-3 py-1 bg-purple-500 text-white text-xs rounded hover:bg-purple-600 transition whitespace-nowrap"
                            >
                              👁️ {item.responses?.length || 0}
                            </button>
                            <button
                              onClick={() => openEditForm(item)}
                              className="px-2 md:px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition whitespace-nowrap"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => handleDeleteItem(item._id)}
                              className="px-2 md:px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition whitespace-nowrap"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>

                        {/* Expanded Responses Section */}
                        {expandedItemId === item._id && item.responses && item.responses.length > 0 && (
                          <div className="mt-4 pt-4 border-t-2 border-gray-300">
                            <h5 className="font-bold text-sm mb-3 text-gray-900">Student Submissions & Questions</h5>
                            <div className="space-y-3 max-h-96 overflow-y-auto">
                              {item.responses.map((response, ridx) => (
                                <div key={ridx} className="bg-white rounded p-3 border-l-4 border-purple-400">
                                  <div className="flex justify-between items-start mb-2">
                                    <div>
                                      <p className="font-semibold text-sm text-gray-900">{response.studentName}</p>
                                      <div className="flex gap-2 mt-1">
                                        {response.isQuestion && (
                                          <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded font-semibold">
                                            QUESTION
                                          </span>
                                        )}
                                        {response.isPublic && (
                                          <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded font-semibold">
                                            PUBLIC
                                          </span>
                                        )}
                                        {response.isQuestion && !response.isPublic && (
                                          <span className="bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded font-semibold">
                                            PRIVATE
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                    <span className="text-xs text-gray-500 whitespace-nowrap">
                                      {new Date(response.createdAt).toLocaleString()}
                                    </span>
                                  </div>

                                  <p className="text-sm text-gray-700 mb-2">{response.responseText}</p>

                                  {response.attachmentUrl && (
                                    <a
                                      href={response.attachmentUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-xs text-blue-600 hover:text-blue-800 underline block mb-2"
                                    >
                                      📎 Student Attachment: {response.attachmentType}
                                    </a>
                                  )}

                                  {response.tutorRemark ? (
                                    <div className="bg-yellow-50 p-2 rounded border-l-4 border-yellow-400 mt-2">
                                      <p className="text-xs font-semibold text-yellow-700 uppercase mb-1">Your Remark:</p>
                                      <p className="text-sm text-gray-700">{response.tutorRemark}</p>
                                      <p className="text-xs text-gray-500 mt-1">
                                        {new Date(response.tutorRemarkAt).toLocaleString()}
                                      </p>
                                    </div>
                                  ) : (
                                    <button
                                      onClick={() => setReplying({ itemId: item._id, responseId: response._id })}
                                      className="text-xs bg-orange-500 text-white px-2 py-1 rounded hover:bg-orange-600 transition mt-2"
                                    >
                                      💬 Add Remark
                                    </button>
                                  )}

                                  {/* Remark Input */}
                                  {replying?.responseId === response._id && (
                                    <div className="mt-3 bg-orange-50 p-2 rounded">
                                      <textarea
                                        value={tutorRemarkText}
                                        onChange={(e) => setTutorRemarkText(e.target.value)}
                                        placeholder="Type your feedback..."
                                        className="w-full text-xs p-2 border border-orange-300 rounded focus:border-orange-500 focus:outline-none resize-none"
                                        rows="2"
                                      />
                                      <div className="flex gap-2 mt-2">
                                        <button
                                          onClick={handleAddTutorRemark}
                                          className="flex-1 text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600 transition"
                                        >
                                          Send Remark
                                        </button>
                                        <button
                                          onClick={() => {
                                            setReplying(null)
                                            setTutorRemarkText('')
                                          }}
                                          className="flex-1 text-xs bg-gray-400 text-white px-2 py-1 rounded hover:bg-gray-500 transition"
                                        >
                                          Cancel
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>

                            {/* Mark Complete Button */}
                            <div className="mt-3 flex gap-2 pt-3 border-t border-gray-200">
                              {item.isCompleted ? (
                                <button
                                  onClick={() => handleUnmarkItemComplete(item._id)}
                                  className="flex-1 text-xs bg-gray-500 text-white px-3 py-2 rounded hover:bg-gray-600 transition font-semibold"
                                >
                                  ↩️ Mark Incomplete
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleMarkItemComplete(item._id)}
                                  className="flex-1 text-xs bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700 transition font-semibold"
                                >
                                  ✓ Mark Complete
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
              </div>
            ) : (
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-8 md:p-12 text-center border-2 border-dashed border-gray-300">
                <div className="text-4xl mb-2">📚</div>
                <p className="text-base md:text-lg font-semibold text-gray-700">No items yet</p>
                <p className="text-xs md:text-sm text-gray-600 mt-1">Create an item or import from course curriculum</p>
              </div>
            )}
          </div>

          {/* STATS */}
          {selectedGroup.curriculumItems && selectedGroup.curriculumItems.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              {Object.entries(ITEM_TYPES).map(([key, val]) => {
                const count = selectedGroup.curriculumItems.filter(i => i.type === key).length
                return (
                  <div key={key} className="bg-white rounded-lg p-3 md:p-4 shadow text-center border-t-2" style={{ borderTopColor: val.color }}>
                    <div className="text-xl md:text-2xl font-bold" style={{ color: val.color }}>
                      {count}
                    </div>
                    <p className="text-xs text-gray-600 mt-1">{val.label}s</p>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
