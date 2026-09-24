import React, { useState, useEffect } from "react";
import API from "./api/apiClient";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import LandingPage from "./components/LandingPage";
import ChatProfileBuilder from "./components/ChatProfileBuilder";
import AnalysisLoading from "./components/AnalysisLoading";
import ResultsDashboard from "./components/ResultsDashboard";
import Login from "./components/Login";
import Register from "./components/Register";
import ToastContainer, { toast } from "./components/ToastContainer";
import { FaTimes, FaComments, FaSync, FaSpinner } from "react-icons/fa";

import styles from './styles/App.module.css';

export default function App() {
  const [user, setUser] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [authScreen, setAuthScreen] = useState("login"); // 'login' | 'register'
  
  const [screen, setScreen] = useState("landing"); // 'landing' | 'chat' | 'loading' | 'results'
  const [profile, setProfile] = useState(null);
  const [result, setResult] = useState(null);
  const [prefillData, setPrefillData] = useState(null);
  
  // Timeout / Error handling states
  const [isApiLoading, setIsApiLoading] = useState(false);
  const [apiError, setApiError] = useState(null); // null | 'timeout' | 'network'
  const [pendingProfile, setPendingProfile] = useState(null); // to allow retrying matching
  
  // Conversational log state
  const [conversation, setConversation] = useState([]);
  const [isConversationOpen, setIsConversationOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Check user session on app start
  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await API.get("/auth/me");
        setUser(res.data.user);
      } catch (err) {
        // Silent block - unauthenticated user is normal on app startup
        setUser(null);
      } finally {
        setCheckingSession(false);
      }
    };
    checkSession();
  }, []);

  // Listen for session expiry event from Axios interceptor
  useEffect(() => {
    const handleAuthExpired = () => {
      setUser(null);
      setProfile(null);
      setResult(null);
      setScreen("landing");
      toast("Your session has expired. Please login again.", "warning");
    };

    window.addEventListener("auth-expired", handleAuthExpired);
    return () => window.removeEventListener("auth-expired", handleAuthExpired);
  }, []);

  // Handle browser back/forward buttons (HTML5 History API)
  useEffect(() => {
    const handlePopState = (event) => {
      if (event.state && event.state.screen) {
        setScreen(event.state.screen);
      } else {
        setScreen("landing");
      }
    };

    window.addEventListener("popstate", handlePopState);

    // Set initial history entry
    const hash = window.location.hash.replace("#", "");
    const initialScreen = ["landing", "chat", "loading", "results"].includes(hash) ? hash : "landing";
    if (!window.history.state) {
      window.history.replaceState({ screen: initialScreen }, "", `#${initialScreen}`);
    }
    setScreen(initialScreen);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  // Push new history state when screen changes
  useEffect(() => {
    if (window.history.state?.screen !== screen) {
      window.history.pushState({ screen }, "", `#${screen}`);
    }
  }, [screen]);

  // Render background glow nodes on mount
  useEffect(() => {
    const glow = document.createElement("div");
    glow.className = "bg-glow-container";
    glow.innerHTML = '<div class="bg-glow-1"></div><div class="bg-glow-2"></div>';
    document.body.appendChild(glow);
    return () => {
      document.body.removeChild(glow);
    };
  }, []);

  const saveToHistory = (prof, res) => {
    try {
      const stored = localStorage.getItem("jobgenie_history");
      let history = stored ? JSON.parse(stored) : [];
      
      const newEntry = {
        id: Date.now(),
        date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        profile: prof,
        results: res
      };
      
      // Filter out duplicate names if necessary or simply prepend
      history = [newEntry, ...history.filter(h => h.profile?.name !== prof.name)].slice(0, 10);
      localStorage.setItem("jobgenie_history", JSON.stringify(history));
    } catch (e) {
      console.error("Failed to save history item", e);
    }
  };

  const executeAnalysis = async (userProfile) => {
    setIsApiLoading(true);
    setApiError(null);
    setPendingProfile(userProfile);

    // Save profile record
    try {
      await API.post("/profile", userProfile);
      toast("Profile saved successfully!", "success");
    } catch (err) {
      console.error("Profile save failed:", err);
      // Suppress showing toast if it failed due to auth expiry since interceptor handles it
      if (err.response?.status !== 401) {
        toast("Database registration failed. Retrying matching anyway...", "warning");
      }
    }

    // Call matching API with a 10s timeout
    try {
      const res = await API.post("/match", userProfile, { timeout: 10000 });
      setResult(res.data);
      setProfile(userProfile);
      saveToHistory(userProfile, res.data);
      setIsApiLoading(false);
    } catch (err) {
      console.error("Match API error:", err);
      setIsApiLoading(false);
      
      if (err.response?.status === 401) {
        return; // Handled by interceptor
      }

      if (err.code === "ECONNABORTED" || err.message?.includes("timeout")) {
        setApiError("timeout");
        toast("Match calculation timed out.", "error");
      } else {
        setApiError("network");
        toast("Network error occurred.", "error");
      }
    }
  };

  const handleStartAnalysis = () => {
    setPrefillData(null);
    setScreen("chat");
  };

  const handleChatComplete = (userProfile) => {
    const convSnapshot = [
      { q: "Hey! What’s your name? 😊", a: userProfile.name },
      { q: "Nice to meet you! What is your email address?", a: userProfile.email },
      { q: "Awesome! Can you provide your phone number?", a: userProfile.phoneNumber },
      { q: "Great! List your skills (comma separated)", a: userProfile.skills.join(", ") },
      { q: "How many years of experience do you have?", a: `${userProfile.experienceYears} Years` },
      { q: "Awesome! What is your education?", a: userProfile.education },
      { q: "Where are you from?", a: userProfile.location }
    ];
    setConversation(convSnapshot);
    setScreen("loading");
    executeAnalysis(userProfile);
  };

  const handleEditProfile = () => {
    setPrefillData(profile);
    setScreen("chat");
  };

  const handleRestart = () => {
    setProfile(null);
    setResult(null);
    setPrefillData(null);
    setScreen("landing");
  };

  const handleLoadHistory = (historyItem) => {
    setProfile(historyItem.profile);
    setResult(historyItem.results);
    
    const convSnapshot = [
      { q: "Hey! What’s your name? 😊", a: historyItem.profile.name },
      { q: "Nice to meet you! What is your email address?", a: historyItem.profile.email },
      { q: "Awesome! Can you provide your phone number?", a: historyItem.profile.phoneNumber },
      { q: "Great! List your skills (comma separated)", a: historyItem.profile.skills.join(", ") },
      { q: "How many years of experience do you have?", a: `${historyItem.profile.experienceYears} Years` },
      { q: "Awesome! What is your education?", a: historyItem.profile.education },
      { q: "Where are you from?", a: historyItem.profile.location }
    ];
    setConversation(convSnapshot);
    setScreen("results");
    toast("Restored session matching dashboard!", "success");
  };

  const initiateLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = async () => {
    setShowLogoutConfirm(false);
    try {
      await API.post("/auth/logout");
      toast("Logged out successfully", "success");
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      setUser(null);
      setProfile(null);
      setResult(null);
      setScreen("landing");
    }
  };

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setScreen("landing");
  };

  const handleRegisterSuccess = () => {
    setAuthScreen("login");
  };

  // Loading indicator for startup session check
  if (checkingSession) {
    return (
      <div className={styles.appContainer}>
        <Navbar user={null} onLogout={null} />
        <main className={`${styles.mainContent} ${styles.centerContainer}`}>
          <FaSpinner className={styles.spinner} />
          <p style={{ marginTop: "12px", color: "var(--text-secondary)" }}>Verifying session...</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className={styles.appContainer}>
      <Navbar user={user} onLogout={initiateLogout} onBrandClick={handleRestart} />

      <main className={styles.mainContent}>
        {/* Render unauthenticated views if user is not logged in */}
        {!user ? (
          <>
            {authScreen === "login" ? (
              <Login 
                onLoginSuccess={handleLoginSuccess}
                onToggleRegister={() => setAuthScreen("register")}
              />
            ) : (
              <Register 
                onRegisterSuccess={handleRegisterSuccess}
                onToggleLogin={() => setAuthScreen("login")}
              />
            )}
          </>
        ) : (
          <>
            {screen === "landing" && (
              <LandingPage 
                onStartAnalysis={handleStartAnalysis} 
                onLoadHistory={handleLoadHistory} 
              />
            )}

            {screen === "chat" && (
              <ChatProfileBuilder 
                onComplete={handleChatComplete} 
                prefillData={prefillData}
              />
            )}

            {screen === "loading" && !apiError && (
              <AnalysisLoading 
                isApiLoading={isApiLoading} 
                onFinished={() => setScreen("results")} 
              />
            )}

            {screen === "loading" && apiError && (
              <div className={styles.errorScreen}>
                <div className={styles.errorCard}>
                  <span className={styles.errorIcon}>🚨</span>
                  <h2 className={styles.errorTitle}>
                    {apiError === "timeout" ? "Request Timeout" : "Network Connection Failed"}
                  </h2>
                  <p className={styles.errorText}>
                    {apiError === "timeout"
                      ? "The matching service is taking longer than 10 seconds to respond. You can retry the matching algorithm or return to the landing page."
                      : "We encountered a network error while computing your match dashboard. Please verify that your backend API server is online on port 4000."}
                  </p>
                  
                  <div className={styles.errorBtnRow}>
                    <button onClick={() => executeAnalysis(pendingProfile)} className={styles.retryBtn}>
                      <FaSync /> Retry Calculation
                    </button>
                    <button onClick={handleRestart} className={styles.cancelBtn}>
                      Cancel & Exit
                    </button>
                  </div>
                </div>
              </div>
            )}

            {screen === "results" && (
              <ResultsDashboard 
                result={result} 
                profile={profile} 
                onEditProfile={handleEditProfile} 
                onRestart={handleRestart}
                onViewConversation={() => setIsConversationOpen(true)}
                isLoading={false}
              />
            )}
          </>
        )}
      </main>

      <Footer />
      <ToastContainer />

      {/* View Conversation Log Modal */}
      {isConversationOpen && (
        <div className={styles.modalBackdrop} onClick={() => setIsConversationOpen(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>
                <FaComments style={{ color: "var(--accent-color)", marginRight: "8px" }} />
                Analysis Conversation Log
              </h3>
              <button onClick={() => setIsConversationOpen(false)} className={styles.modalCloseBtn}>
                <FaTimes />
              </button>
            </div>
            
            <div className={`${styles.modalBody} chat-scrollbar`}>
              {conversation.map((c, i) => (
                <div key={i} className={styles.modalConvPair}>
                  <div className={styles.modalBotBubble}>
                    <span className={styles.speakerLabel}>🤖 JobGenie Agent</span>
                    <p>{c.q}</p>
                  </div>
                  <div className={styles.modalUserBubble}>
                    <span className={styles.speakerLabel}>👤 {profile?.name || "You"}</span>
                    <p>{c.a}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className={styles.modalBackdrop} onClick={() => setShowLogoutConfirm(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>
                Confirm Logout
              </h3>
              <button onClick={() => setShowLogoutConfirm(false)} className={styles.modalCloseBtn}>
                <FaTimes />
              </button>
            </div>
            <div className={styles.modalBody} style={{ gap: "16px" }}>
              <p style={{ color: "var(--text-color)", textAlign: "center", fontSize: "16px" }}>Are you sure you want to log out?</p>
              <div className={styles.errorBtnRow} style={{ marginTop: "12px" }}>
                <button onClick={confirmLogout} className={styles.retryBtn} style={{ background: "var(--danger-color)" }}>
                  Yes, Logout
                </button>
                <button onClick={() => setShowLogoutConfirm(false)} className={styles.cancelBtn}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

