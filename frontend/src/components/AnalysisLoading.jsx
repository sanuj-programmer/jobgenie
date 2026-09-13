import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaCheckCircle, FaSpinner } from "react-icons/fa";

import styles from '../styles/components/AnalysisLoading.module.css';

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
    <div className={styles.container}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={styles.card}
      >
        <div className={styles.brandHeader}>
          <h2 className={styles.brandTitle}>JobGenie AI</h2>
        </div>

        <div className={styles.loadingWidget}>
          <FaSpinner className={styles.spinner} />
          <span className={styles.title}>Analyzing your profile...</span>
        </div>

        <div className={styles.stepsList}>
          {steps.map((stepText, idx) => {
            const isCompleted = idx < activeStep;
            const isActive = idx === activeStep;
            const isPending = idx > activeStep;

            return (
              <div
                key={idx}
                className={styles.stepRow}
style={{opacity: isPending ? 0.35 : 1,
                  color: isCompleted ? "var(--success-color)" : "var(--text-color)"
                }}
              >
                <div className={styles.stepIndicator}>
                  {isCompleted ? (
                    <FaCheckCircle className={styles.checkIcon} />
                  ) : isActive ? (
                    <div className={styles.activeDot} />
                  ) : (
                    <div className={styles.pendingDot} />
                  )}
                </div>
                <span
                  className={styles.stepText}
style={{fontWeight: isActive ? "700" : "500"
                  }}
                >
                  {stepText}
                </span>
              </div>
            );
          })}
        </div>

        {/* Global Progress Line */}
        <div className={styles.progressTrack}>
          <motion.div
            initial={{ width: "0%" }}
            animate={{ width: `${((activeStep + 1) / steps.length) * 100}%` }}
            transition={{ duration: 0.4 }}
            className={styles.progressFill}
          />
        </div>
      </motion.div>
    </div>
  );
}

