import React, { useState } from "react";
import API from "../api/apiClient";
import { toast } from "./ToastContainer";
import { FaEnvelope, FaLock, FaSignInAlt } from "react-icons/fa";

export default function Login({ onLoginSuccess, onToggleRegister }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast("Please fill in all fields", "warning");
      return;
    }

    setIsLoading(true);
    try {
      const res = await API.post("/auth/login", { email, password });
      toast(`Welcome back, ${res.data.user.name}!`, "success");
      onLoginSuccess(res.data.user);
    } catch (err) {
      console.error("Login failed:", err);
      toast(err.response?.data?.error || "Login credentials failed", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <span style={styles.logoEmoji}>🪄</span>
          <h2 style={styles.title}>Welcome back to JobGenie</h2>
          <p style={styles.subtitle}>Enter your details to access your career dashboard</p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
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

          <button type="submit" disabled={isLoading} style={styles.btn}>
            {isLoading ? "Logging in..." : (
              <>
                Login <FaSignInAlt style={{ marginLeft: "8px" }} />
              </>
            )}
          </button>
        </form>

        <div style={styles.footer}>
          <span>Don't have an account?</span>
          <button onClick={onToggleRegister} style={styles.toggleBtn}>
            Register Here
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
