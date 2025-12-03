// components/CourseCard.jsx
import { motion } from "framer-motion"
import { FaRegCheckCircle } from "react-icons/fa"
import { Link } from "react-router-dom"

export default function CourseCard({ course, index = 0, showAllDetails = true }) {
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      viewport={{ once: true }}
      className="bg-white rounded-lg border-2 border-gray-300 hover:border-brand-gold shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden group h-full flex flex-col"
    >
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
            <div className={`absolute transform -translate-x-6 -translate-y-6 -rotate-45 w-32 h-4 flex items-center justify-center ${
              course.courseType === "online" ? "bg-green-500" : "bg-blue-500"
            }`}>
              <span className="text-white text-[10px] font-semibold flex items-center gap-1">
                <FaRegCheckCircle />
                {course.courseType === "online" ? "ONLINE" : "PHYSICAL"}
              </span>
            </div>
          </div>

          {/* Discount badge */}
          {hasActiveOffer(course) && (
            <div className="absolute top-4 right-4 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full">
              Save {calculateDiscountPercentage(course)}%
            </div>
          )}

          {/* Course tier badge for online courses */}
          {course.courseType === "online" && course.courseTier && (
            <span className="absolute bottom-0 left-0 px-3 py-1 bg-blue-400 text-white text-xs font-semibold">
              <p className="capitalize font-bold">{course.courseTier}</p>
            </span>
          )}
        </div>
      )}

      {/* Course Content */}
      <div className="p-6 flex-1 flex flex-col">
        {/* Course Name */}
        <h3 className="text-xl font-bold text-primary-dark mb-2 line-clamp-2">
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
            <span className="text-primary-dark font-semibold">Duration:</span>
            <span className="text-secondary ml-2">
              {course.duration}&nbsp;{course.durationType}
            </span>
          </div>
        )}

        {/* Pricing */}
        <div className="mb-6">
          {hasActiveOffer(course) ? (
            <div className="flex items-center justify-between gap-2">
              <span className="text-2xl font-bold text-brand-gold">
                KES {course.offerPrice?.toLocaleString()}
              </span>
              <span className="text-md line-through font-bold text-gray-400">
                KES {course.courseFee?.toLocaleString()}
              </span>
            </div>
          ) : (
            <div className="text-2xl font-bold text-primary-dark">
              KES {course.courseFee?.toLocaleString()}
            </div>
          )}
        </div>

        {/* Enroll Button */}
        {course.courseType === "online" ? (
          <Link
            to="/login"
            className="bg-brand-gold text-white py-3 px-8 rounded-lg font-semibold hover:bg-brand-gold/90 transition-all duration-200 w-full block text-center mt-auto"
          >
            Enroll Now
          </Link>
        ) : (
          <Link
            to="/apply-now"
            className="bg-brand-gold text-white py-3 px-8 rounded-lg font-semibold hover:bg-brand-gold/90 transition-all duration-200 w-full block text-center mt-auto"
          >
            Enroll Now
          </Link>
        )}
      </div>
    </motion.div>
  )
}