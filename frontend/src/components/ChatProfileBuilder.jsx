import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaRobot, FaUser, FaArrowLeft, FaPaperPlane } from "react-icons/fa";
import { toast } from "./ToastContainer";

export default function ChatProfileBuilder({ onComplete, prefillData }) {
  const [step, setStep] = useState(0);
  const [answer, setAnswer] = useState("");
  const [messages, setMessages] = useState([]);
  const [isBotTyping, setIsBotTyping] = useState(false);
  const chatEndRef = useRef(null);

  const [data, setData] = useState({
    name: "",
    skills: [],
    interests: [],
    experienceYears: 0,
    location: "",
    education: ""
  });

  const questions = [
    { key: "name", q: "Hey! What’s your name? 😊" },
    { key: "skills", q: "Nice to meet you! List your skills (comma separated)" },
    { key: "interests", q: "Great! What are your interests? (comma separated)" },
    { key: "experienceYears", q: "How many years of experience do you have?" },
    { key: "location", q: "Where are you from?" },
    { key: "education", q: "Awesome! What is your education?" }
  ];

  // Load prefilled data if editing profile
  useEffect(() => {
    if (prefillData) {
      setData({
        name: prefillData.name || "",
        skills: prefillData.skills || [],
        interests: prefillData.interests || [],
        experienceYears: prefillData.experienceYears || 0,
        location: prefillData.location || "",
        education: prefillData.education || ""
      });

      // Construct prefilled messages history
      const history = [];
      questions.forEach((q, index) => {
        history.push({ sender: "bot", text: q.q });
        
        let val = prefillData[q.key];
        if (val !== undefined && val !== "" && (Array.isArray(val) ? val.length > 0 : true)) {
          if (Array.isArray(val)) {
            val = val.join(", ");
          }
          history.push({ sender: "user", text: String(val) });
        }
      });

      // If we have fully prefilled data, we are at the last step reviewing or starting at 0
      // Let's set step to 0 but preload input value
      setMessages([{ sender: "bot", text: questions[0].q }]);
      const firstVal = prefillData[questions[0].key];
      setAnswer(firstVal ? String(firstVal) : "");
      toast("Profile loaded. Press Enter to step through and edit.", "info");
    } else {
      // First bot question
      setMessages([{ sender: "bot", text: questions[0].q }]);
    }
  }, [prefillData]);

  // Set input value to prefilled data on step changes
  useEffect(() => {
    if (prefillData && step > 0 && step < questions.length) {
      const val = data[questions[step].key];
      if (val !== undefined && val !== "") {
        setAnswer(Array.isArray(val) ? val.join(", ") : String(val));
      } else {
        setAnswer("");
      }
    }
  }, [step]);

  // Auto scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isBotTyping]);

  const addBotMessage = (msg) => {
    setMessages((prev) => [...prev, { sender: "bot", text: msg }]);
  };

  const addUserMessage = (msg) => {
    setMessages((prev) => [...prev, { sender: "user", text: msg }]);
  };

  const next = async () => {
    if (!answer.trim()) return;

    const key = questions[step].key;
    let value = answer.trim();

    addUserMessage(value);
    setAnswer("");

    if (key === "skills" || key === "interests") {
      value = value.split(",").map((s) => s.trim()).filter(Boolean);
    }
    if (key === "experienceYears") {
      value = Number(value) || 0;
    }

    const newData = { ...data, [key]: value };
    setData(newData);

    // Last question → submit
    if (step === questions.length - 1) {
      setIsBotTyping(true);
      setTimeout(() => {
        setIsBotTyping(false);
        onComplete(newData);
      }, 1000);
      return;
    }

    // Bot typing delay for next question
    setIsBotTyping(true);
    setTimeout(() => {
      setIsBotTyping(false);
      addBotMessage(questions[step + 1].q);
      setStep((s) => s + 1);
    }, 600);
  };

  const handleBack = () => {
    if (step === 0) return;

    // Reset step
    const prevStep = step - 1;
    setStep(prevStep);

    // Slice history to remove the last user answer and last bot question
    setMessages((prev) => prev.slice(0, -2));

    // Prefill the input box with the previous answer value
    const prevKey = questions[prevStep].key;
    const prevVal = data[prevKey];
    if (prevVal !== undefined && prevVal !== "") {
      setAnswer(Array.isArray(prevVal) ? prevVal.join(", ") : String(prevVal));
    } else {
      setAnswer("");
    }
    toast(`Returned to step: ${questions[prevStep].key}`, "info");
  };

  const progressPercentage = Math.round(((step + 1) / questions.length) * 100);

  const getProfileFieldDisplay = (key, val) => {
    if (Array.isArray(val) ? val.length === 0 : !val) {
      return <span style={styles.waitingText}>Waiting...</span>;
    }
    return <span style={styles.filledText}>{Array.isArray(val) ? val.join(", ") : String(val)}</span>;
  };

  return (
    <div style={styles.container}>
      <div style={styles.twoColumnGrid}>
        
        {/* Left Column: Conversational Chat */}
        <div style={styles.chatPanel}>
          <div style={styles.chatHeader}>
            <div style={styles.botIconWrapper}>
              <FaRobot />
            </div>
            <div>
              <h2 style={styles.chatTitle}>JobGenie Career Assistant</h2>
              <span style={styles.chatStatus}>AI Agent Online</span>
            </div>
          </div>

          <div style={styles.chatMessageArea} className="chat-scrollbar">
            <AnimatePresence initial={false}>
              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 15, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  style={{
                    ...styles.messageRow,
                    justifyContent: m.sender === "bot" ? "flex-start" : "flex-end"
                  }}
                >
                  {m.sender === "bot" && (
                    <div style={styles.avatarBot}>
                      <FaRobot />
                    </div>
                  )}
                  <div
                    style={{
                      ...styles.messageBubble,
                      background: m.sender === "bot" ? "var(--card-bg)" : "var(--accent-color)",
                      border: m.sender === "bot" ? "1px solid var(--card-border)" : "none",
                      color: "#fff",
                      borderRadius: m.sender === "bot" ? "0px 16px 16px 16px" : "16px 0px 16px 16px"
                    }}
                  >
                    <span>{m.text}</span>
                  </div>
                  {m.sender === "user" && (
                    <div style={styles.avatarUser}>
                      <FaUser />
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {isBotTyping && (
              <div style={{ ...styles.messageRow, justifyContent: "flex-start" }}>
                <div style={styles.avatarBot}>
                  <FaRobot />
                </div>
                <div style={styles.typingBubble}>
                  <span style={styles.typingText}>🤖 AI is typing</span>
                  <div style={styles.dots}>
                    <span style={styles.dot}>.</span>
                    <span style={styles.dot}>.</span>
                    <span style={styles.dot}>.</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Form Input Area */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              next();
            }}
            style={styles.inputArea}
          >
            {step > 0 && (
              <button
                type="button"
                onClick={handleBack}
                style={styles.backBtn}
                title="Go back to previous question"
                aria-label="Back"
              >
                <FaArrowLeft />
              </button>
            )}
            <input
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder={`Answer: ${questions[step].key}...`}
              style={styles.input}
              disabled={isBotTyping}
              autoFocus
            />
            <button
              type="submit"
              style={{
                ...styles.sendBtn,
                background: answer.trim() ? "var(--accent-color)" : "rgba(255,255,255,0.05)",
                color: answer.trim() ? "#fff" : "var(--text-secondary)",
                cursor: answer.trim() ? "pointer" : "not-allowed"
              }}
              disabled={!answer.trim() || isBotTyping}
            >
              <FaPaperPlane />
            </button>
          </form>
        </div>

        {/* Right Column: Live Profile Panel */}
        <div style={styles.profilePanel}>
          <div style={styles.panelHeader}>
            <h3 style={styles.panelTitle}>Live Profile Card</h3>
            <span style={styles.stepIndicator}>
              Step {step + 1} of {questions.length}
            </span>
          </div>

          {/* Completion Progress Bar */}
          <div style={styles.progressContainer}>
            <div style={styles.progressBarWrapper}>
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                style={styles.progressBar}
              />
            </div>
            <span style={styles.progressLabel}>{progressPercentage}% Complete</span>
          </div>

          <div style={styles.profileItems}>
            <div style={styles.profileItem}>
              <span style={styles.itemLabel}>👤 Name</span>
              <div style={styles.itemValue}>{getProfileFieldDisplay("name", data.name)}</div>
            </div>
            
            <div style={styles.profileItem}>
              <span style={styles.itemLabel}>💻 Skills</span>
              <div style={styles.itemValue}>{getProfileFieldDisplay("skills", data.skills)}</div>
            </div>

            <div style={styles.profileItem}>
              <span style={styles.itemLabel}>❤️ Interests</span>
              <div style={styles.itemValue}>{getProfileFieldDisplay("interests", data.interests)}</div>
            </div>

            <div style={styles.profileItem}>
              <span style={styles.itemLabel}>🎓 Education</span>
              <div style={styles.itemValue}>{getProfileFieldDisplay("education", data.education)}</div>
            </div>

            <div style={styles.profileItem}>
              <span style={styles.itemLabel}>📍 Location</span>
              <div style={styles.itemValue}>{getProfileFieldDisplay("location", data.location)}</div>
            </div>

            <div style={styles.profileItem}>
              <span style={styles.itemLabel}>🧑‍💼 Experience</span>
              <div style={styles.itemValue}>
                {data.experienceYears > 0 ? (
                  <span style={styles.filledText}>{data.experienceYears} Years</span>
                ) : (
                  <span style={styles.waitingText}>Waiting...</span>
                )}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "30px 24px",
    width: "100%",
    minHeight: "calc(100vh - 128px)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center"
  },
  twoColumnGrid: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: "24px",
    width: "100%",
    // Responsive layout handled by JS/CSS breakpoints (min-width logic)
    "@media (min-width: 992px)": {
      gridTemplateColumns: "1.4fr 1fr"
    }
  },
  chatPanel: {
    background: "var(--card-bg)",
    backdropFilter: "blur(12px)",
    border: "1px solid var(--card-border)",
    borderRadius: "var(--border-radius)",
    boxShadow: "var(--card-shadow)",
    height: "65vh",
    minHeight: "500px",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden"
  },
  chatHeader: {
    padding: "16px 20px",
    borderBottom: "1px solid var(--card-border)",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    background: "rgba(15, 23, 42, 0.2)"
  },
  botIconWrapper: {
    width: "38px",
    height: "38px",
    borderRadius: "50%",
    background: "rgba(59, 130, 246, 0.15)",
    color: "var(--accent-color)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "18px"
  },
  chatTitle: {
    fontSize: "15px",
    fontWeight: "700",
    color: "var(--text-color)"
  },
  chatStatus: {
    fontSize: "11px",
    color: "var(--success-color)",
    fontWeight: "600",
    display: "flex",
    alignItems: "center",
    gap: "4px"
  },
  chatMessageArea: {
    flex: 1,
    padding: "20px",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "16px"
  },
  messageRow: {
    display: "flex",
    gap: "10px",
    alignItems: "flex-end",
    maxWidth: "85%"
  },
  avatarBot: {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    background: "var(--card-border)",
    color: "var(--text-secondary)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "14px",
    flexShrink: 0
  },
  avatarUser: {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    background: "rgba(59, 130, 246, 0.2)",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "14px",
    flexShrink: 0
  },
  messageBubble: {
    padding: "12px 18px",
    fontSize: "14px",
    lineHeight: "1.5",
    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
    wordBreak: "break-word"
  },
  typingBubble: {
    padding: "12px 18px",
    background: "var(--card-bg)",
    border: "1px solid var(--card-border)",
    borderRadius: "0px 16px 16px 16px",
    fontSize: "14px",
    display: "flex",
    alignItems: "center",
    gap: "4px"
  },
  typingText: {
    color: "var(--text-secondary)"
  },
  dots: {
    display: "flex",
    gap: "2px"
  },
  dot: {
    color: "var(--accent-color)",
    animation: "skeleton-pulse 1s infinite alternate"
  },
  inputArea: {
    padding: "16px 20px",
    borderTop: "1px solid var(--card-border)",
    display: "flex",
    gap: "10px",
    background: "rgba(15, 23, 42, 0.2)"
  },
  backBtn: {
    width: "46px",
    height: "46px",
    borderRadius: "12px",
    background: "rgba(255, 255, 255, 0.05)",
    border: "1px solid var(--card-border)",
    color: "var(--text-color)",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "16px",
    transition: "background var(--transition-speed)"
  },
  input: {
    flex: 1,
    borderRadius: "12px",
    border: "1px solid var(--card-border)",
    background: "rgba(15, 23, 42, 0.3)",
    color: "var(--text-color)",
    padding: "0 16px",
    fontSize: "14px",
    height: "46px",
    outline: "none"
  },
  sendBtn: {
    width: "46px",
    height: "46px",
    borderRadius: "12px",
    border: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "16px",
    transition: "background var(--transition-speed), transform var(--transition-speed)"
  },
  profilePanel: {
    background: "var(--card-bg)",
    backdropFilter: "blur(12px)",
    border: "1px solid var(--card-border)",
    borderRadius: "var(--border-radius)",
    boxShadow: "var(--card-shadow)",
    padding: "24px",
    display: "flex",
    flexDirection: "column",
    gap: "20px"
  },
  panelHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },
  panelTitle: {
    fontSize: "16px",
    fontWeight: "700",
    color: "var(--text-color)"
  },
  stepIndicator: {
    fontSize: "12px",
    color: "var(--text-secondary)",
    fontWeight: "600"
  },
  progressContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    background: "rgba(15, 23, 42, 0.2)",
    padding: "16px",
    borderRadius: "12px",
    border: "1px solid var(--card-border)"
  },
  progressBarWrapper: {
    height: "6px",
    width: "100%",
    background: "var(--card-border)",
    borderRadius: "3px",
    overflow: "hidden"
  },
  progressBar: {
    height: "100%",
    background: "linear-gradient(90deg, var(--accent-color) 0%, #a855f7 100%)",
    borderRadius: "3px"
  },
  progressLabel: {
    fontSize: "11px",
    fontWeight: "600",
    color: "var(--text-secondary)",
    textAlign: "right"
  },
  profileItems: {
    display: "flex",
    flexDirection: "column",
    gap: "14px"
  },
  profileItem: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    borderBottom: "1px solid rgba(255, 255, 255, 0.04)",
    paddingBottom: "10px"
  },
  itemLabel: {
    fontSize: "12px",
    fontWeight: "600",
    color: "var(--text-secondary)"
  },
  itemValue: {
    fontSize: "14px",
    fontWeight: "500",
    lineHeight: "1.4"
  },
  waitingText: {
    color: "var(--text-secondary)",
    opacity: 0.5,
    fontStyle: "italic"
  },
  filledText: {
    color: "var(--text-color)"
  }
};
