import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes, FaBriefcase, FaGraduationCap, FaChartLine, FaMoneyBillWave, FaExternalLinkAlt } from "react-icons/fa";

import styles from '../styles/components/RoleDetailDrawer.module.css';

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
            className={styles.backdrop}
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className={styles.drawer}
            aria-modal="true"
            role="dialog"
          >
            {/* Header */}
            <div className={styles.header}>
              <div className={styles.headerTitleArea}>
                <h2 className={styles.title}>{role.title}</h2>
                <div className={styles.scoreRow}>
                  <div className={styles.scoreBadge}>{score}% Match</div>
                </div>
              </div>
              <button onClick={onClose} className={styles.closeBtn} aria-label="Close details">
                <FaTimes />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className={`${styles.content} chat-scrollbar`}>
              
              {/* Description */}
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>
                  <FaBriefcase className={styles.sectionIcon} /> Role Description
                </h3>
                <p className={styles.descText}>{role.description}</p>
              </div>

              {/* Responsibilities */}
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>
                  <FaGraduationCap className={styles.sectionIcon} /> Daily Responsibilities
                </h3>
                <ul className={styles.bulletList}>
                  {currentResponsibilities.map((resp, i) => (
                    <li key={i} className={styles.bulletItem}>{resp}</li>
                  ))}
                </ul>
              </div>

              {/* Salary & Growth */}
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>
                  <FaMoneyBillWave className={styles.sectionIcon} /> Salary & Career Growth
                </h3>
                <div className={styles.statsCardGrid}>
                  <div className={styles.statCard}>
                    <span className={styles.statLabel}>Average Salary</span>
                    <span className={styles.statValue}>
                      {role.title === "Frontend Developer" ? "₹6 - 15 LPA" : 
                       role.title === "Backend Developer" ? "₹7 - 18 LPA" : 
                       role.title === "Full Stack Developer" ? "₹8 - 20 LPA" : 
                       role.title === "DevOps Engineer" ? "₹8 - 18 LPA" : 
                       "Salary Not Available"}
                    </span>
                    <span className={styles.statNote}>Based on experience</span>
                  </div>
                  <div className={styles.statCard}>
                    <span className={styles.statLabel}>Career Growth</span>
                    <span className={styles.statValue}
style={{color: "var(--success-color)" }}>High</span>
                    <span className={styles.statNote}>15%+ YoY Demand Increase</span>
                  </div>
                </div>
              </div>

              {/* Required Skills & Gaps */}
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>
                  <FaChartLine className={styles.sectionIcon} /> Skills Analysis
                </h3>
                <div className={styles.skillsContainer}>
                  <span className={styles.subLabel}>Core Required Skills:</span>
                  <div className={styles.skillsGrid}>
                    {(role.keySkills || role.requiredSkills || []).map((skill, idx) => {
                      const isMissing = gaps.some(g => g.toLowerCase() === skill.toLowerCase());
                      return (
                        <span 
                          key={idx} 
                          className={styles.skillChip}
style={{background: isMissing ? "rgba(239, 68, 68, 0.12)" : "rgba(16, 185, 129, 0.12)",
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
                    <div className={styles.gapsNotice}>
                      <span style={{ fontWeight: "700", color: "var(--danger-color)" }}>Focus Area:</span> You have {gaps.length} missing skill{gaps.length > 1 ? "s" : ""} to unlock this role.
                    </div>
                  )}
                </div>
              </div>

              {/* Openings */}
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>
                  <FaBriefcase className={styles.sectionIcon} /> Current Openings ({jobs?.length || 0})
                </h3>
                {jobs && jobs.length > 0 ? (
                  <div className={styles.jobsList}>
                    {jobs.map((job, i) => (
                      <div key={i} className={styles.jobMiniCard}>
                        <div>
                          <h4 className={styles.jobMiniTitle}>{job.title}</h4>
                          <span className={styles.jobMiniCompany}>{job.company} — {job.location}</span>
                        </div>
                        <a 
                          href={job.url} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className={styles.applyBtn}
                        >
                          Apply <FaExternalLinkAlt style={{ fontSize: "10px", marginLeft: "4px" }} />
                        </a>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className={styles.emptyText}>No live openings available for this role at the moment.</p>
                )}
              </div>

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

