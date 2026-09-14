import React, { useState } from "react";
import API from "../api/apiClient";
import { toast } from "./ToastContainer";
import { FaUser, FaEnvelope, FaLock, FaUserPlus } from "react-icons/fa";

import styles from '../styles/components/Register.module.css';

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
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <span className={styles.logoEmoji}>✨</span>
          <h2 className={styles.title}>Create your Account</h2>
          <p className={styles.subtitle}>Get personalized AI career analysis and roadmap paths</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputWrapper}>
            <FaUser className={styles.icon} />
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={styles.input}
              required
            />
          </div>

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

          <div className={styles.inputWrapper}>
            <FaLock className={styles.icon} />
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={styles.input}
              required
            />
          </div>

          <button type="submit" disabled={isLoading} className={styles.btn}>
            {isLoading ? "Creating Account..." : (
              <>
                Register <FaUserPlus style={{ marginLeft: "8px" }} />
              </>
            )}
          </button>
        </form>

        <div className={styles.footer}>
          <span>Already have an account?</span>
          <button onClick={onToggleLogin} className={styles.toggleBtn}>
            Login Here
          </button>
        </div>
      </div>
    </div>
  );
}

