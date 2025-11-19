"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import { HiMenu, HiX } from "react-icons/hi"
import { FaFacebook, FaInstagram, FaLinkedin, FaTwitter } from "react-icons/fa"
import { motion, AnimatePresence } from "framer-motion"
import "./Navbar.css"

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  const menuItems = [
    { label: "Home", path: "/" },
    { label: "Who We Are", path: "/who-we-are" },
    { label: "What We Do", path: "/what-we-do" },
    { label: "Apply Now", path: "/apply-now" },
    { label: "Contact", path: "/contact" },
  ]

  const socialIcons = [
    { icon: FaFacebook, url: "#" },
    { icon: FaInstagram, url: "#" },
    { icon: FaLinkedin, url: "#" },
    { icon: FaTwitter, url: "#" },
  ]

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="flex justify-between items-center w-full">

          {/* Logo */}
          <Link to="/" className="navbar-logo">
            <div className="logo-wrapper">
              <span className="logo-text">ZOEZI</span>
              <span className="logo-subtext">INSTITUTE</span>
            </div>
          </Link>

          {/* Desktop Menu */}
          <div className="desktop-menu">
            <div className="nav-links">
              {menuItems.map((item) => (
                <Link key={item.path} to={item.path} className="nav-link" onClick={() => setIsOpen(false)}>
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <Link to="/search-members" className="btn-search">
              Search Member
            </Link>
            <Link to="/login" className="btn-login">
              Member Login
            </Link>
          </div>

          {/* Hamburger Menu */}
          <button className="hamburger" onClick={toggleMenu}>
            {isOpen ? <HiX size={28} /> : <HiMenu size={28} />}
          </button>

          {/* Mobile Menu */}
          <AnimatePresence>
            {isOpen && (
              <motion.div
                className="mobile-menu"
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ duration: 0.3 }}
              >
                <div className="mobile-menu-content">
                  <div className="mobile-nav-links">
                    {menuItems.map((item) => (
                      <Link key={item.path} to={item.path} className="mobile-nav-link" onClick={() => setIsOpen(false)}>
                        {item.label}
                      </Link>
                    ))}
                  </div>

                  <div className="mobile-actions">
                    <Link to="/search-members" className="btn-search mobile-btn" onClick={() => setIsOpen(false)}>
                      Search Member
                    </Link>
                    <Link to="/login" className="btn-login mobile-btn" onClick={() => setIsOpen(false)}>
                      Member Login
                    </Link>
                  </div>

                  {/* Mobile Social Icons */}
                  <div className="mobile-socials">
                    {socialIcons.map((social, index) => {
                      const Icon = social.icon
                      return (
                        <a
                          key={index}
                          href={social.url}
                          className="mobile-social-icon"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Icon size={24} />
                        </a>
                      )
                    })}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>


      </div>
    </nav>
  )
}
