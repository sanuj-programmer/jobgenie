import React from "react";
import { FaGithub, FaLinkedin } from "react-icons/fa";

export default function Footer() {
  return (
    <footer style={styles.footer}>
      <div style={styles.container}>
        <div style={styles.info}>
          <span style={styles.credits}>
            Built with ❤️ by <span style={styles.author}>Sanuj Kumar Singh</span>
          </span>
          <span style={styles.version}>v2.0.0 (Hackathon Edition)</span>
        </div>

        <div style={styles.links}>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            style={styles.link}
            aria-label="GitHub Profile"
          >
            <FaGithub /> GitHub
          </a>
          <a
            href="https://linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
            style={styles.link}
            aria-label="LinkedIn Profile"
          >
            <FaLinkedin /> LinkedIn
          </a>
        </div>
      </div>
    </footer>
  );
}

const styles = {
  footer: {
    width: "100%",
    background: "rgba(15, 23, 42, 0.4)",
    borderTop: "1px solid var(--card-border)",
    padding: "20px 0",
    marginTop: "auto",
    transition: "background var(--transition-speed), border var(--transition-speed)"
  },
  container: {
    maxWidth: "1400px",
    margin: "0 auto",
    padding: "0 24px",
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "16px"
  },
  info: {
    display: "flex",
    flexDirection: "column",
    gap: "4px"
  },
  credits: {
    fontSize: "13px",
    color: "var(--text-secondary)"
  },
  author: {
    color: "var(--text-color)",
    fontWeight: "600"
  },
  version: {
    fontSize: "11px",
    color: "var(--text-secondary)",
    opacity: 0.7
  },
  links: {
    display: "flex",
    gap: "24px"
  },
  link: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "13px",
    color: "var(--text-secondary)",
    textDecoration: "none",
    transition: "color var(--transition-speed)"
  }
};
