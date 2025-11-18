"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { FaSearch } from "react-icons/fa"
import "./HeroSection.css"

export default function HeroSection() {
  const [searchQuery, setSearchQuery] = useState("")
  const navigate = useNavigate()

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/search-members?q=${encodeURIComponent(searchQuery)}`)
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
          <p className="hero-subtitle">Excellence in Fitness & Wellness Education</p>
          <p className="hero-description">
            Transform your passion for fitness into a professional career with our NITA-accredited certification program
          </p>
        </motion.div>

        <motion.form
          className="hero-search"
          onSubmit={handleSearch}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <div className="search-input-wrapper">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search student or certified professional..."
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button type="submit" className="search-btn">
            Search
          </button>
        </motion.form>
      </div>
    </section>
  )
}
