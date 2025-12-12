// components/CourseCard.jsx
import { motion } from "framer-motion"
import { FaRegCheckCircle, FaStar, FaInfoCircle, FaClock, FaUsers, FaCertificate, FaCalendar, FaBook, FaUserGraduate, FaCheck, FaArrowRight } from "react-icons/fa"
import { Link } from "react-router-dom"
import { useState } from "react"
import { GoDotFill } from "react-icons/go";

export default function CourseCard({ course, index = 0, showAllDetails = true }) {
  const [showInfoModal, setShowInfoModal] = useState(false)

  // Check if this is the first course (main course)
  const isMainCourse = index === 0;

  // Helper function to determine if course has an offer
  const hasActiveOffer = (course) => {
    return course.offerPrice &&
      course.courseFee &&
      course.offerPrice < course.courseFee
  }

  // Calculate discount percentage
  const calculateDiscountPercentage = (course) => {
    if (!hasActiveOffer(course)) return 0
    const discount = ((course.courseFee - course.offerPrice) / course.courseFee) * 100
    return Math.round(discount)
  }

  // Get course tier color
  const getTierColor = (tier) => {
    switch (tier?.toLowerCase()) {
      case 'basic': return 'bg-purple-100 text-purple-800 border-purple-300'
      case 'advanced': return 'bg-purple-100 text-purple-800 border-purple-300'
      case 'elite': return 'bg-purple-100 text-purple-800 border-purple-300'
      default: return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  // If it's the main course, render the expanded layout
  if (isMainCourse) {
    return (
      <>
        {/* Main Course - Full Width Layout */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="col-span-1 md:col-span-3 bg-white rounded-xl border-2 border-primary-gold shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden group"
        >
          {/* Header Badge */}
          <div className="relative">
            {course.coverImage?.url && (
              <div className="relative h-64 md:h-80 overflow-hidden">
                <img
                  src={course.coverImage.url}
                  alt={course.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                {/* <div className="absolute inset-0 bg-gradient-to-r from-blue-900/70 to-purple-900/60"></div> */}

                {/* Main Course Badge */}
                <div className="absolute top-4 left-4 bg-brand-yellow text-white px-4 py-2 rounded-full font-bold text-sm flex items-center gap-2">
                  <FaStar className="animate-pulse" />
                  POPULAR COURSE
                  <FaStar className="animate-pulse" />
                </div>

                {/* Course Type Badge */}
                <div className="absolute top-4 right-4">
                  <div className={`px-4 py-2 rounded-full font-bold text-sm flex items-center gap-2 ${course.courseType === "online" ? "bg-purple-600/90 text-white" : course.courseType === "physical" ? "bg-blue-600/90 text-white" : "bg-green-600/90 text-white"}`}>
                    <FaRegCheckCircle />
                    {course.courseType === "online" ? "ONLINE" : course.courseType === "physical" ? "PHYSICAL" : "HYBRID"}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Main Course Content - Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6 md:p-8">
            {/* Left Column - Details */}
            <div className="space-y-6">
              {/* Course Highlights */}
              <div>
                {/* Course Title on Image */}
                <h3 className="text-2xl md:text-3xl font-bold text-primary-gold mb-2">
                  {course.name}
                </h3>
                <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <FaCertificate className="text-blue-600" />
                  Course Highlights
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3 bg-white p-4 rounded-lg border border-gray-200">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <FaClock className="text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">Duration</p>
                      <p className="text-gray-600">{course.duration} {course.durationType}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 bg-white p-4 rounded-lg border border-gray-200">
                    <div className="bg-purple-100 p-2 rounded-lg">
                      <FaBook className="text-purple-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">Format</p>
                      <p className="text-gray-600 capitalize">{course.courseType}</p>
                    </div>
                  </div>

                  {course.courseTier && (
                    <div className="flex items-start gap-3 bg-white p-4 rounded-lg border border-gray-200">
                      <div className="bg-yellow-100 p-2 rounded-lg">
                        <FaUserGraduate className="text-yellow-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">Level</p>
                        <p className="text-gray-600 capitalize">{course.courseTier}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-3 bg-white p-4 rounded-lg border border-gray-200">
                    <div className="bg-green-100 p-2 rounded-lg">
                      <FaCalendar className="text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">Enrollment</p>
                      <p className="text-gray-600">Open Now</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Description */}
              <div>
                <h4 className="text-lg font-bold text-gray-800 mb-3">Overview</h4>
                <p className="text-gray-700 line-clamp-4">
                  {course.description}
                </p>
                <button
                  onClick={() => setShowInfoModal(true)}
                  className="mt-3 text-blue-600 hover:text-blue-800 font-medium flex items-center gap-2 transition-colors"
                >
                  Read more details <FaArrowRight size={12} />
                </button>
              </div>
            </div>

            {/* Right Column - Pricing & CTA */}
            <div className="space-y-6">
              {/* Pricing Section */}
              <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl border-2 border-blue-200 p-6">
                <h4 className="text-xl font-bold text-gray-800 mb-4">Course Investment</h4>

                {hasActiveOffer(course) ? (
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-gray-900 mb-1">
                        KES {course.offerPrice?.toLocaleString()}
                      </div>
                    </div>

                    <div className="space-y-2 pt-4 border-t border-gray-200">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Original Price:</span>
                        <span className="text-lg line-through text-gray-400">KES {course.courseFee?.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">You Save:</span>
                        <span className="text-lg font-bold text-red-600">
                          KES {(course.courseFee - course.offerPrice)?.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Discount:</span>
                        <span className="text-lg font-bold text-red-600">
                          {calculateDiscountPercentage(course)}% OFF
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="text-4xl font-bold text-gray-900 mb-2">
                      {course.courseFee === 0 ? 'FREE' : `KES ${course.courseFee?.toLocaleString()}`}
                    </div>
                    {course.courseFee === 0 ? (
                      <div className="text-lg text-green-600 font-bold">No Cost Enrollment</div>
                    ) : (
                      <div className="text-sm text-gray-600">Full Course Access</div>
                    )}
                  </div>
                )}
              </div>

              {/* CTA Buttons */}
              <div className="space-y-4">
                {course.courseType === "online" ? (
                  <Link
                    to="/login"
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-4 px-6 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl"
                  >
                    <FaStar />
                    Enroll Now - Start Today!
                    <FaArrowRight />
                  </Link>
                ) : (
                  <Link
                    to="/apply-now"
                    className="w-full bg-primary-gold hover:from-orange-600 hover:to-red-600 text-white py-4 px-6 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl"
                  >
                    <FaCalendar />
                    Apply Now
                    <FaArrowRight />
                  </Link>
                )}

                <button
                  onClick={() => setShowInfoModal(true)}
                  className="w-full border-2 border-blue-600 text-blue-600 hover:bg-blue-50 py-4 px-6 rounded-xl font-semibold text-lg flex items-center justify-center gap-3 transition-all duration-300"
                >
                  <FaInfoCircle />
                  View Course Details
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Info Modal (same as before) */}
        {showInfoModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-99999">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-bold text-primary-dark">{course.name}</h3>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${course.courseType === "online" ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"
                      }`}>
                      {course.courseType === "online" ? "🖥️ ONLINE COURSE" : "🏫 PHYSICAL COURSE"}
                    </span>
                    {course.courseTier && (
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getTierColor(course.courseTier)}`}>
                        {course.courseTier.toUpperCase()}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setShowInfoModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  &times;
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6">
                {/* Course Image */}
                {course.coverImage?.url && (
                  <div className="mb-6 rounded-lg overflow-hidden">
                    <img
                      src={course.coverImage.url}
                      alt={course.name}
                      className="w-full h-64 object-cover"
                    />
                  </div>
                )}

                {/* Full Description */}
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-primary-dark mb-3 flex items-center gap-2">
                    <FaCertificate /> Course Description
                  </h4>
                  <p className="text-gray-700 whitespace-pre-line">{course.description}</p>
                </div>

                {/* Course Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 text-primary-dark font-semibold mb-2">
                      <FaClock /> Duration
                    </div>
                    <p className="text-gray-700">{course.duration} {course.durationType}</p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 text-primary-dark font-semibold mb-2">
                      <FaUsers /> Course Type
                    </div>
                    <p className="text-gray-700 capitalize">{course.courseType}</p>
                  </div>
                </div>

                {/* Pricing Information */}
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-primary-dark mb-3">Pricing Information</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    {hasActiveOffer(course) ? (
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Original Price:</span>
                          <span className="text-lg line-through text-gray-400">KES {course.courseFee?.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Special Offer Price:</span>
                          <span className="text-2xl font-bold text-green-600">KES {course.offerPrice?.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">You Save:</span>
                          <span className="text-lg font-bold text-primary-gold">
                            KES {(course.courseFee - course.offerPrice)?.toLocaleString()} ({calculateDiscountPercentage(course)}%)
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Course Fee:</span>
                        <span className={`text-2xl font-bold ${course.courseFee === 0 ? 'text-green-600' : 'text-primary-dark'}`}>
                          {course.courseFee === 0 ? 'FREE' : `KES ${course.courseFee?.toLocaleString()}`}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Ribbon Legend */}
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-primary-dark mb-3">Color Legend</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-purple-500 rounded"></div>
                      <span className="text-gray-700"><strong>Purple Ribbon:</strong> Online courses - Study from anywhere, anytime</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-blue-500 rounded"></div>
                      <span className="text-gray-700"><strong>Blue Ribbon:</strong> Physical courses - On-campus learning experience</span>
                    </div>
                  </div>
                </div>

                {/* Course Tiers (Online only) */}
                {course.courseType === "online" && (
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-primary-dark mb-3">Course Tiers</h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getTierColor('basic')}`}>BASIC</span>
                        <span className="text-gray-700">Essential knowledge and skills</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getTierColor('advanced')}`}>ADVANCED</span>
                        <span className="text-gray-700">In-depth training with practical exercises</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getTierColor('elite')}`}>ELITE</span>
                        <span className="text-gray-700">Mastery level with certification and mentorship</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="sticky bottom-0 bg-white border-t p-6 flex justify-end gap-3">
                <button
                  onClick={() => setShowInfoModal(false)}
                  className="px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:border-gray-400 transition-colors"
                >
                  Close
                </button>
                {course.courseType === "online" ? (
                  <Link
                    to="/login"
                    onClick={() => setShowInfoModal(false)}
                    className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:bg-brand-gold/90 transition-colors"
                  >
                    Enroll Now
                  </Link>
                ) : (
                  <Link
                    to="/apply-now"
                    onClick={() => setShowInfoModal(false)}
                    className="px-6 py-2 bg-brand-gold text-white rounded-lg font-semibold hover:bg-brand-gold/90 transition-colors"
                  >
                    Apply Now
                  </Link>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </>
    )
  }

  // Regular course card (unchanged layout)
  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: index * 0.1 }}
        viewport={{ once: true }}
        className={`bg-white rounded-lg border-2 ${course.courseType === "online" ? "border-purple-400" : "border-gray-300"} hover:border-brand-gold shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden group h-full flex flex-col`}
      >
        {/* Original regular course card layout */}
        {/* ... (keep your original regular course card code) */}
        {/* Course Image */}
        {course.coverImage?.url && (
          <div className="relative h-48 overflow-hidden bg-gray-200">
            <img
              src={course.coverImage.url}
              alt={course.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />

            {/* Diagonal Ribbon for course type */}
            <div className="absolute top-10 -left-5 w-24">
              <div className={`absolute transform -translate-x-6 -translate-y-6 -rotate-45 w-32 h-4 flex items-center justify-center ${course.courseType === "online" ? "bg-purple-500" : course.courseType === "physical" ? "bg-blue-500" : "bg-green-500"
                }`}>
                <span className="text-white text-[10px] font-semibold flex items-center gap-1">
                  <FaRegCheckCircle size={8} />
                  {course.courseType === "online" ? "ONLINE" : course.courseType === "physical" ? "PHYSICAL" : "HYBRID"}
                </span>
              </div>
            </div>

            {/* Discount badge */}
            {hasActiveOffer(course) && (
              <div className="absolute top-4 right-4 bg-primary-gold text-white text-xs font-bold px-3 py-1 rounded-full">
                Save {calculateDiscountPercentage(course)}%
              </div>
            )}

            {/* Course tier badge for online courses */}
            {course.courseType === "online" && course.courseTier && (
              <span className={`absolute bottom-0 left-0 px-3 py-1 border text-xs font-semibold ${getTierColor(course.courseTier)}`}>
                <p className="capitalize font-bold flex items-center gap-1">{course.courseTier} <GoDotFill size={5} /> Zoezi Soma</p>
              </span>
            )}
          </div>
        )}

        {/* Course Content */}
        <div className="p-6 flex-1 flex flex-col">
          {/* Course Name */}
          <h3 className="text-xl font-bold text-primary-dark mb-2 line-clamp-2">
            {course.courseType === "online" && (
              <div className="flex text-purple-600 mb-1">
                <FaStar size={10} />
                <FaStar size={10} />
                <FaStar size={10} />
                <FaStar size={10} />
              </div>
            )}
            {course.name}
          </h3>

          {/* Course Description */}
          {showAllDetails && (
            <p className="text-secondary text-sm mb-4 line-clamp-3 flex-1">
              {course.description}
            </p>
          )}

          {/* Duration - Show only on home page if not showing all details */}
          {(showAllDetails || course.duration) && (
            <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200">
              <span className="text-primary-dark font-semibold flex items-center gap-1">
                <FaClock size={12} /> Duration:
              </span>
              <span className="text-secondary ml-2">
                {course.duration}&nbsp;{course.durationType}
              </span>
            </div>
          )}

          {/* Pricing */}
          <div className="mb-6">
            {hasActiveOffer(course) ? (
              <div className="flex items-center justify-between gap-2">
                {course.courseType === "online" ? (
                  <div>
                    <span className="text-2xl font-bold text-purple-500">
                      KES {course.offerPrice?.toLocaleString()}
                    </span>
                    <span className="block text-xs text-gray-500">Special Offer</span>
                  </div>
                ) : (
                  <div>
                    <span className="text-2xl font-bold text-brand-gold">
                      KES {course.offerPrice?.toLocaleString()}
                    </span>
                    <span className="block text-xs text-gray-500">Special Offer</span>
                  </div>
                )}

                <div className="text-right">
                  <span className="text-md line-through font-bold text-gray-400">
                    KES {course.courseFee?.toLocaleString()}
                  </span>
                  <span className="block text-xs text-green-600 font-semibold">
                    Save {calculateDiscountPercentage(course)}%
                  </span>
                </div>
              </div>
            ) : (
              <div>
                <div className="text-2xl font-bold text-primary-dark">
                  KES {course.courseFee?.toLocaleString()}
                </div>
                {course.courseFee === 0 && (
                  <span className="text-sm text-green-600 font-semibold">FREE COURSE</span>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-auto">
            <button
              onClick={() => setShowInfoModal(true)}
              className="flex-1 flex items-center justify-center gap-2 border-2 border-gray-300 hover:border-brand-gold text-gray-700 hover:text-brand-gold py-3 px-4 rounded-lg font-semibold transition-all duration-200"
            >
              <FaInfoCircle /> More Info
            </button>

            {course.courseType === "online" ? (
              <Link
                to="/login"
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-brand-gold/90 transition-all duration-200 text-center"
              >
                Enroll Now
              </Link>
            ) : (
              <Link
                to="/apply-now"
                className="flex-1 bg-brand-gold text-white py-3 px-4 rounded-lg font-semibold hover:bg-brand-gold/90 transition-all duration-200 text-center"
              >
                Enroll Now
              </Link>
            )}
          </div>
        </div>
      </motion.div>

      {/* Info Modal for regular courses */}
      {showInfoModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-99999">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-bold text-primary-dark">{course.name}</h3>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${course.courseType === "online" ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"
                    }`}>
                    {course.courseType === "online" ? "🖥️ ONLINE COURSE" : "🏫 PHYSICAL COURSE"}
                  </span>
                  {course.courseTier && (
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getTierColor(course.courseTier)}`}>
                      {course.courseTier.toUpperCase()}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => setShowInfoModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                &times;
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {/* Course Image */}
              {course.coverImage?.url && (
                <div className="mb-6 rounded-lg overflow-hidden">
                  <img
                    src={course.coverImage.url}
                    alt={course.name}
                    className="w-full h-64 object-cover"
                  />
                </div>
              )}

              {/* Full Description */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-primary-dark mb-3 flex items-center gap-2">
                  <FaCertificate /> Course Description
                </h4>
                <p className="text-gray-700 whitespace-pre-line">{course.description}</p>
              </div>

              {/* Course Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 text-primary-dark font-semibold mb-2">
                    <FaClock /> Duration
                  </div>
                  <p className="text-gray-700">{course.duration} {course.durationType}</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 text-primary-dark font-semibold mb-2">
                    <FaUsers /> Course Type
                  </div>
                  <p className="text-gray-700 capitalize">{course.courseType}</p>
                </div>
              </div>

              {/* Pricing Information */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-primary-dark mb-3">Pricing Information</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  {hasActiveOffer(course) ? (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Original Price:</span>
                        <span className="text-lg line-through text-gray-400">KES {course.courseFee?.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Special Offer Price:</span>
                        <span className="text-2xl font-bold text-green-600">KES {course.offerPrice?.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">You Save:</span>
                        <span className="text-lg font-bold text-primary-gold">
                          KES {(course.courseFee - course.offerPrice)?.toLocaleString()} ({calculateDiscountPercentage(course)}%)
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Course Fee:</span>
                      <span className={`text-2xl font-bold ${course.courseFee === 0 ? 'text-green-600' : 'text-primary-dark'}`}>
                        {course.courseFee === 0 ? 'FREE' : `KES ${course.courseFee?.toLocaleString()}`}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Ribbon Legend */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-primary-dark mb-3">Color Legend</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-purple-500 rounded"></div>
                    <span className="text-gray-700"><strong>Purple Ribbon:</strong> Online courses - Study from anywhere, anytime</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-blue-500 rounded"></div>
                    <span className="text-gray-700"><strong>Blue Ribbon:</strong> Physical courses - On-campus learning experience</span>
                  </div>
                </div>
              </div>

              {/* Course Tiers (Online only) */}
              {course.courseType === "online" && (
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-primary-dark mb-3">Course Tiers</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getTierColor('basic')}`}>BASIC</span>
                      <span className="text-gray-700">Essential knowledge and skills</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getTierColor('advanced')}`}>ADVANCED</span>
                      <span className="text-gray-700">In-depth training with practical exercises</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getTierColor('elite')}`}>ELITE</span>
                      <span className="text-gray-700">Mastery level with certification and mentorship</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-white border-t p-6 flex justify-end gap-3">
              <button
                onClick={() => setShowInfoModal(false)}
                className="px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:border-gray-400 transition-colors"
              >
                Close
              </button>
              {course.courseType === "online" ? (
                <Link
                  to="/login"
                  onClick={() => setShowInfoModal(false)}
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:bg-brand-gold/90 transition-colors"
                >
                  Enroll Now
                </Link>
              ) : (
                <Link
                  to="/apply-now"
                  onClick={() => setShowInfoModal(false)}
                  className="px-6 py-2 bg-brand-gold text-white rounded-lg font-semibold hover:bg-brand-gold/90 transition-colors"
                >
                  Apply Now
                </Link>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </>
  )
}