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
      { q: "Nice to meet you! List your skills (comma separated)", a: userProfile.skills.join(", ") },
      { q: "Great! What are your interests? (comma separated)", a: userProfile.interests.join(", ") },
      { q: "How many years of experience do you have?", a: `${userProfile.experienceYears} Years` },
      { q: "Where are you from?", a: userProfile.location },
      { q: "Awesome! What is your education?", a: userProfile.education }
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
      { q: "Nice to meet you! List your skills (comma separated)", a: historyItem.profile.skills.join(", ") },
      { q: "Great! What are your interests? (comma separated)", a: historyItem.profile.interests.join(", ") },
      { q: "How many years of experience do you have?", a: `${historyItem.profile.experienceYears} Years` },
      { q: "Where are you from?", a: historyItem.profile.location },
      { q: "Awesome! What is your education?", a: historyItem.profile.education }
    ];
    setConversation(convSnapshot);
    setScreen("results");
    toast("Restored session matching dashboard!", "success");
  };

  const handleLogout = async () => {
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
      <div style={styles.appContainer}>
        <Navbar user={null} onLogout={null} />
        <main style={{ ...styles.mainContent, ...styles.centerContainer }}>
          <FaSpinner style={styles.spinner} />
          <p style={{ marginTop: "12px", color: "var(--text-secondary)" }}>Verifying session...</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div style={styles.appContainer}>
      <Navbar user={user} onLogout={handleLogout} />

      <main style={styles.mainContent}>
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
              <div style={styles.errorScreen}>
                <div style={styles.errorCard}>
                  <span style={styles.errorIcon}>🚨</span>
                  <h2 style={styles.errorTitle}>
                    {apiError === "timeout" ? "Request Timeout" : "Network Connection Failed"}
                  </h2>
                  <p style={styles.errorText}>
                    {apiError === "timeout"
                      ? "The matching service is taking longer than 10 seconds to respond. You can retry the matching algorithm or return to the landing page."
                      : "We encountered a network error while computing your match dashboard. Please verify that your backend API server is online on port 4000."}
                  </p>
                  
                  <div style={styles.errorBtnRow}>
                    <button onClick={() => executeAnalysis(pendingProfile)} style={styles.retryBtn}>
                      <FaSync /> Retry Calculation
                    </button>
                    <button onClick={handleRestart} style={styles.cancelBtn}>
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
        <div style={styles.modalBackdrop} onClick={() => setIsConversationOpen(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>
                <FaComments style={{ color: "var(--accent-color)", marginRight: "8px" }} />
                Analysis Conversation Log
              </h3>
              <button onClick={() => setIsConversationOpen(false)} style={styles.modalCloseBtn}>
                <FaTimes />
              </button>
            </div>
            
            <div style={styles.modalBody} className="chat-scrollbar">
              {conversation.map((c, i) => (
                <div key={i} style={styles.modalConvPair}>
                  <div style={styles.modalBotBubble}>
                    <span style={styles.speakerLabel}>🤖 JobGenie Agent</span>
                    <p>{c.q}</p>
                  </div>
                  <div style={styles.modalUserBubble}>
                    <span style={styles.speakerLabel}>👤 {profile?.name || "You"}</span>
                    <p>{c.a}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  appContainer: {
    display: "flex",
    flexDirection: "column",
    minHeight: "100vh",
    width: "100%"
  },
  mainContent: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    position: "relative",
    zIndex: 1
  },
  centerContainer: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: "calc(100vh - 128px)"
  },
  spinner: {
    fontSize: "36px",
    color: "var(--accent-color)",
    animation: "skeleton-pulse 1.2s infinite linear"
  },
  errorScreen: {
    minHeight: "calc(100vh - 128px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px"
  },
  errorCard: {
    background: "var(--card-bg)",
    backdropFilter: "blur(12px)",
    border: "1px solid var(--card-border)",
    boxShadow: "var(--card-shadow)",
    borderRadius: "var(--border-radius)",
    width: "100%",
    maxWidth: "500px",
    padding: "36px 30px",
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "18px"
  },
  errorIcon: {
    fontSize: "40px"
  },
  errorTitle: {
    fontSize: "20px",
    fontWeight: "800",
    color: "var(--text-color)"
  },
  errorText: {
    fontSize: "14px",
    color: "var(--text-secondary)",
    lineHeight: "1.6",
    textAlign: "center"
  },
  errorBtnRow: {
    display: "flex",
    gap: "12px",
    marginTop: "10px",
    width: "100%"
  },
  retryBtn: {
    flex: 1,
    background: "var(--accent-color)",
    border: "none",
    borderRadius: "10px",
    color: "#fff",
    height: "44px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px"
  },
  cancelBtn: {
    flex: 1,
    background: "rgba(255, 255, 255, 0.05)",
    border: "1px solid var(--card-border)",
    borderRadius: "10px",
    color: "var(--text-color)",
    height: "44px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer"
  },
  modalBackdrop: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "rgba(0, 0, 0, 0.6)",
    backdropFilter: "blur(4px)",
    zIndex: 9999,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px"
  },
  modalContent: {
    background: "#1e293b",
    border: "1px solid var(--card-border)",
    boxShadow: "var(--card-shadow)",
    borderRadius: "var(--border-radius)",
    width: "100%",
    maxWidth: "600px",
    maxHeight: "80vh",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden"
  },
  modalHeader: {
    padding: "18px 24px",
    borderBottom: "1px solid var(--card-border)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },
  modalTitle: {
    fontSize: "16px",
    fontWeight: "750",
    color: "var(--text-color)",
    display: "flex",
    alignItems: "center"
  },
  modalCloseBtn: {
    background: "none",
    border: "none",
    color: "var(--text-secondary)",
    fontSize: "18px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center"
  },
  modalBody: {
    padding: "24px",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "24px"
  },
  modalConvPair: {
    display: "flex",
    flexDirection: "column",
    gap: "12px"
  },
  modalBotBubble: {
    background: "rgba(15, 23, 42, 0.3)",
    border: "1px solid var(--card-border)",
    padding: "12px 16px",
    borderRadius: "0px 14px 14px 14px",
    alignSelf: "flex-start",
    maxWidth: "85%",
    display: "flex",
    flexDirection: "column",
    gap: "4px"
  },
  modalUserBubble: {
    background: "rgba(59, 130, 246, 0.15)",
    border: "1px solid rgba(59, 130, 246, 0.2)",
    padding: "12px 16px",
    borderRadius: "14px 0px 14px 14px",
    alignSelf: "flex-end",
    maxWidth: "85%",
    display: "flex",
    flexDirection: "column",
    gap: "4px"
  },
  speakerLabel: {
    fontSize: "10px",
    fontWeight: "700",
    color: "var(--text-secondary)",
    textTransform: "uppercase"
  }
};
