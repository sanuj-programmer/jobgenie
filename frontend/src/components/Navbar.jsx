import React, { useState, useEffect } from "react";
import { FaSun, FaMoon, FaGithub, FaLinkedin, FaInfoCircle } from "react-icons/fa";
import { toast } from "./ToastContainer";

export default function Navbar({ onResetHistory, historyLength }) {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "dark";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    toast(`Theme updated to ${nextTheme} mode!`, "info");
  };

  return (
    <nav style={styles.nav}>
      <div style={styles.container}>
        <div style={styles.brand}>
          <span style={styles.magicEmoji}>🪄</span>
          <span style={styles.brandName}>JobGenie</span>
          <span style={styles.badge}>v2</span>
        </div>

        <div style={styles.navLinks}>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            style={styles.iconLink}
            aria-label="GitHub Repository"
            title="GitHub"
          >
            <FaGithub />
          </a>
          <a
            href="https://linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
            style={styles.iconLink}
            aria-label="LinkedIn Profile"
            title="LinkedIn"
          >
            <FaLinkedin />
          </a>
          <a
            href="#"
            style={styles.iconLink}
            aria-label="About JobGenie"
            title="About Info"
            onClick={(e) => {
              e.preventDefault();
              toast("JobGenie v2: AI Career Path Matching & Guidance", "info");
            }}
          >
            <FaInfoCircle />
          </a>

          <div style={styles.divider}></div>

          <button
            onClick={toggleTheme}
            style={styles.themeToggle}
            aria-label="Toggle dark/light theme"
            title="Toggle theme"
          >
            {theme === "dark" ? <FaSun style={{ color: "#fbbf24" }} /> : <FaMoon style={{ color: "#3b82f6" }} />}
          </button>
        </div>
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    position: "sticky",
    top: 0,
    zIndex: 1000,
    width: "100%",
    background: "rgba(15, 23, 42, 0.4)",
    backdropFilter: "blur(12px)",
    borderBottom: "1px solid var(--card-border)",
    transition: "background var(--transition-speed), border var(--transition-speed)"
  },
  container: {
    maxWidth: "1400px",
    margin: "0 auto",
    padding: "0 24px",
    height: "64px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    cursor: "pointer"
  },
  magicEmoji: {
    fontSize: "1.5rem"
  },
  brandName: {
    fontSize: "20px",
    fontWeight: "800",
    letterSpacing: "-0.5px",
    background: "linear-gradient(90deg, var(--accent-color) 0%, #a855f7 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    color: "var(--text-color)"
  },
  badge: {
    background: "rgba(59, 130, 246, 0.15)",
    color: "var(--accent-color)",
    fontSize: "11px",
    fontWeight: "600",
    padding: "2px 6px",
    borderRadius: "20px",
    border: "1px solid rgba(59, 130, 246, 0.3)"
  },
  navLinks: {
    display: "flex",
    alignItems: "center",
    gap: "18px"
  },
  iconLink: {
    color: "var(--text-secondary)",
    fontSize: "18px",
    display: "flex",
    alignItems: "center",
    textDecoration: "none",
    transition: "color var(--transition-speed)",
    cursor: "pointer"
  },
  divider: {
    height: "20px",
    width: "1px",
    background: "var(--card-border)"
  },
  themeToggle: {
    background: "none",
    border: "none",
    padding: 0,
    fontSize: "18px",
    display: "flex",
    alignItems: "center",
    cursor: "pointer",
    color: "var(--text-secondary)",
    transition: "transform var(--transition-speed), color var(--transition-speed)"
  }
};
