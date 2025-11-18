"use client"
import { motion } from "framer-motion"
import "../../Pages.css"

export default function WhatWeDo() {
  const semester1Topics = [
    {
      title: "Communication Skills",
      topics: ["Verbal & Non-Verbal Communication", "Client Motivation & Goal Setting", "Conflict Resolution"],
    },
    {
      title: "First Aid",
      topics: ["RICE Therapy", "Wound Care & Fractures", "Injury Prevention", "Emergency Response"],
    },
    {
      title: "Nutrition, Supplements & Ergogenics",
      topics: ["Macronutrients & Micronutrients", "Balanced Diet Planning", "Performance Supplements"],
    },
    {
      title: "Anatomy & Exercise Physiology",
      topics: ["Skeletal & Muscular System", "Cardiorespiratory System", "VO2 Max & Oxygen Utilization"],
    },
    {
      title: "Injuries & Their Management",
      topics: ["Types of Injuries", "Common Sports Injuries", "Management Techniques"],
    },
    {
      title: "Practical: Biomechanics & Weight Training",
      topics: ["Movement Analysis", "Kinesiology", "Weight Training Principles", "Safety Protocols"],
    },
  ]

  const semester2Topics = [
    {
      title: "Prevention & Management of Injuries",
      topics: ["Injury Prevention Strategies", "Rehabilitation Modalities", "Stretching & Strengthening"],
    },
    {
      title: "Exercise for Special Populations",
      topics: ["Exercise for the Elderly", "Pregnancy & Postpartum Fitness", "Chronic Disease Management"],
    },
    {
      title: "Legal & Ethical Issues",
      topics: ["Liability & Insurance", "Client Confidentiality", "Professional Conduct"],
    },
    {
      title: "Business of Fitness & Gym Management",
      topics: ["Gym Management", "Marketing & Client Retention", "Financial Management"],
    },
    {
      title: "Practical: Group Classes & Fitness Testing",
      topics: ["Group Fitness Instruction", "HIIT & Circuit Training", "Fitness Assessments"],
    },
  ]

  const practicalComponents = [
    {
      title: "Warming Up & Cooling Down",
      description: "Learn proper techniques for injury prevention and recovery through dynamic and static stretching.",
    },
    {
      title: "Training Methods",
      description: "Master circuit training, plyometrics, resistance training, and flexibility training methodologies.",
    },
    {
      title: "Prime Movers & Exercise Execution",
      description: "Identify and train key muscle groups with proper form and technique in all exercises.",
    },
    {
      title: "Daily Athlete Analysis & Record Keeping",
      description: "Track client progress through accurate measurement and documentation of fitness improvements.",
    },
  ]

  return (
    <div className="page">
      <div className="container">
        <div className="section-header">
          <h2 className="text-4xl font-bold border-b-2 border-[#d4a644] w-fit mx-auto pb-2 mb-2 max-md:text-xl">What We Teach</h2>
          <p className="section-subtitle">Comprehensive 6-Month NITA-Accredited Program</p>
        </div>

        {/* Semester 1 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          style={{ marginBottom: "3rem" }}
        >
          <h2 style={{ color: "#2b2520", marginBottom: "1.5rem", fontSize: "1.6rem" }}>
            Semester 1: Foundation & Initial Practice (2 Months)
          </h2>
          <div className="content-grid">
            {semester1Topics.map((topic, idx) => (
              <motion.div
                key={idx}
                className="content-box"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                viewport={{ once: true }}
                style={{
                  borderLeft: "4px solid #d4a644",
                  background: "#faf9f7",
                }}
              >
                <h3 style={{ color: "#2b2520", marginBottom: "1rem" }}>{topic.title}</h3>
                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                  {topic.topics.map((t, i) => (
                    <li
                      key={i}
                      style={{ marginBottom: "0.5rem", color: "#555", paddingLeft: "1.5rem", position: "relative" }}
                    >
                      <span
                        style={{
                          position: "absolute",
                          left: 0,
                          width: "6px",
                          height: "6px",
                          background: "#e8c547",
                          borderRadius: "50%",
                          top: "0.6rem",
                        }}
                      ></span>
                      {t}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Semester 2 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          style={{ marginBottom: "3rem" }}
        >
          <h2 style={{ color: "#2b2520", marginBottom: "1.5rem", fontSize: "1.6rem" }}>
            Semester 2: Advanced Concepts & Practice (2 Months)
          </h2>
          <div className="content-grid">
            {semester2Topics.map((topic, idx) => (
              <motion.div
                key={idx}
                className="content-box"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                viewport={{ once: true }}
                style={{
                  borderLeft: "4px solid #d4a644",
                  background: "#faf9f7",
                }}
              >
                <h3 style={{ color: "#2b2520", marginBottom: "1rem" }}>{topic.title}</h3>
                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                  {topic.topics.map((t, i) => (
                    <li
                      key={i}
                      style={{ marginBottom: "0.5rem", color: "#555", paddingLeft: "1.5rem", position: "relative" }}
                    >
                      <span
                        style={{
                          position: "absolute",
                          left: 0,
                          width: "6px",
                          height: "6px",
                          background: "#e8c547",
                          borderRadius: "50%",
                          top: "0.6rem",
                        }}
                      ></span>
                      {t}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Semester 3 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          style={{
            background: "linear-gradient(135deg, #e8c547 0%, #d4a644 100%)",
            padding: "2rem",
            borderRadius: "12px",
            marginBottom: "3rem",
            color: "#2b2520",
          }}
        >
          <h2 style={{ color: "#2b2520", marginBottom: "1rem" }}>Semester 3: Real-World Experience (1 Month)</h2>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            <li style={{ marginBottom: "0.75rem" }}>
              <strong>Attachment:</strong> Real-world industry placement in certified gyms and fitness centers
            </li>
            <li>
              <strong>Outdoor Activities:</strong> Aqua aerobics, hiking, and team-building exercises
            </li>
          </ul>
        </motion.div>

        {/* Practical Components */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          style={{ marginBottom: "3rem" }}
        >
          <h2 style={{ color: "#2b2520", marginBottom: "1.5rem", fontSize: "1.6rem" }}>Practical Components</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem" }}>
            {practicalComponents.map((component, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                viewport={{ once: true }}
                style={{
                  background: "#fff",
                  padding: "1.5rem",
                  borderRadius: "8px",
                  border: "2px solid #f0e6d2",
                  transition: "all 0.3s ease",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#d4a644"
                  e.currentTarget.style.boxShadow = "0 8px 16px rgba(212, 166, 68, 0.2)"
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#f0e6d2"
                  e.currentTarget.style.boxShadow = "none"
                }}
              >
                <h3 style={{ color: "#d4a644", marginBottom: "0.75rem" }}>{component.title}</h3>
                <p style={{ color: "#555", margin: 0, lineHeight: "1.6" }}>{component.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Key Features */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          style={{
            background: "linear-gradient(135deg, #2b2520 0%, #3d3531 100%)",
            color: "#fff",
            padding: "2rem",
            borderRadius: "12px",
            marginBottom: "2rem",
          }}
        >
          <h2 style={{ marginBottom: "1.5rem" }}>Why Choose Nairobi Zoezi Institute?</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1.5rem" }}>
            <div>
              <h4 style={{ color: "#d4a644", marginBottom: "0.5rem" }}>NITA Accredited</h4>
              <p>Fully accredited by National Industrial Training Authority (NITA/TRN/1553)</p>
            </div>
            <div>
              <h4 style={{ color: "#d4a644", marginBottom: "0.5rem" }}>Industry Partnerships</h4>
              <p>Guaranteed placements through partnerships with leading gyms and fitness centers</p>
            </div>
            <div>
              <h4 style={{ color: "#d4a644", marginBottom: "0.5rem" }}>Flexible Learning</h4>
              <p>Physical, online, and weekend classes to fit your schedule</p>
            </div>
            <div>
              <h4 style={{ color: "#d4a644", marginBottom: "0.5rem" }}>Competency-Based</h4>
              <p>Hands-on learning with measurable skill acquisition aligned with industry benchmarks</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
