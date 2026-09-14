import React from "react";
import { FaGithub, FaLinkedin } from "react-icons/fa";

import styles from '../styles/components/Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`${styles.container} footer-container`}>
        <div className={`${styles.info} footer-info`}>
          <span className={styles.credits}>
            Built with ❤️ by <span className={styles.author}>Sanuj Kumar Singh</span>
          </span>
        </div>

        <div className={styles.links}>
          <a
            href="https://github.com/sanuj-programmer"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.link}
            aria-label="GitHub Profile"
          >
            <FaGithub /> GitHub
          </a>
          <a
            href="https://www.linkedin.com/in/sanuj-kumar-singh/"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.link}
            aria-label="LinkedIn Profile"
          >
            <FaLinkedin /> LinkedIn
          </a>
        </div>
      </div>
    </footer>
  );
}

