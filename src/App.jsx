import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { Toaster } from 'react-hot-toast';
import "./App.css"

import Navbar from "./components/Navbar/Navbar"
import Footer from "./components/Footer/Footer"
import ProtectedRoute from "./components/ProtectedRoute"
import ScrollToTop from "./components/ScrollToTop"

import Home from "./pages/Home/Home"
import WhoWeAre from "./pages/WhoWeAre/WhoWeAre"
import WhatWeDo from "./pages/WhatWeDo/WhatWeDo"
import ApplyNow from "./pages/ApplyNow/ApplyNow"
import Contact from "./pages/Contact/Contact"
import SearchMembers from "./pages/SearchMembers/SearchMembers"
import ProfileDetail from "./pages/ProfileDetail/ProfileDetail"

// Auth Pages
import Login from "./pages/Login/Login"
import ForgotPassword from "./pages/ForgotPassword/ForgotPassword"

// Admin Pages
import AdminDashboard from "./pages/Admin/AdminDashboard"
import AdminApplications from "./pages/Admin/AdminApplications"
import AdminAdmissions from "./pages/Admin/AdminAdmissions"
import AdminUpdateFee from "./pages/Admin/AdminUpdateFee"
import AdminStudents from "./pages/Admin/AdminStudents"
import AdminAlumni from "./pages/Admin/AdminAlumni"
import AdminDetails from "./pages/Admin/AdminDetails"

// User Pages
import UserDashboard from "./pages/UserDashboard/UserDashboard"
import AdminSubscriptions from "./pages/Admin/AdminSubscriptions";

function App() {
  return (
    <Router>
      <ScrollToTop />
      <Toaster position="top-right" containerClassName='relative z-9999999999999' />
      <Routes>
        {/* Public Routes */}
        <Route
          path="/*"
          element={
            <>
              <Navbar />
              <main className="min-h-screen">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/who-we-are" element={<WhoWeAre />} />
                  <Route path="/what-we-do" element={<WhatWeDo />} />
                  <Route path="/apply-now" element={<ApplyNow />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/search-members" element={<SearchMembers />} />
                  <Route path="/profile-detail" element={<ProfileDetail />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />

                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <UserDashboard />
                      </ProtectedRoute>
                    }
                  />
                </Routes>
              </main>
              <Footer />
            </>
          }
        />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/applications" element={<AdminApplications />} />
        <Route path="/admin/admissions" element={<AdminAdmissions />} />
        <Route path="/admin/update-fee" element={<AdminUpdateFee />} />
        <Route path="/admin/students" element={<AdminStudents />} />
        <Route path="/admin/alumni" element={<AdminAlumni />} />
        <Route path="/admin/details" element={<AdminDetails />} />
        <Route path="/admin/subscriptions" element={<AdminSubscriptions />} />

        {/* User Routes */}
      </Routes>
    </Router>
  )
}

export default App
