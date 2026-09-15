import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle } from "react-icons/fa";

import styles from '../styles/components/ToastContainer.module.css';

export default function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const handleToast = (e) => {
      const { message, type = "success", duration = 3000 } = e.detail;
      const id = Date.now() + Math.random();
      setToasts((prev) => [...prev, { id, message, type }]);

      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    };

    window.addEventListener("show-toast", handleToast);
    return () => window.removeEventListener("show-toast", handleToast);
  }, []);

  const getIcon = (type) => {
    switch (type) {
      case "success":
        return <FaCheckCircle style={{ color: "var(--success-color)", fontSize: "1.1rem" }} />;
      case "warning":
        return <FaExclamationCircle style={{ color: "var(--warning-color)", fontSize: "1.1rem" }} />;
      case "error":
        return <FaExclamationCircle style={{ color: "var(--danger-color)", fontSize: "1.1rem" }} />;
      default:
        return <FaInfoCircle style={{ color: "var(--accent-color)", fontSize: "1.1rem" }} />;
    }
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className={styles.container}>
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
            className={styles.toast}
style={{borderColor: toast.type === "error" ? "var(--danger-color)" : "var(--card-border)"
            }}
            onClick={() => removeToast(toast.id)}
          >
            {getIcon(toast.type)}
            <span className={styles.message}>{toast.message}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// Global helper to trigger toast
export const toast = (message, type = "success", duration = 3000) => {
  window.dispatchEvent(
    new CustomEvent("show-toast", {
      detail: { message, type, duration }
    })
  );
};

