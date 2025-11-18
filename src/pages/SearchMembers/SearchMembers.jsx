"use client"

import { FaSearch, FaMapMarkerAlt, FaPhone, FaEnvelope, FaArrowRight } from "react-icons/fa"
import { useSearchParams, useNavigate } from "react-router-dom"
import { LiaCertificateSolid } from "react-icons/lia";
import { FaUserGraduate } from "react-icons/fa6";
import { useState, useEffect } from "react"
import { PiStudent } from "react-icons/pi";
import { motion } from "framer-motion"
import toast from "react-hot-toast"
import "./SearchMembers.css"

const API_BASE_URL = import.meta.env.VITE_SERVER_URL

export default function SearchMembers() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "")
  const [searchResults, setSearchResults] = useState([])
  const [allProfiles, setAllProfiles] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [isLoadingProfiles, setIsLoadingProfiles] = useState(true)

  // Load all profiles on mount
  useEffect(() => {
    loadAllProfiles()
  }, [])

  // Auto-search if query param exists
  useEffect(() => {
    if (searchParams.get("q")) {
      handleSearch(null)
    }
  }, [searchParams])

  const loadAllProfiles = async () => {
    try {
      setIsLoadingProfiles(true)
      const response = await fetch(`${API_BASE_URL}/students/public/all`)
      const data = await response.json()
      console.log("Load profiles response:", data);

      if (response.ok) {
        setAllProfiles(data.data.profiles || [])
      } else {
        toast.error("Failed to load profiles")
      }
    } catch (error) {
      console.error("Load profiles error:", error)
      toast.error("Failed to load profiles")
    } finally {
      setIsLoadingProfiles(false)
    }
  }

  const handleSearch = async (e) => {
    if (e) e.preventDefault()
    if (!searchQuery.trim()) {
      toast.error("Please enter a search query")
      return
    }

    setIsSearching(true)
    setHasSearched(true)

    try {
      const response = await fetch(`${API_BASE_URL}/students/public/search?q=${encodeURIComponent(searchQuery)}`)
      const data = await response.json()

      if (response.ok) {
        setSearchResults(data.data.results || [])
        if (data.data.results.length === 0) {
          toast.error(`No members found matching "${searchQuery}"`)
        }
      } else {
        throw new Error(data.message || "Search failed")
      }
    } catch (error) {
      console.error("Search error:", error)
      toast.error(error.message || "Search failed")
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  const getStatusBadgeColor = (status) => {
    if (status === 'active') return '#2b8a3e'
    if (status === 'alumni') return '#1976d2'
    if (status === 'on_leave') return '#f57c00'
    return '#666666'
  }

  const getStatusLabel = (status) => {
    if (status === 'active')
      return <>
        <PiStudent className="inline-block mr-1" />
        Current Student
      </>

    if (status === 'alumni')
      return (
        <>
          <FaUserGraduate className="inline-block mr-1" />
          Certified Professional
        </>
      )

    if (status === 'on_leave')
      return <>⏸️ On Leave</>

    return status
  }

  const formatDate = (date) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
  }

  const ProfileCard = ({ profile, isAlumni }) => (
    <motion.div
      className="profile-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
    >
      {/* Certified Professional Ribbon */}
      {profile.verified ? (
        <div className="certified-ribbon">
          <span><LiaCertificateSolid size={15} />CERTIFIED</span>
        </div>
      ) : (
        <div className="student-ribbon">
          <span><LiaCertificateSolid size={15} />STUDENT</span>
        </div>
      )}

      {/* Profile Header */}
      <div className="profile-header">
        <div className="profile-image-wrapper flex gap-4">
          <img
            src={profile.profilePicture || '/placeholder-profile.jpg'}
            alt={`${profile.firstName} ${profile.lastName}`}
            className="profile-image"
            onError={(e) => (e.target.src = '/placeholder-profile.jpg')}
          />
          <div className="text-left">
            <h3 className="profile-name">
              {profile.firstName} {profile.lastName}
            </h3>

            {/* ID Number */}
            <div className="profile-id">
              <strong></strong> {profile.admissionNumber || 'N/A'}
            </div>

            {/* Course */}
            <div className="profile-course">
              <strong>Certified in: <br /> </strong> {profile.course || 'N/A'}
            </div>
          </div>
        </div>
      </div>

      {/* Profile Info */}
      <div className="profile-content">

        {/* Contact Info */}
        <div className="profile-contact">
          {profile.phone && (
            <a href={`tel:${profile.phone}`} className="contact-link flex justify-between" title="Call">
              <span>Phone</span>
              <span>{profile.phone}</span>
            </a>
          )}
          {profile.email && (
            <a href={`mailto:${profile.email}`} className="contact-link flex justify-between" title="Email">
              <span>Email:</span>
              <span>{profile.email}</span>
            </a>
          )}

          <a className="contact-link flex justify-between" title="Email"> 
            <span>Current Location:</span>
            {profile.currentLocation ? (
              <span>{profile.currentLocation}</span>) : (
              <span>....</span>
            )}
          </a>
        </div>

        {/* View Profile Button */}
        <button
          className="bg-[#2b2520] hover:bg-[#d4a644] cursor-pointer text-white font-semibold py-2 px-4 rounded mt-4 w-full flex items-center justify-center gap-2"
          onClick={() => navigate('/profile-detail', { state: { profile } })}
        >
          View Profile <FaArrowRight size={14} />
        </button>
      </div>
    </motion.div>
  )

  return (
    <div className="page search-members-page">
      <div className="container">
        <div className="mx-auto text-center mb-2">
          <p className="section-subtitle">Search and verify Zoezi Students and Alumni</p>
        </div>

        {/* Search Form */}
        <motion.form
          className="search-form"
          onSubmit={handleSearch}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="search-wrapper">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search by name, ID, email, or phone..."
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="search-btn" disabled={isSearching}>
              {isSearching ? "Searching..." : "Search"}
            </button>
          </div>
        </motion.form>

        {/* Results */}
        <div className="search-results">
          {isSearching && (
            <motion.div className="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="spinner"></div>
              <p>Searching...</p>
            </motion.div>
          )}

          {hasSearched && !isSearching && searchResults.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
              <p className="results-count">Found {searchResults.length} member(s)</p>
              <div className="results-grid">
                {searchResults.map((result, index) => (
                  <ProfileCard
                    key={`${result.admissionNumber}-${index}`}
                    profile={result}
                    isAlumni={result.status === 'alumni'}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {hasSearched && !isSearching && searchResults.length === 0 && (
            <motion.div className="no-results" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <p>No members found matching "{searchQuery}"</p>
              <p className="no-results-hint">Try searching with a different name, ID, email, or phone number</p>
            </motion.div>
          )}

          {!hasSearched && !isLoadingProfiles && allProfiles.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
              <p className="results-count">All Members ({allProfiles.length})</p>
              <div className="results-grid">
                {allProfiles.map((profile, index) => (
                  <ProfileCard
                    key={`${profile.admissionNumber}-${index}`}
                    profile={profile}
                    isAlumni={profile.status === 'alumni'}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {!hasSearched && !isLoadingProfiles && allProfiles.length === 0 && (
            <motion.div className="search-hint" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <p>No members available. Use the search bar to find student and professional credentials</p>
            </motion.div>
          )}

          {isLoadingProfiles && (
            <motion.div className="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="spinner"></div>
              <p>Loading profiles...</p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
