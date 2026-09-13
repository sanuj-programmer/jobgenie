import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaArrowRight, FaRobot, FaRoute, FaBullseye, FaBriefcase, FaHistory } from "react-icons/fa";
import { toast } from "./ToastContainer";

import styles from '../styles/components/LandingPage.module.css';

export default function LandingPage({ onStartAnalysis, onLoadHistory }) {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("jobgenie_history");
      if (stored) {
        setHistory(JSON.parse(stored).slice(0, 10)); // Ensure max 10
      }
    } catch (e) {
      console.error("Failed to load history", e);
    }
  }, []);

  const clearHistory = () => {
    localStorage.removeItem("jobgenie_history");
    setHistory([]);
    toast("History cleared successfully!", "info");
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  const featureCards = [
    {
      icon: <FaRobot style={{ color: "#3b82f6" }} />,
      title: "AI Career Analysis",
      desc: "Deep analysis of your skills, strengths, and alignment to suggest the best paths."
    },
    {
      icon: <FaRoute style={{ color: "#a855f7" }} />,
      title: "Personalized Roadmap",
      desc: "Receive structured, weekly action plans to acquire necessary skills and transition seamlessly."
    },
    {
      icon: <FaBullseye style={{ color: "#10b981" }} />,
      title: "Role Matching",
      desc: "Algorithm-based mathematical matching against profiles to calculate true compatibility."
    },
    {
      icon: <FaBriefcase style={{ color: "#f59e0b" }} />,
      title: "Live Job Recommendations",
      desc: "Real-time job listings directly from top employers matching your specific profile criteria."
    }
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={styles.landing}
    >
      {/* Background glow animations */}
      <div className="bg-glow-container">
        <div className="bg-glow-1"></div>
        <div className="bg-glow-2"></div>
      </div>

      <div className={styles.heroSection}>
        <motion.div variants={itemVariants} className={styles.badgeWrapper}>
          <span className={styles.heroBadge}>✨ AI-Powered Guidance</span>
        </motion.div>
        
        <motion.h1 variants={itemVariants} className={`${styles.heroTitle} word-break-all`}>
          AI Career Guidance for <br />
          <span className={styles.gradientText}>Students & Professionals</span>
        </motion.h1>

        <motion.p variants={itemVariants} className={styles.heroSubtitle}>
          Discover your best career path, receive personalized learning roadmaps, and explore job opportunities powered by advanced AI algorithms.
        </motion.p>

        <motion.div variants={itemVariants} className={styles.ctaWrapper}>
          <button onClick={onStartAnalysis} className={`${styles.primaryBtn} hover-lift`}>
            Start Analysis <FaArrowRight style={{ marginLeft: "8px" }} />
          </button>
          <button 
            onClick={() => {
              const el = document.getElementById("features");
              el?.scrollIntoView({ behavior: "smooth" });
            }} 
            className={styles.secondaryBtn}
          >
            Learn More
          </button>
        </motion.div>
      </div>

      {/* History section */}
      {history.length > 0 && (
        <motion.div variants={itemVariants} className={styles.historySection}>
          <div className={styles.historyHeader}>
            <h2 className={styles.sectionTitle}>
              <FaHistory style={{ marginRight: "10px", color: "var(--accent-color)" }} /> 
              Recent Analyses
            </h2>
            <button onClick={clearHistory} className={styles.clearHistoryBtn}>
              Clear All
            </button>
          </div>
          <div className={styles.historyGrid}>
            {history.map((item, idx) => {
              // Find best match
              const bestMatch = item.results?.matches?.[0];
              const bestRoleName = bestMatch?.role?.title || "Unknown Career";
              const bestScore = bestMatch?.score !== undefined ? `${bestMatch.score}%` : "N/A";
              
              return (
                <div key={idx} className={`${styles.historyCard} hover-lift`}>
                  <div className={styles.historyInfo}>
                    <span className={styles.historyDate}>{item.date}</span>
                    <h3 className={`${styles.historyName} word-break-all`}>{item.profile?.name}'s Profile</h3>
                    <div className={styles.historyMatchRow}>
                      <span className={styles.historyRole}>{bestRoleName}</span>
                      <span className={styles.historyScoreBadge}>{bestScore} Match</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => onLoadHistory(item)}
                    className={styles.openHistoryBtn}
                  >
                    Open →
                  </button>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Features Grid */}
      <motion.div id="features" variants={itemVariants} className={styles.featuresSection}>
        <h2 className={styles.sectionHeading}>What JobGenie Offers</h2>
        <p className={styles.sectionSubheading}>
          Everything you need to navigate your career change or starting path with confidence.
        </p>
        
        <div className={styles.featuresGrid}>
          {featureCards.map((card, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -5, boxShadow: "0 12px 24px -10px rgba(59, 130, 246, 0.25)", borderColor: "var(--accent-color)" }}
              className={styles.featureCard}
            >
              <div className={styles.featureIcon}>{card.icon}</div>
              <h3 className={styles.featureTitle}>{card.title}</h3>
              <p className={styles.featureDesc}>{card.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

