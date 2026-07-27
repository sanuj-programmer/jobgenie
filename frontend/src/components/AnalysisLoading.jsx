import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaCheckCircle, FaSpinner } from "react-icons/fa";

export default function AnalysisLoading({ isApiLoading, onFinished }) {
  const steps = [
    "Reading profile...",
    "Thinking...",
    "Matching careers...",
    "Finding jobs...",
    "Almost Done..."
  ];

  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    // Tick steps sequentially every 600ms
    const interval = setInterval(() => {
      setActiveStep((prev) => {
        if (prev < steps.length - 1) {
          return prev + 1;
        } else {
          clearInterval(interval);
          return prev;
        }
      });
    }, 700);

    return () => clearInterval(interval);
  }, []);

  // Monitor API loading status. When steps are completed and API is ready, finish up.
  useEffect(() => {
    if (activeStep === steps.length - 1 && !isApiLoading) {
      const delay = setTimeout(() => {
        onFinished();
      }, 500); // Small final buffer
      return () => clearTimeout(delay);
    }
  }, [activeStep, isApiLoading]);

  return (
    <div style={styles.container}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        style={styles.card}
      >
        <div style={styles.brandHeader}>
          <span style={styles.brandIcon}>🪄</span>
          <h2 style={styles.brandTitle}>JobGenie AI</h2>
        </div>

        <div style={styles.loadingWidget}>
          <FaSpinner style={styles.spinner} />
          <span style={styles.title}>Analyzing your profile...</span>
        </div>

        <div style={styles.stepsList}>
          {steps.map((stepText, idx) => {
            const isCompleted = idx < activeStep;
            const isActive = idx === activeStep;
            const isPending = idx > activeStep;

            return (
              <div
                key={idx}
                style={{
                  ...styles.stepRow,
                  opacity: isPending ? 0.35 : 1,
                  color: isCompleted ? "var(--success-color)" : "var(--text-color)"
                }}
              >
                <div style={styles.stepIndicator}>
                  {isCompleted ? (
                    <FaCheckCircle style={styles.checkIcon} />
                  ) : isActive ? (
                    <div style={styles.activeDot} />
                  ) : (
                    <div style={styles.pendingDot} />
                  )}
                </div>
                <span
                  style={{
                    ...styles.stepText,
                    fontWeight: isActive ? "700" : "500"
                  }}
                >
                  {stepText}
                </span>
              </div>
            );
          })}
        </div>

        {/* Global Progress Line */}
        <div style={styles.progressTrack}>
          <motion.div
            initial={{ width: "0%" }}
            animate={{ width: `${((activeStep + 1) / steps.length) * 100}%` }}
            transition={{ duration: 0.4 }}
            style={styles.progressFill}
          />
        </div>
      </motion.div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "calc(100vh - 128px)",
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px"
  },
  card: {
    background: "var(--card-bg)",
    backdropFilter: "blur(12px)",
    border: "1px solid var(--card-border)",
    boxShadow: "var(--card-shadow)",
    borderRadius: "var(--border-radius)",
    width: "100%",
    maxWidth: "500px",
    padding: "36px 30px",
    display: "flex",
    flexDirection: "column",
    gap: "28px"
  },
  brandHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px"
  },
  brandIcon: {
    fontSize: "1.8rem"
  },
  brandTitle: {
    fontSize: "22px",
    fontWeight: "800",
    letterSpacing: "-0.5px",
    background: "linear-gradient(90deg, var(--accent-color) 0%, #a855f7 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    color: "var(--text-color)"
  },
  loadingWidget: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "14px"
  },
  spinner: {
    fontSize: "36px",
    color: "var(--accent-color)",
    animation: "skeleton-pulse 1.2s infinite linear"
  },
  title: {
    fontSize: "16px",
    fontWeight: "600",
    color: "var(--text-secondary)"
  },
  stepsList: {
    display: "flex",
    flexDirection: "column",
    gap: "16px"
  },
  stepRow: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    transition: "opacity 0.3s, color 0.3s"
  },
  stepIndicator: {
    width: "20px",
    height: "20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  checkIcon: {
    fontSize: "16px"
  },
  activeDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    background: "var(--accent-color)",
    boxShadow: "0 0 10px var(--accent-color)"
  },
  pendingDot: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    background: "var(--text-secondary)",
    opacity: 0.5
  },
  stepText: {
    fontSize: "14px"
  },
  progressTrack: {
    height: "4px",
    width: "100%",
    background: "var(--card-border)",
    borderRadius: "2px",
    overflow: "hidden"
  },
  progressFill: {
    height: "100%",
    background: "linear-gradient(90deg, var(--accent-color) 0%, #a855f7 100%)"
  }
};
