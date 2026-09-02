import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes, FaBriefcase, FaGraduationCap, FaChartLine, FaMoneyBillWave, FaExternalLinkAlt } from "react-icons/fa";

export default function RoleDetailDrawer({ isOpen, onClose, match }) {
  // Listen for Escape key to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden"; // Prevent background scroll
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!match) return null;

  const { role, score, gaps, jobs } = match;

  const mockResponsibilities = {
    "Frontend Developer": [
      "Develop responsive and visually appealing user interfaces using React and modern CSS.",
      "Collaborate with backend engineers to integrate RESTful API endpoints.",
      "Optimize application performance and ensure cross-browser compatibility.",
      "Participate in code reviews and advocate for clean UI/UX practices."
    ],
    "Backend Developer": [
      "Design and maintain scalable server-side architecture and databases.",
      "Build secure RESTful APIs and handle user authentication (JWT).",
      "Optimize query performance in MongoDB and manage system caching.",
      "Monitor application performance and maintain backend cloud environments."
    ],
    "Full Stack Developer": [
      "Manage end-to-end web application development from UI design to DB deployment.",
      "Build modular frontend components in React and clean REST APIs in Node/Express.",
      "Implement third-party integrations and maintain data security.",
      "Troubleshoot front-to-back application latency and deploy changes."
    ],
    "Data Analyst": [
      "Extract, clean, and organize large datasets using SQL and Python.",
      "Create interactive dashboards in Power BI/Tableau for business teams.",
      "Perform exploratory data analysis to identify trends and anomalies.",
      "Present quantitative findings to stakeholders to drive strategic planning."
    ],
    "Machine Learning Engineer": [
      "Research, prototype, and train deep learning models using TensorFlow.",
      "Build data processing pipelines and perform feature engineering.",
      "Deploy ML models into production containers and monitor drift.",
      "Collaborate with data engineers to scale model infrastructure."
    ],
    "DevOps Engineer": [
      "Deploy, monitor, and automate infrastructure on cloud providers (AWS/GCP).",
      "Manage CI/CD build and release pipelines (Jenkins, Github Actions).",
      "Maintain container orchestration environments using Docker and Kubernetes.",
      "Audit system security, perform firewall configurations, and handle scaling."
    ],
    "Android Developer": [
      "Design and code native Android applications using Kotlin and Java.",
      "Implement material design specifications to ensure a premium UI/UX.",
      "Handle local database caching (Room) and background synchronization.",
      "Optimize memory usage, profile application execution, and submit to Play Store."
    ],
    "iOS Developer": [
      "Design and code native iOS applications using Swift and UIKit/SwiftUI.",
      "Integrate local databases (CoreData) and remote web APIs.",
      "Maintain application quality and perform unit/UI testing in Xcode.",
      "Prepare and publish builds to the Apple App Store."
    ],
    "Cybersecurity Analyst": [
      "Perform penetration testing and vulnerability scans across enterprise systems.",
      "Analyze firewall traffic, monitor intrusion logs, and respond to breaches.",
      "Conduct security audits and design secure network architectures.",
      "Train internal staff on security protocols and email phishing awareness."
    ],
    "Cloud Engineer": [
      "Configure, manage, and scale secure virtual server networks (VPC).",
      "Automate cloud infrastructure setups using Terraform (IaC).",
      "Monitor server resources, configure autoscale rules, and manage budgets.",
      "Deploy containerized microservices on cloud hosts (EKS, ECS)."
    ]
  };

  const currentResponsibilities = mockResponsibilities[role.title] || [
    "Collaborate with multidisciplinary engineering teams to build products.",
    "Define, scope, and implement new system features based on requirements.",
    "Debug production issues and write comprehensive automated tests.",
    "Adhere to company-wide architecture guidelines and design standards."
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={styles.backdrop}
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            style={styles.drawer}
            aria-modal="true"
            role="dialog"
          >
            {/* Header */}
            <div style={styles.header}>
              <div style={styles.headerTitleArea}>
                <h2 style={styles.title}>{role.title}</h2>
                <div style={styles.scoreRow}>
                  <div style={styles.scoreBadge}>{score}% Match</div>
                </div>
              </div>
              <button onClick={onClose} style={styles.closeBtn} aria-label="Close details">
                <FaTimes />
              </button>
            </div>

            {/* Scrollable Content */}
            <div style={styles.content} className="chat-scrollbar">
              
              {/* Description */}
              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>
                  <FaBriefcase style={styles.sectionIcon} /> Role Description
                </h3>
                <p style={styles.descText}>{role.description}</p>
              </div>

              {/* Responsibilities */}
              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>
                  <FaGraduationCap style={styles.sectionIcon} /> Daily Responsibilities
                </h3>
                <ul style={styles.bulletList}>
                  {currentResponsibilities.map((resp, i) => (
                    <li key={i} style={styles.bulletItem}>{resp}</li>
                  ))}
                </ul>
              </div>

              {/* Salary & Growth */}
              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>
                  <FaMoneyBillWave style={styles.sectionIcon} /> Salary & Career Growth
                </h3>
                <div style={styles.statsCardGrid}>
                  <div style={styles.statCard}>
                    <span style={styles.statLabel}>Average Salary</span>
                    <span style={styles.statValue}>
                      {role.title === "Frontend Developer" ? "₹6 - 15 LPA" : 
                       role.title === "Backend Developer" ? "₹7 - 18 LPA" : 
                       role.title === "Full Stack Developer" ? "₹8 - 20 LPA" : 
                       role.title === "DevOps Engineer" ? "₹8 - 18 LPA" : 
                       "Salary Not Available"}
                    </span>
                    <span style={styles.statNote}>Based on experience</span>
                  </div>
                  <div style={styles.statCard}>
                    <span style={styles.statLabel}>Career Growth</span>
                    <span style={{ ...styles.statValue, color: "var(--success-color)" }}>High</span>
                    <span style={styles.statNote}>15%+ YoY Demand Increase</span>
                  </div>
                </div>
              </div>

              {/* Required Skills & Gaps */}
              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>
                  <FaChartLine style={styles.sectionIcon} /> Skills Analysis
                </h3>
                <div style={styles.skillsContainer}>
                  <span style={styles.subLabel}>Core Required Skills:</span>
                  <div style={styles.skillsGrid}>
                    {(role.keySkills || role.requiredSkills || []).map((skill, idx) => {
                      const isMissing = gaps.some(g => g.toLowerCase() === skill.toLowerCase());
                      return (
                        <span 
                          key={idx} 
                          style={{
                            ...styles.skillChip,
                            background: isMissing ? "rgba(239, 68, 68, 0.12)" : "rgba(16, 185, 129, 0.12)",
                            borderColor: isMissing ? "var(--danger-color)" : "var(--success-color)",
                            color: isMissing ? "var(--danger-color)" : "var(--success-color)"
                          }}
                        >
                          {isMissing ? "⚠ " : "✓ "}
                          {skill.toUpperCase()}
                        </span>
                      );
                    })}
                  </div>

                  {gaps.length > 0 && (
                    <div style={styles.gapsNotice}>
                      <span style={{ fontWeight: "700", color: "var(--danger-color)" }}>Focus Area:</span> You have {gaps.length} missing skill{gaps.length > 1 ? "s" : ""} to unlock this role.
                    </div>
                  )}
                </div>
              </div>

              {/* Openings */}
              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>
                  <FaBriefcase style={styles.sectionIcon} /> Current Openings ({jobs?.length || 0})
                </h3>
                {jobs && jobs.length > 0 ? (
                  <div style={styles.jobsList}>
                    {jobs.map((job, i) => (
                      <div key={i} style={styles.jobMiniCard}>
                        <div>
                          <h4 style={styles.jobMiniTitle}>{job.title}</h4>
                          <span style={styles.jobMiniCompany}>{job.company} — {job.location}</span>
                        </div>
                        <a 
                          href={job.url} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          style={styles.applyBtn}
                        >
                          Apply <FaExternalLinkAlt style={{ fontSize: "10px", marginLeft: "4px" }} />
                        </a>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={styles.emptyText}>No live openings available for this role at the moment.</p>
                )}
              </div>

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

const styles = {
  backdrop: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "#000",
    zIndex: 2000
  },
  drawer: {
    position: "fixed",
    top: 0,
    right: 0,
    height: "100%",
    width: "100%",
    maxWidth: "500px",
    background: "var(--bg-color)",
    borderLeft: "1px solid var(--card-border)",
    boxShadow: "-10px 0 30px rgba(0,0,0,0.5)",
    zIndex: 2001,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden"
  },
  header: {
    padding: "24px",
    borderBottom: "1px solid var(--card-border)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },
  headerTitleArea: {
    display: "flex",
    flexDirection: "column",
    gap: "6px"
  },
  title: {
    fontSize: "20px",
    fontWeight: "800",
    color: "var(--text-color)"
  },
  scoreRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px"
  },
  scoreBadge: {
    background: "var(--accent-glow)",
    color: "var(--accent-color)",
    border: "1px solid rgba(59, 130, 246, 0.3)",
    borderRadius: "6px",
    padding: "2px 8px",
    fontSize: "12px",
    fontWeight: "700"
  },
  closeBtn: {
    background: "none",
    border: "none",
    color: "var(--text-secondary)",
    fontSize: "20px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    transition: "background var(--transition-speed), color var(--transition-speed)",
    "&:hover": {
      background: "rgba(255,255,255,0.05)",
      color: "var(--text-color)"
    }
  },
  content: {
    flex: 1,
    padding: "24px",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "30px"
  },
  section: {
    display: "flex",
    flexDirection: "column",
    gap: "12px"
  },
  sectionTitle: {
    fontSize: "15px",
    fontWeight: "700",
    color: "var(--text-color)",
    display: "flex",
    alignItems: "center",
    gap: "8px"
  },
  sectionIcon: {
    color: "var(--accent-color)"
  },
  descText: {
    fontSize: "14px",
    color: "var(--text-secondary)",
    lineHeight: "1.6"
  },
  bulletList: {
    paddingLeft: "18px",
    display: "flex",
    flexDirection: "column",
    gap: "8px"
  },
  bulletItem: {
    fontSize: "14px",
    color: "var(--text-secondary)",
    lineHeight: "1.5"
  },
  statsCardGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px"
  },
  statCard: {
    background: "var(--card-bg)",
    border: "1px solid var(--card-border)",
    borderRadius: "12px",
    padding: "16px",
    display: "flex",
    flexDirection: "column",
    gap: "4px"
  },
  statLabel: {
    fontSize: "11px",
    color: "var(--text-secondary)",
    textTransform: "uppercase",
    letterSpacing: "0.5px"
  },
  statValue: {
    fontSize: "16px",
    fontWeight: "700",
    color: "var(--text-color)"
  },
  statNote: {
    fontSize: "10px",
    color: "var(--text-secondary)",
    opacity: 0.7
  },
  skillsContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "10px"
  },
  subLabel: {
    fontSize: "13px",
    color: "var(--text-secondary)"
  },
  skillsGrid: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px"
  },
  skillChip: {
    fontSize: "11px",
    fontWeight: "700",
    padding: "4px 10px",
    borderRadius: "6px",
    border: "1px solid"
  },
  gapsNotice: {
    marginTop: "8px",
    background: "rgba(239, 68, 68, 0.05)",
    border: "1px solid rgba(239, 68, 68, 0.15)",
    padding: "10px 14px",
    borderRadius: "8px",
    fontSize: "13px",
    color: "var(--text-secondary)",
    lineHeight: "1.4"
  },
  jobsList: {
    display: "flex",
    flexDirection: "column",
    gap: "10px"
  },
  jobMiniCard: {
    background: "var(--card-bg)",
    border: "1px solid var(--card-border)",
    padding: "12px 16px",
    borderRadius: "10px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "10px"
  },
  jobMiniTitle: {
    fontSize: "13px",
    fontWeight: "600",
    color: "var(--text-color)"
  },
  jobMiniCompany: {
    fontSize: "11px",
    color: "var(--text-secondary)"
  },
  applyBtn: {
    fontSize: "12px",
    fontWeight: "600",
    color: "var(--accent-color)",
    textDecoration: "none",
    display: "inline-flex",
    alignItems: "center"
  },
  emptyText: {
    fontSize: "13px",
    color: "var(--text-secondary)",
    fontStyle: "italic"
  }
};
