import React, { useState, useEffect, useRef } from "react";
import { 
  FaSun, 
  FaMoon, 
  FaGithub, 
  FaLinkedin, 
  FaInfoCircle, 
  FaSignOutAlt, 
  FaUserEdit, 
  FaBriefcase, 
  FaGraduationCap, 
  FaMapMarkerAlt, 
  FaFileUpload,
  FaChevronDown 
} from "react-icons/fa";
import { toast } from "./ToastContainer";

import styles from '../styles/components/Navbar.module.css';

export default function Navbar({ 
  onResetHistory, 
  historyLength, 
  user, 
  onLogout, 
  onBrandClick,
  onOpenProfileTab 
}) {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "dark";
  });
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Click outside to dismiss dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    toast(`Theme updated to ${nextTheme} mode!`, "info");
  };

  const handleMenuClick = (tab) => {
    setDropdownOpen(false);
    if (onOpenProfileTab) {
      onOpenProfileTab(tab);
    }
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
              
              <div className={styles.profileWrapper} ref={dropdownRef}>
                <div 
                  className={styles.userInfo} 
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  role="button"
                  tabIndex={0}
                  aria-expanded={dropdownOpen}
                  title="Profile & Settings"
                >
                  <div className={styles.userAvatar}>
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className={styles.avatarImg} />
                    ) : (
                      user.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <span className={`${styles.userName} hide-on-mobile`}>{user.name}</span>
                  <FaChevronDown className={`${styles.chevron} ${dropdownOpen ? styles.chevronOpen : ""}`} />
                </div>

                {dropdownOpen && (
                  <div className={styles.dropdownMenu}>
                    <div className={styles.dropdownHeader}>
                      <div className={styles.dropdownAvatarLarge}>
                        {user.avatar ? (
                          <img src={user.avatar} alt={user.name} className={styles.avatarImg} />
                        ) : (
                          user.name.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div className={styles.dropdownUserMeta}>
                        <div className={styles.dropdownName}>{user.name}</div>
                        <div className={styles.dropdownEmail}>{user.email}</div>
                      </div>
                    </div>

                    <div className={styles.dropdownDivider}></div>

                    <div className={styles.dropdownSectionTitle}>Profile Settings</div>

                    <button 
                      className={styles.dropdownItem} 
                      onClick={() => handleMenuClick("general")}
                    >
                      <FaUserEdit className={styles.dropdownIcon} />
                      <span>Edit Profile</span>
                    </button>

                    <button 
                      className={styles.dropdownItem} 
                      onClick={() => handleMenuClick("experience")}
                    >
                      <FaBriefcase className={styles.dropdownIcon} />
                      <span>Add Experience</span>
                    </button>

                    <button 
                      className={styles.dropdownItem} 
                      onClick={() => handleMenuClick("education")}
                    >
                      <FaGraduationCap className={styles.dropdownIcon} />
                      <span>Education Details</span>
                    </button>

                    <button 
                      className={styles.dropdownItem} 
                      onClick={() => handleMenuClick("general")}
                    >
                      <FaMapMarkerAlt className={styles.dropdownIcon} />
                      <span>Update Location</span>
                    </button>

                    <button 
                      className={styles.dropdownItem} 
                      onClick={() => handleMenuClick("resume")}
                    >
                      <FaFileUpload className={styles.dropdownIcon} />
                      <span>Upload Resume / CV</span>
                    </button>

                    <div className={styles.dropdownDivider}></div>

                    <button 
                      className={`${styles.dropdownItem} ${styles.dropdownLogout}`} 
                      onClick={() => {
                        setDropdownOpen(false);
                        onLogout();
                      }}
                    >
                      <FaSignOutAlt className={styles.dropdownIcon} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
