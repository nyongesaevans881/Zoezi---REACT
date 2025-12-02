import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

const API = import.meta.env.VITE_SERVER_URL

export default function MyStudents({ userData }) {
    const [groups, setGroups] = useState([])
    const [myStudents, setMyStudents] = useState([])
    const [tutorCourses, setTutorCourses] = useState([])
    const [loading, setLoading] = useState(false)
    const [newGroupName, setNewGroupName] = useState('')
    const [newGroupCourse, setNewGroupCourse] = useState('')
    const [creating, setCreating] = useState(false)

    const tutorId = userData?._id
    const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` })

    useEffect(() => { fetchAll() }, [tutorId])

    const fetchAll = async () => {
        if (!tutorId) return
        setLoading(true)
        const loadingToast = toast.loading('Loading your groups and students...')
        try {
            // Fetch groups
            const gRes = await fetch(`${API}/groups?tutorId=${tutorId}`, { headers: authHeader() })
            const gData = await gRes.json()
            if (!gRes.ok) throw new Error(gData.message || 'Failed to load groups')
            setGroups(gData.data.groups || [])

            // Fetch tutor record with myStudents and courses
            const tRes = await fetch(`${API}/tutors/${tutorId}`, { headers: authHeader() })
            const tData = await tRes.json()
            if (!tRes.ok) throw new Error(tData.message || 'Failed to load tutor data')

            const tutor = tData.data?.tutor
            if (tutor) {
                setMyStudents(tutor.myStudents || [])
                setTutorCourses(tutor.courses || [])
            } else {
                setMyStudents([])
                setTutorCourses([])
            }

            toast.dismiss(loadingToast)
            toast.success('Data loaded successfully')
        } catch (err) {
            console.error(err)
            toast.dismiss(loadingToast)
            toast.error(err.message || 'Failed to load data')
        } finally {
            setLoading(false)
        }
    }

    const unassignedStudents = myStudents.filter(s => !s.isAssignedToGroup)

    const createGroup = async () => {
        if (!newGroupName.trim()) return toast.error('Enter a group name')
        if (!newGroupCourse) return toast.error('Select a course')
        setCreating(true)
        try {
            const r = await fetch(`${API}/groups`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...authHeader() },
                body: JSON.stringify({ name: newGroupName, tutorId, courseId: newGroupCourse })
            })
            const d = await r.json()
            if (!r.ok) throw new Error(d.message)
            setNewGroupName('')
            setNewGroupCourse('')
            await fetchAll()
            toast.success('Group created successfully')
        } catch (err) {
            toast.error(err.message)
        } finally {
            setCreating(false)
        }
    }

    const deleteGroup = async (groupId) => {
        if (!confirm('Delete this group? Students will not be removed from your list.')) return
        try {
            const r = await fetch(`${API}/groups/${groupId}`, {
                method: 'DELETE',
                headers: authHeader()
            })
            if (!r.ok) throw new Error('Failed to delete')
            await fetchAll()
            toast.success('Group deleted')
        } catch (err) {
            toast.error(err.message)
        }
    }

    const addStudentToGroup = async (groupId, studentId) => {
        const student = myStudents.find(s => String(s.studentId) === String(studentId))
        if (!student) return toast.error('Student not found')

        try {
            const r = await fetch(`${API}/groups/${groupId}/add-student`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...authHeader() },
                body: JSON.stringify({ studentId, name: student.name })
            })
            const d = await r.json()
            if (!r.ok) throw new Error(d.message)
            await fetchAll()
            toast.success('Student added to group')
        } catch (err) {
            toast.error(err.message)
        }
    }

    const removeStudentFromGroup = async (groupId, studentId) => {
        if (!confirm('Remove student from this group?')) return
        try {
            const r = await fetch(`${API}/groups/${groupId}/remove-student`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...authHeader() },
                body: JSON.stringify({ studentId })
            })
            const d = await r.json()
            if (!r.ok) throw new Error(d.message)
            await fetchAll()
            toast.success('Student removed')
        } catch (err) {
            toast.error(err.message)
        }
    }

    const transferStudent = async (fromGroupId, toGroupId, studentId) => {
        try {
            const r = await fetch(`${API}/groups/transfer`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...authHeader() },
                body: JSON.stringify({ fromGroupId, toGroupId, studentId })
            })
            const d = await r.json()
            if (!r.ok) throw new Error(d.message)
            await fetchAll()
            toast.success('Student transferred')
        } catch (err) {
            toast.error(err.message)
        }
    }

    if (loading) return <div className="p-6 text-center text-gray-500">Loading...</div>

    return (
        <div className="p-6 space-y-8 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
            <h1 className='text-3xl font-bold'>Student Managemnet</h1>

            {/* CREATE GROUP SECTION */}
            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-brand-gold">
                <h2 className="text-2xl font-bold text-brand-dark mb-4 flex items-center gap-2">
                    <span className="text-brand-gold">+</span> Create New Group
                </h2>
                <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <input
                            type="text"
                            placeholder="Group name (e.g., Batch A, Morning Class)"
                            value={newGroupName}
                            onChange={e => setNewGroupName(e.target.value)}
                            className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-brand-gold focus:outline-none transition"
                        />
                        <select
                            value={newGroupCourse}
                            onChange={e => setNewGroupCourse(e.target.value)}
                            className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-brand-gold focus:outline-none transition cursor-pointer"
                        >
                            <option value="">Select a course</option>
                            {tutorCourses.map(c => (
                                <option key={c._id} value={c._id}>{c.name}</option>
                            ))}
                        </select>
                    </div>
                    <button
                        onClick={createGroup}
                        disabled={creating || !newGroupName.trim() || !newGroupCourse}
                        className="w-full md:w-auto px-6 py-3 bg-brand-gold text-white font-semibold rounded-lg hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
                    >
                        {creating ? 'Creating...' : 'Create Group'}
                    </button>
                </div>
            </div>

            {/* PENDING ASSIGNMENT SECTION */}
            <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-orange-400">
                <h2 className="text-2xl font-bold text-brand-dark mb-4 flex items-center gap-2">
                    <span className="text-orange-400">⏳</span> Pending Assignment ({unassignedStudents.length})
                </h2>

                {unassignedStudents.length === 0 ? (
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-8 text-center border-2 border-dashed border-blue-200">
                        <div className="text-4xl mb-2">✓</div>
                        <p className="text-lg font-semibold text-blue-900">All students assigned!</p>
                        <p className="text-sm text-blue-700 mt-1">Every student has been organized into a group</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {unassignedStudents.map(student => {
                            // Get course details from tutorCourses for display
                            const studentCourseId = student.courses?.[0]?.courseId
                            const courseDetails = tutorCourses.find(c => String(c._id) === String(studentCourseId))

                            return (
                                <div key={student.studentId} className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 border-l-4 border-orange-400 hover:shadow-md transition">
                                    <div className="mb-3">
                                        <h4 className="font-semibold text-gray-900">{student.name}</h4>
                                        {courseDetails && (
                                            <p className="text-xs text-gray-600 mt-1">📚 {courseDetails.name}</p>
                                        )}
                                        {student.courses?.[0]?.paymentStatus && (
                                            <p className="text-xs font-medium mt-1">
                                                Payment: <span className={student.courses[0].paymentStatus === 'PAID' ? 'text-green-600' : 'text-red-600'}>
                                                    {student.courses[0].paymentStatus}
                                                </span>
                                            </p>
                                        )}
                                    </div>

                                    {groups.length > 0 ? (
                                        <select
                                            defaultValue=""
                                            onChange={e => {
                                                if (e.target.value) {
                                                    addStudentToGroup(e.target.value, student.studentId)
                                                    e.target.value = ''
                                                }
                                            }}
                                            className="w-full px-3 py-2 text-sm border-2 border-orange-300 rounded-lg focus:border-brand-gold focus:outline-none transition cursor-pointer"
                                        >
                                            <option value="">+ Add to Group</option>
                                            {groups.map(g => (
                                                <option key={g._id} value={g._id}>{g.name}</option>
                                            ))}
                                        </select>
                                    ) : (
                                        <p className="text-xs text-gray-500 italic">Create a group first to add students</p>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>

            {/* ORGANIZED GROUPS SECTION */}
            <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-green-500">
                <h2 className="text-2xl font-bold text-brand-dark mb-4 flex items-center gap-2">
                    <span className="text-green-500">👥</span> Your Groups ({groups.length})
                </h2>

                {groups.length === 0 ? (
                    <div className="bg-gradient-to-br from-green-200 to-green-100 rounded-lg p-12 text-center border-2 border-dashed border-green-200">
                        <div className="text-5xl mb-3">📋</div>
                        <p className="text-lg font-semibold text-green-900">No groups yet</p>
                        <p className="text-sm text-green-700 mt-2">Create your first group using the form above to start organizing your students</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-5">
                        {groups.map(group => (
                            <div key={group._id} className="rounded-lg overflow-hidden shadow-md hover:shadow-lg transition">
                                {/* Group Header */}
                                <div className="bg-gray-400 px-4 py-3 text-white">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-lg font-bold">{group.name}</h3>
                                            <p className="text-xs opacity-90 mt-1">
                                                {group.students?.length || 0} student{(group.students?.length || 0) !== 1 ? 's' : ''}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => deleteGroup(group._id)}
                                            className="text-white hover:bg-red-500 p-1 rounded transition cursor-pointer"
                                            title="Delete group"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </div>

                                {/* Group Content */}
                                <div className="p-4">
                                    {group.students && group.students.length > 0 ? (
                                        <div className="space-y-2 mb-4">
                                            <p className="text-xs font-semibold text-gray-600 uppercase">Students</p>
                                            {group.students.map(student => (
                                                <div key={student.studentId} className="bg-white rounded-lg p-2 flex justify-between items-start">
                                                    <div className="flex-1">
                                                        <p className="text-sm font-semibold text-gray-900">{student.name}</p>
                                                        <p className="text-xs text-gray-500 mt-0.5">
                                                            Added {new Date(student.addedAt).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                    <div className="flex gap-1 ml-2">
                                                        <button
                                                            onClick={() => removeStudentFromGroup(group._id, student.studentId)}
                                                            className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition"
                                                            title="Remove from group"
                                                        >
                                                            ✕
                                                        </button>
                                                        {groups.length > 1 && (
                                                            <select
                                                                defaultValue=""
                                                                onChange={e => {
                                                                    if (e.target.value) {
                                                                        transferStudent(group._id, e.target.value, student.studentId)
                                                                        e.target.value = ''
                                                                    }
                                                                }}
                                                                className="text-xs border rounded px-1 py-0.5"
                                                                title="Transfer to another group"
                                                            >
                                                                <option value="">→</option>
                                                                {groups.filter(g => String(g._id) !== String(group._id)).map(g => (
                                                                    <option key={g._id} value={g._id}>{g.name}</option>
                                                                ))}
                                                            </select>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="bg-white rounded-lg p-3 text-center mb-4 border-2 border-dashed border-gray-300">
                                            <p className="text-xs text-gray-500">No students in this group</p>
                                        </div>
                                    )}

                                    {/* Add Student to Group */}
                                    {unassignedStudents.length > 0 && (
                                        <div className="border-t border-gray-300 pt-3">
                                            <select
                                                defaultValue=""
                                                onChange={e => {
                                                    if (e.target.value) {
                                                        addStudentToGroup(group._id, e.target.value)
                                                        e.target.value = ''
                                                    }
                                                }}
                                                className="w-full px-3 py-2 text-sm border-2 border-green-300 rounded-lg focus:border-brand-gold focus:outline-none transition cursor-pointer"
                                            >
                                                <option value="">+ Add Student to {group.name}</option>
                                                {unassignedStudents.map(s => (
                                                    <option key={s.studentId} value={s.studentId}>{s.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* STATS FOOTER */}
            {(groups.length > 0 || myStudents.length > 0) && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white rounded-lg p-4 shadow text-center border-t-2 border-blue-500">
                        <div className="text-2xl font-bold text-blue-600">{myStudents.length}</div>
                        <p className="text-xs text-gray-600 mt-1">Total Students</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow text-center border-t-2 border-green-500">
                        <div className="text-2xl font-bold text-green-600">{groups.length}</div>
                        <p className="text-xs text-gray-600 mt-1">Groups Created</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow text-center border-t-2 border-orange-500">
                        <div className="text-2xl font-bold text-orange-600">{unassignedStudents.length}</div>
                        <p className="text-xs text-gray-600 mt-1">Pending</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow text-center border-t-2 border-purple-500">
                        <div className="text-2xl font-bold text-purple-600">{myStudents.length - unassignedStudents.length}</div>
                        <p className="text-xs text-gray-600 mt-1">Organized</p>
                    </div>
                </div>
            )}
        </div>
    )
}
