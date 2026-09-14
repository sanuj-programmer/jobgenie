import React, { useState, useEffect } from "react";
import { FaSun, FaMoon, FaGithub, FaLinkedin, FaInfoCircle, FaSignOutAlt } from "react-icons/fa";
import { toast } from "./ToastContainer";

import styles from '../styles/components/Navbar.module.css';

export default function Navbar({ onResetHistory, historyLength, user, onLogout, onBrandClick }) {
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
    <nav className={styles.nav}>
      <div className={`${styles.container} nav-container`}>
        <div onClick={onBrandClick} className={styles.brand}>
          <span className={styles.brandName}>JobGenie</span>
        </div>

        <div className={`${styles.navLinks} nav-links`}>
          <a
            href="https://github.com/sanuj-programmer"
            target="_blank"
            rel="noopener noreferrer"
            className={`${styles.iconLink} hide-on-mobile`}
            aria-label="GitHub Repository"
            title="GitHub"
          >
            <FaGithub />
          </a>
          <a
            href="https://www.linkedin.com/in/sanuj-kumar-singh/"
            target="_blank"
            rel="noopener noreferrer"
            className={`${styles.iconLink} hide-on-mobile`}
            aria-label="LinkedIn Profile"
            title="LinkedIn"
          >
            <FaLinkedin />
          </a>
          <a
            href="#"
            className={`${styles.iconLink} hide-on-mobile`}
            aria-label="About JobGenie"
            title="About Info"
            onClick={(e) => {
              e.preventDefault();
              toast("JobGenie: AI Career Path Matching & Guidance", "info");
            }}
          >
            <FaInfoCircle />
          </a>

          <div className={styles.divider}></div>

          <button
            onClick={toggleTheme}
            className={styles.themeToggle}
            aria-label="Toggle dark/light theme"
            title="Toggle theme"
          >
            {theme === "dark" ? <FaSun style={{ color: "#fbbf24" }} /> : <FaMoon style={{ color: "#3b82f6" }} />}
          </button>

          {user && (
            <>
              <div className={styles.divider}></div>
              <div className={styles.userInfo} title={user.email}>
                <div className={styles.userAvatar}>
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className={`${styles.userName} hide-on-mobile`}>{user.name}</span>
              </div>
              <button
                onClick={onLogout}
                className={styles.logoutBtn}
                title="Logout"
                aria-label="Logout"
              >
                <FaSignOutAlt />
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

