import React, { useState } from "react";
import API from "../api/apiClient";
import { toast } from "./ToastContainer";
import { FaEnvelope, FaLock, FaSignInAlt } from "react-icons/fa";

import styles from '../styles/components/Login.module.css';

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
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h2 className={styles.title}>Welcome back to JobGenie</h2>
          <p className={styles.subtitle}>Enter your details to access your career dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputWrapper}>
            <FaEnvelope className={styles.icon} />
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.input}
              required
            />
          </div>

          <div className={styles.inputWrapper}>
            <FaLock className={styles.icon} />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.input}
              required
            />
          </div>

          <button type="submit" disabled={isLoading} className={styles.btn}>
            {isLoading ? "Logging in..." : (
              <>
                Login <FaSignInAlt style={{ marginLeft: "8px" }} />
              </>
            )}
          </button>
        </form>

        <div className={styles.footer}>
          <span>Don't have an account?</span>
          <button onClick={onToggleRegister} className={styles.toggleBtn}>
            Register Here
          </button>
        </div>
      </div>
    </div>
  );
}

