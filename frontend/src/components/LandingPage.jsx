import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaArrowRight, FaRobot, FaRoute, FaBullseye, FaBriefcase, FaHistory } from "react-icons/fa";
import { toast } from "./ToastContainer";

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
      style={styles.landing}
    >
      {/* Background glow animations */}
      <div className="bg-glow-container">
        <div className="bg-glow-1"></div>
        <div className="bg-glow-2"></div>
      </div>

      <div style={styles.heroSection}>
        <motion.div variants={itemVariants} style={styles.badgeWrapper}>
          <span style={styles.heroBadge}>✨ AI-Powered Guidance</span>
        </motion.div>
        
        <motion.h1 variants={itemVariants} style={styles.heroTitle}>
          AI Career Guidance for <br />
          <span style={styles.gradientText}>Students & Professionals</span>
        </motion.h1>

        <motion.p variants={itemVariants} style={styles.heroSubtitle}>
          Discover your best career path, receive personalized learning roadmaps, and explore job opportunities powered by advanced AI algorithms.
        </motion.p>

        <motion.div variants={itemVariants} style={styles.ctaWrapper}>
          <button onClick={onStartAnalysis} style={styles.primaryBtn} className="hover-lift">
            Start Analysis <FaArrowRight style={{ marginLeft: "8px" }} />
          </button>
          <button 
            onClick={() => {
              const el = document.getElementById("features");
              el?.scrollIntoView({ behavior: "smooth" });
            }} 
            style={styles.secondaryBtn}
          >
            Learn More
          </button>
        </motion.div>
      </div>

      {/* History section */}
      {history.length > 0 && (
        <motion.div variants={itemVariants} style={styles.historySection}>
          <div style={styles.historyHeader}>
            <h2 style={styles.sectionTitle}>
              <FaHistory style={{ marginRight: "10px", color: "var(--accent-color)" }} /> 
              Recent Analyses
            </h2>
            <button onClick={clearHistory} style={styles.clearHistoryBtn}>
              Clear All
            </button>
          </div>
          <div style={styles.historyGrid}>
            {history.map((item, idx) => {
              // Find best match
              const bestMatch = item.results?.matches?.[0];
              const bestRoleName = bestMatch?.role?.title || "Unknown Career";
              const bestScore = bestMatch?.score !== undefined ? `${bestMatch.score}%` : "N/A";
              
              return (
                <div key={idx} style={styles.historyCard} className="hover-lift">
                  <div style={styles.historyInfo}>
                    <span style={styles.historyDate}>{item.date}</span>
                    <h3 style={styles.historyName}>{item.profile?.name}'s Profile</h3>
                    <div style={styles.historyMatchRow}>
                      <span style={styles.historyRole}>{bestRoleName}</span>
                      <span style={styles.historyScoreBadge}>{bestScore} Match</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => onLoadHistory(item)}
                    style={styles.openHistoryBtn}
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
      <motion.div id="features" variants={itemVariants} style={styles.featuresSection}>
        <h2 style={styles.sectionHeading}>What JobGenie Offers</h2>
        <p style={styles.sectionSubheading}>
          Everything you need to navigate your career change or starting path with confidence.
        </p>
        
        <div style={styles.featuresGrid}>
          {featureCards.map((card, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -5, boxShadow: "0 12px 24px -10px rgba(59, 130, 246, 0.25)", borderColor: "var(--accent-color)" }}
              style={styles.featureCard}
            >
              <div style={styles.featureIcon}>{card.icon}</div>
              <h3 style={styles.featureTitle}>{card.title}</h3>
              <p style={styles.featureDesc}>{card.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

const styles = {
  landing: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "60px 24px 100px 24px",
    width: "100%",
    minHeight: "calc(100vh - 128px)", // Viewport minus header/footer
    display: "flex",
    flexDirection: "column",
    gap: "80px",
    position: "relative"
  },
  heroSection: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    padding: "40px 0 20px 0",
    maxWidth: "800px",
    margin: "0 auto"
  },
  badgeWrapper: {
    marginBottom: "20px"
  },
  heroBadge: {
    background: "rgba(59, 130, 246, 0.12)",
    color: "var(--accent-color)",
    border: "1px solid rgba(59, 130, 246, 0.25)",
    padding: "6px 16px",
    borderRadius: "100px",
    fontSize: "13px",
    fontWeight: "600",
    letterSpacing: "0.5px"
  },
  heroTitle: {
    fontSize: "clamp(32px, 5vw, 54px)",
    fontWeight: "800",
    lineHeight: "1.15",
    color: "var(--text-color)",
    marginBottom: "24px",
    letterSpacing: "-1px"
  },
  gradientText: {
    background: "linear-gradient(90deg, var(--accent-color) 0%, #a855f7 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    color: "var(--text-color)"
  },
  heroSubtitle: {
    fontSize: "clamp(15px, 2.5vw, 18px)",
    color: "var(--text-secondary)",
    lineHeight: "1.6",
    marginBottom: "40px",
    maxWidth: "640px"
  },
  ctaWrapper: {
    display: "flex",
    gap: "16px",
    flexWrap: "wrap",
    justifyContent: "center"
  },
  primaryBtn: {
    background: "var(--accent-color)",
    color: "#fff",
    border: "none",
    borderRadius: "12px",
    padding: "14px 28px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    boxShadow: "0 4px 14px 0 rgba(59, 130, 246, 0.4)",
    transition: "transform var(--transition-speed), background var(--transition-speed), box-shadow var(--transition-speed)"
  },
  secondaryBtn: {
    background: "rgba(255, 255, 255, 0.05)",
    color: "var(--text-color)",
    border: "1px solid var(--card-border)",
    borderRadius: "12px",
    padding: "14px 28px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "background var(--transition-speed)"
  },
  historySection: {
    width: "100%",
    maxWidth: "1000px",
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    gap: "20px"
  },
  historyHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "1px solid var(--card-border)",
    paddingBottom: "10px"
  },
  sectionTitle: {
    fontSize: "20px",
    fontWeight: "700",
    display: "flex",
    alignItems: "center",
    color: "var(--text-color)"
  },
  clearHistoryBtn: {
    background: "transparent",
    border: "none",
    color: "var(--danger-color)",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    padding: "4px 8px",
    borderRadius: "6px",
    transition: "background var(--transition-speed)"
  },
  historyGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: "16px"
  },
  historyCard: {
    background: "var(--card-bg)",
    backdropFilter: "blur(10px)",
    border: "1px solid var(--card-border)",
    borderRadius: "14px",
    padding: "18px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    boxShadow: "var(--card-shadow)",
    transition: "transform var(--transition-speed), border-color var(--transition-speed)"
  },
  historyInfo: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    flex: 1,
    paddingRight: "10px"
  },
  historyDate: {
    fontSize: "11px",
    color: "var(--text-secondary)",
    opacity: 0.8
  },
  historyName: {
    fontSize: "15px",
    fontWeight: "600",
    color: "var(--text-color)"
  },
  historyMatchRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginTop: "4px"
  },
  historyRole: {
    fontSize: "12px",
    color: "var(--text-secondary)",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    maxWidth: "110px"
  },
  historyScoreBadge: {
    fontSize: "11px",
    color: "var(--success-color)",
    background: "rgba(16, 185, 129, 0.12)",
    padding: "1px 6px",
    borderRadius: "4px",
    fontWeight: "600"
  },
  openHistoryBtn: {
    background: "rgba(59, 130, 246, 0.1)",
    border: "1px solid rgba(59, 130, 246, 0.2)",
    color: "var(--accent-color)",
    padding: "8px 12px",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    whiteSpace: "nowrap",
    transition: "background var(--transition-speed), color var(--transition-speed)"
  },
  featuresSection: {
    textAlign: "center"
  },
  sectionHeading: {
    fontSize: "28px",
    fontWeight: "800",
    marginBottom: "12px",
    color: "var(--text-color)"
  },
  sectionSubheading: {
    fontSize: "15px",
    color: "var(--text-secondary)",
    marginBottom: "40px",
    maxWidth: "500px",
    margin: "0 auto 40px auto"
  },
  featuresGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "24px"
  },
  featureCard: {
    background: "var(--card-bg)",
    backdropFilter: "blur(10px)",
    border: "1px solid var(--card-border)",
    borderRadius: "16px",
    padding: "30px 24px",
    textAlign: "left",
    boxShadow: "var(--card-shadow)",
    transition: "transform var(--transition-speed), border-color var(--transition-speed)"
  },
  featureIcon: {
    fontSize: "28px",
    marginBottom: "16px",
    display: "inline-flex"
  },
  featureTitle: {
    fontSize: "18px",
    fontWeight: "700",
    marginBottom: "10px",
    color: "var(--text-color)"
  },
  featureDesc: {
    fontSize: "14px",
    color: "var(--text-secondary)",
    lineHeight: "1.5"
  }
};
