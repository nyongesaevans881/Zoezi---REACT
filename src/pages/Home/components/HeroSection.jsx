"use client"

import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { FaSearch } from "react-icons/fa"
import "./HeroSection.css"

const API_BASE_URL = import.meta.env.VITE_SERVER_URL

// Custom debounce hook
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value)
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)
    
    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])
  
  return debouncedValue
}

export default function HeroSection() {
  const [searchQuery, setSearchQuery] = useState("")
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false)
  const suggestionsRef = useRef(null)
  const navigate = useNavigate()
  
  // Debounced search query for autocomplete
  const debouncedSearchQuery = useDebounce(searchQuery, 300)
  
  // Fetch autocomplete suggestions
  useEffect(() => {
    if (debouncedSearchQuery.trim().length >= 2) {
      fetchAutocompleteSuggestions(debouncedSearchQuery)
    } else {
      setSuggestions([])
    }
  }, [debouncedSearchQuery])
  
  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
        setShowSuggestions(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])
  
  const fetchAutocompleteSuggestions = async (query) => {
    try {
      setIsLoadingSuggestions(true)
      const response = await fetch(`${API_BASE_URL}/students/public/autocomplete?q=${encodeURIComponent(query)}&limit=5`)
      const data = await response.json()
      
      if (response.ok) {
        setSuggestions(data.data.suggestions || [])
      }
    } catch (error) {
      console.error("Autocomplete error:", error)
      setSuggestions([])
    } finally {
      setIsLoadingSuggestions(false)
    }
  }
  
  const handleSearch = (e) => {
    e.preventDefault()
    setShowSuggestions(false)
    if (searchQuery.trim()) {
      navigate(`/search-members?q=${encodeURIComponent(searchQuery)}`)
    }
  }
  
  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion.name)
    setShowSuggestions(false)
    // Navigate directly to search with the selected suggestion
    navigate(`/search-members?q=${encodeURIComponent(suggestion.name)}`)
  }
  
  const handleInputChange = (e) => {
    const value = e.target.value
    setSearchQuery(value)
    setShowSuggestions(value.trim().length >= 2)
  }
  
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch(e)
    } else if (e.key === 'Escape') {
      setShowSuggestions(false)
    }
  }
  
  const handleInputFocus = () => {
    if (searchQuery.trim().length >= 2 && suggestions.length > 0) {
      setShowSuggestions(true)
    }
  }

  return (
    <section className="hero-section">
      <div className="hero-background">
        <img src="/hero.jpg" alt="Fitness Training" className="hero-image" />
        <div className="hero-overlay"></div>
      </div>

      <div className="hero-content">
        <motion.div
          className="hero-text"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="hero-title">Nairobi Zoezi Institute</h1>
          <p className="hero-subtitle max-md:hidden">Excellence in Fitness & Wellness Education</p>
          <p className="text-white font-semibold max-md:text-sm">
            Study fitness, anytime, anywhere.
            Turn your passion for fitness into a career with <span className="bg-gradient-to-b from-blue-600 to-purple-400 inline-block text-transparent bg-clip-text font-extrabold">Zoezi Soma the flexible, interactive way</span> to learn from leading fitness experts. 
            <span className="bg-gradient-to-b from-blue-600 to-purple-400 inline-block text-transparent bg-clip-text font-extrabold">Study online at your own pace, gain real-</span>world skills, and join a growing community of fitness professionals shaping the future of health and wellness.
          </p>
          <motion.button
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-md mt-4 font-semibold hover:bg-yellow-600 flex items-center gap-2 mx-auto cursor-pointer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/login")}
          >
            📚 Enroll into Zoezi Soma🎓
          </motion.button>
        </motion.div>

        <motion.form
          className="hero-search"
          onSubmit={handleSearch}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <div className="search-input-wrapper relative" ref={suggestionsRef}>
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search student or certified professional..."
              className="search-input"
              value={searchQuery}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onFocus={handleInputFocus}
            />
            
            {/* Autocomplete Suggestions */}
            <AnimatePresence>
              {showSuggestions && (
                <motion.div
                  className="hero-suggestions-dropdown"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {isLoadingSuggestions ? (
                    <div className="suggestion-item">
                      <div className="suggestion-loading">Loading suggestions...</div>
                    </div>
                  ) : suggestions.length > 0 ? (
                    suggestions.map((suggestion, index) => (
                      <div
                        key={`${suggestion.email}-${index}`}
                        className="suggestion-item"
                        onClick={() => handleSuggestionClick(suggestion)}
                      >
                        <div className="suggestion-name">{suggestion.display}</div>
                        <div className="suggestion-type">
                          <span className={`suggestion-type-badge ${suggestion.type.toLowerCase()}`}>
                            {suggestion.type}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="suggestion-item">
                      <div className="suggestion-no-results">No suggestions found</div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <button type="submit" className="search-btn">
            Search
          </button>
        </motion.form>
      </div>
    </section>
  )
}