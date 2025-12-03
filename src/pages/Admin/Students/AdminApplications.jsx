import { useEffect, useState } from "react"
import AdminLayout from "../AdminLayout/AdminLayout"
import ApplicationDetailModal from "../components/ApplicationDetailModal"
import AcceptModal from "../components/AcceptModal"
import { TbScanEye } from "react-icons/tb";
import "./AdminApplications.css"
import { FaRegCheckCircle } from "react-icons/fa";
import { IoMdCloseCircleOutline } from "react-icons/io";
import { LuRefreshCcw } from "react-icons/lu";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_SERVER_URL

export default function AdminApplications() {
  const [applications, setApplications] = useState([])
  const [filteredApplications, setFilteredApplications] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedApplication, setSelectedApplication] = useState(null)
  const [acceptModalOpen, setAcceptModalOpen] = useState(false)
  const [acceptingAppNumber, setAcceptingAppNumber] = useState(null)
  const [rejectModalOpen, setRejectModalOpen] = useState(false)
  const [rejectingAppNumber, setRejectingAppNumber] = useState(null)
  const [rejectReason, setRejectReason] = useState('')

  // Filters
  const [filters, setFilters] = useState({
    status: "all",
    searchTerm: "",
    sortBy: "newest",
  })

  // Fetch applications on mount
  useEffect(() => {
    fetchApplications()
  }, [])

  // Apply filters whenever applications or filters change
  useEffect(() => {
    applyFilters()
  }, [applications, filters])

  const fetchApplications = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`${API_BASE_URL}/applications`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        toast.error(`Failed to fetch applications: ${response.statusText}`)
        throw new Error(`Failed to fetch applications: ${response.status}`)
      }

      const data = await response.json()
      setApplications(data.data?.applications || [])
      toast.success("Applications fetched successfully")
    } catch (err) {
      console.error("Error fetching applications:", err)
      toast.error(`Error fetching applications: ${err.message}`)
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...applications]

    // Filter by status
    if (filters.status !== "all") {
      filtered = filtered.filter((app) => app.status === filters.status)
    }

    // Filter by search term (name, email, phone, application number)
    if (filters.searchTerm) {
      const search = filters.searchTerm.toLowerCase()
      filtered = filtered.filter((app) => {
        const fullName = `${app.firstName} ${app.lastName}`.toLowerCase()
        return (
          fullName.includes(search) ||
          app.email.toLowerCase().includes(search) ||
          app.phone.includes(search) ||
          app.applicationNumber.toLowerCase().includes(search)
        )
      })
    }

    // Sort applications
    if (filters.sortBy === "newest") {
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    } else if (filters.sortBy === "oldest") {
      filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    } else if (filters.sortBy === "name") {
      filtered.sort((a, b) => `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`))
    }

    setFilteredApplications(filtered)
  }

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters((prev) => ({ ...prev, [name]: value }))
  }

  const handleSearchChange = (e) => {
    setFilters((prev) => ({ ...prev, searchTerm: e.target.value }))
  }

  const handleReject = (applicationNumber) => {
    setRejectingAppNumber(applicationNumber)
    setRejectReason('')
    setRejectModalOpen(true)
  }

  const confirmReject = () => {
    if (!rejectingAppNumber) return

    // send change-status request
    fetch(`${API_BASE_URL}/applications/${rejectingAppNumber}/change-status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newStatus: 'rejected', adminNote: rejectReason, adminName: 'Admin' })
    })
      .then(async (res) => {
        const data = await res.json()
        if (!res.ok) throw new Error(data.message || 'Failed to update status')
        // refresh list
        fetchApplications()
        toast.success('Application rejected')
        setRejectModalOpen(false)
        setRejectReason('')
        setRejectingAppNumber(null)
      })
      .catch((err) => {
        console.error('Reject error', err)
        toast.error('Failed to reject application: ' + err.message)
      })
  }

  const handleAdmit = (applicationNumber) => {
    setAcceptingAppNumber(applicationNumber)
    setAcceptModalOpen(true)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getStatusColor = (status) => {
    const colors = {
      pending: "#f59e0b",
      under_review: "#3b82f6",
      shortlisted: "#10b981",
      accepted: "#065f46",
      rejected: "#ef4444",
    }
    return colors[status] || "#6b7280"
  }

  return (
    <AdminLayout>
      <div className="admin-applications">
        <div className="page-header flex flex-col gap-4 mb-4">
          <div>
            <h2>Application Management</h2>
            <p className="subtitle">Manage and review student applications</p>
          </div>
          <div className='flex gap-2'>
            <Link
              className='bg-primary-gold text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-yellow transition-colors'
              to="/admin/students">
              Students
            </Link>
            <Link
              className='bg-blue-400 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-500 transition-colors'
              to="/admin/applications">
              Applications
            </Link>
            <Link
              className='bg-green-400 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-500 transition-colors'
              to="/admin/admissions">
              Admissions
            </Link>
            <Link
              className='bg-red-400 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-500 transition-colors'
              to="/admin/update-fee">
              Update Fee
            </Link>
            <Link
              className='bg-purple-400 text-white px-4 py-2 rounded-lg font-semibold hover:bg-purple-500 transition-colors'
              to="/admin/details">
              Details
            </Link>
          </div>
        </div>


        {/* Stats Section */}
        <div className="grid grid-cols-4 gap-4">
          <div className="stat-card">
            <span className="stat-label">Total Applications</span>
            <span className="stat-value">{applications.length}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Pending Review</span>
            <span className="stat-value">{applications.filter((a) => a.status === "pending").length}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Accepted</span>
            <span className="stat-value">{applications.filter((a) => a.status === "accepted").length}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Rejected</span>
            <span className="stat-value">{applications.filter((a) => a.status === "rejected").length}</span>
          </div>
        </div>

        {/* Filters Section */}
        <div className="grid grid-cols-4 gap-4 my-5 bg-gray-100 p-4 rounded-lg items-end">
          <div className="filter-group">
            <label htmlFor="search">Search</label>
            <input
              type="text"
              id="search"
              placeholder="Search by name, email, phone, or app number..."
              value={filters.searchTerm}
              onChange={handleSearchChange}
              className="filter-input"
            />
          </div>

          <div className="filter-group">
            <label htmlFor="status">Status</label>
            <select
              id="status"
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="filter-select"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="sortBy">Sort By</label>
            <select
              id="sortBy"
              name="sortBy"
              value={filters.sortBy}
              onChange={handleFilterChange}
              className="filter-select"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="name">Name (A-Z)</option>
            </select>
          </div>

          <button className="bg-gray-600 flex items-center w-fit justify-center px-5 py-2 rounded-lg mb-1 text-white font-bold" onClick={fetchApplications}>
            <LuRefreshCcw />&nbsp; Refresh
          </button>
        </div>

        {/* Applications Table */}
        <div className="table-container">
          {isLoading ? (
            <div className="loading-state">
              <p>Loading applications...</p>
            </div>
          ) : error ? (
            <div className="error-state">
              <p>❌ Error: {error}</p>
              <button className="btn-retry" onClick={fetchApplications}>
                Retry
              </button>
            </div>
          ) : filteredApplications.length === 0 ? (
            <div className="empty-state">
              <p>📭 No applications found</p>
            </div>
          ) : (
            <table className="applications-table">
              <thead>
                <tr>
                  <th>Applicant</th>
                  <th>Contact</th>
                  <th>Course</th>
                  <th>Status</th>
                  <th>Submitted</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredApplications.map((app) => (
                  <tr key={app._id}>
                    <td className="cell-appnumber">
                      {app.applicationNumber}  <br />
                      {`${app.firstName} ${app.lastName}`}
                    </td>
                    <td className="cell-email">
                      {app.email} <br />
                      {app.phone}
                    </td>
                    <td className="cell-course">{app.course}</td>
                    <td className="cell-status">
                      <span
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(app.status) }}
                      >
                        {app.status.replace("_", " ").toUpperCase()}
                      </span>
                    </td>
                    <td className="cell-date">{formatDate(app.createdAt)}</td>
                    <td className="cell-actions">
                      <button
                        className="btn-view"
                        onClick={() => setSelectedApplication(app)}
                        title="View Details"
                      >
                        <TbScanEye />&nbsp; Details
                      </button>
                      <button
                        className="btn-admit"
                        onClick={() => handleAdmit(app.applicationNumber)}
                        title="Admit"
                      >
                        <FaRegCheckCircle />&nbsp; Admit
                      </button>
                      <button
                        className="btn-reject"
                        onClick={() => handleReject(app.applicationNumber)}
                        title="Reject"
                      >
                        <IoMdCloseCircleOutline />&nbsp; Cancel
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      <ApplicationDetailModal application={selectedApplication} onClose={() => setSelectedApplication(null)} />
      <AcceptModal
        open={acceptModalOpen}
        applicationNumber={acceptingAppNumber}
        onClose={() => setAcceptModalOpen(false)}
        onAccepted={() => fetchApplications()}
      />

      {/* Rejection Confirmation Modal */}
      {rejectModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            {/* Header */}
            <div className="p-6 border-b-2" style={{ borderColor: '#d4a644', backgroundColor: '#f5f5f3' }}>
              <h2 className="text-xl font-bold" style={{ color: '#2b2520' }}>
                ⚠️ Reject Application
              </h2>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              <p className="text-gray-600">
                Are you sure you want to reject this application? Please provide a reason for rejection.
              </p>

              <textarea
                placeholder="Enter rejection reason (optional)..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none resize-none"
                style={{ borderColor: '#d4a644', minHeight: '100px' }}
              />

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setRejectModalOpen(false)
                    setRejectReason('')
                    setRejectingAppNumber(null)
                  }}
                  className="flex-1 px-4 py-2 rounded-lg font-semibold transition-colors border-2"
                  style={{
                    borderColor: '#2b2520',
                    color: '#2b2520',
                    backgroundColor: 'transparent'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmReject}
                  className="flex-1 px-4 py-2 rounded-lg font-semibold text-white transition-colors"
                  style={{ backgroundColor: '#d32f2f' }}
                >
                  Confirm Rejection
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
