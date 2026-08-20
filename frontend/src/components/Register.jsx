import React, { useState } from "react";
import API from "../api/apiClient";
import { toast } from "./ToastContainer";
import { FaUser, FaEnvelope, FaLock, FaUserPlus } from "react-icons/fa";

export default function Register({ onRegisterSuccess, onToggleLogin }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword) {
      toast("Please fill in all fields", "warning");
      return;
    }
    if (password !== confirmPassword) {
      toast("Passwords do not match", "error");
      return;
    }

    setIsLoading(true);
    try {
      const res = await API.post("/auth/register", { name, email, password });
      toast(res.data.message || "Registration successful! Please login.", "success");
      onRegisterSuccess();
    } catch (err) {
      console.error("Registration failed:", err);
      toast(err.response?.data?.error || "Registration failed", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <span style={styles.logoEmoji}>✨</span>
          <h2 style={styles.title}>Create your Account</h2>
          <p style={styles.subtitle}>Get personalized AI career analysis and roadmap paths</p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputWrapper}>
            <FaUser style={styles.icon} />
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.inputWrapper}>
            <FaEnvelope style={styles.icon} />
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.inputWrapper}>
            <FaLock style={styles.icon} />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.inputWrapper}>
            <FaLock style={styles.icon} />
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              style={styles.input}
              required
            />
          </div>

          <button type="submit" disabled={isLoading} style={styles.btn}>
            {isLoading ? "Creating Account..." : (
              <>
                Register <FaUserPlus style={{ marginLeft: "8px" }} />
              </>
            )}
          </button>
        </form>

        <div style={styles.footer}>
          <span>Already have an account?</span>
          <button onClick={onToggleLogin} style={styles.toggleBtn}>
            Login Here
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "calc(100vh - 128px)",
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
    maxWidth: "420px",
    padding: "36px 30px",
    display: "flex",
    flexDirection: "column",
    gap: "24px"
  },
  header: {
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "8px"
  },
  logoEmoji: {
    fontSize: "2rem"
  },
  title: {
    fontSize: "20px",
    fontWeight: "800",
    color: "var(--text-color)"
  },
  subtitle: {
    fontSize: "13px",
    color: "var(--text-secondary)",
    lineHeight: "1.4"
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "16px"
  },
  inputWrapper: {
    position: "relative",
    display: "flex",
    alignItems: "center"
  },
  icon: {
    position: "absolute",
    left: "14px",
    color: "var(--text-secondary)",
    fontSize: "14px"
  },
  input: {
    width: "100%",
    background: "rgba(15, 23, 42, 0.3)",
    border: "1px solid var(--card-border)",
    borderRadius: "12px",
    padding: "0 14px 0 42px",
    height: "46px",
    fontSize: "14px",
    color: "var(--text-color)",
    outline: "none",
    transition: "border-color var(--transition-speed)"
  },
  btn: {
    background: "var(--accent-color)",
    color: "#fff",
    border: "none",
    borderRadius: "12px",
    height: "46px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginTop: "8px",
    transition: "background var(--transition-speed)"
  },
  footer: {
    display: "flex",
    justifyContent: "center",
    gap: "6px",
    fontSize: "13px",
    color: "var(--text-secondary)",
    marginTop: "4px"
  },
  toggleBtn: {
    background: "none",
    border: "none",
    color: "var(--accent-color)",
    fontWeight: "600",
    cursor: "pointer",
    fontSize: "13px",
    padding: 0
  }
};
