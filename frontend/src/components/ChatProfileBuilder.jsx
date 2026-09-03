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
  const inputRef = useRef(null);

  const [data, setData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    skills: [],
    experienceYears: null,
    location: "",
    education: ""
  });

  const questions = [
    {
      key: "name",
      q: "Hey! What’s your name? 😊",
      placeholder: "Enter your full name (max 100 chars)...",
      maxLength: 100
    },
    {
      key: "email",
      q: "Nice to meet you! What is your email address?",
      placeholder: "e.g. alex@example.com (max 254 chars)...",
      maxLength: 254
    },
    {
      key: "phoneNumber",
      q: "Awesome! Can you provide your phone number?",
      placeholder: "e.g. +1 (555) 123-4567 (max 20 chars)...",
      maxLength: 20
    },
    {
      key: "skills",
      q: "Great! List your skills (comma separated)",
      placeholder: "e.g. React, Node.js, Python, SQL (max 500 chars)...",
      maxLength: 500
    },
    {
      key: "experienceYears",
      q: "How many years of experience do you have?",
      placeholder: "e.g. 0, 2, or 3.5 (0 to 50 years)...",
      maxLength: 4
    },
    {
      key: "education",
      q: "Awesome! What is your education?",
      placeholder: "e.g. Bachelor of Science in CS (max 200 chars)...",
      maxLength: 200
    },
    {
      key: "location",
      q: "Where are you from?",
      placeholder: "e.g. New York, NY / Remote (max 100 chars)...",
      maxLength: 100
    }
  ];

  // Load prefilled data if editing profile
  useEffect(() => {
    if (prefillData) {
      setData({
        name: prefillData.name || "",
        email: prefillData.email || "",
        phoneNumber: prefillData.phoneNumber || "",
        skills: prefillData.skills || [],
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

  // Refocus input whenever step changes or bot finishes typing
  useEffect(() => {
    if (!isBotTyping) {
      inputRef.current?.focus();
    }
  }, [isBotTyping, step]);

  const addBotMessage = (msg) => {
    setMessages((prev) => [...prev, { sender: "bot", text: msg }]);
  };

  const addUserMessage = (msg) => {
    setMessages((prev) => [...prev, { sender: "user", text: msg }]);
  };

  const next = async () => {
    if (!answer.trim()) {
      toast("Please provide an answer to continue.", "warning");
      return;
    }

    const currentQ = questions[step];
    const key = currentQ.key;
    let value = answer.trim();

    // 1. Name: Max 100 characters
    if (key === "name") {
      if (value.length > 100) {
        toast("Name cannot exceed 100 characters.", "warning");
        return;
      }
    }

    // 2. Email: Max 254 chars, valid email format
    if (key === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (value.length > 254) {
        toast("Email cannot exceed 254 characters.", "warning");
        return;
      }
      if (!emailRegex.test(value)) {
        toast("Please enter a valid email address.", "warning");
        return;
      }
    }

    // 3. Phone Number: Max 20 chars, allowed chars, min 7 digits
    if (key === "phoneNumber") {
      if (value.length > 20) {
        toast("Phone number cannot exceed 20 characters.", "warning");
        return;
      }
      const phoneRegex = /^[0-9+\-\s()]{7,20}$/;
      const digitCount = value.replace(/\D/g, "").length;
      if (!phoneRegex.test(value) || digitCount < 7) {
        toast("Please enter a valid phone number (digits, +, -, spaces, () allowed, min 7 digits).", "warning");
        return;
      }
    }

    // 4. Skills: Max 500 chars, comma-separated array
    if (key === "skills") {
      if (value.length > 500) {
        toast("Skills text cannot exceed 500 characters.", "warning");
        return;
      }
      const parsedSkills = value.split(",").map((s) => s.trim()).filter(Boolean);
      if (parsedSkills.length === 0) {
        toast("Please enter at least one valid skill.", "warning");
        return;
      }
      value = parsedSkills;
    }

    // 5. Experience: Min 0, Max 50, integer or at most 1 decimal place
    if (key === "experienceYears") {
      const expFormatRegex = /^\d+(\.\d)?$/;
      const num = Number(value);
      if (!expFormatRegex.test(value) || isNaN(num) || num < 0 || num > 50) {
        toast("Experience must be a number between 0 and 50 years with at most 1 decimal place (e.g. 0, 2, or 3.5).", "warning");
        return;
      }
      value = num;
    }

    // 6. Education: Max 200 chars
    if (key === "education") {
      if (value.length > 200) {
        toast("Education cannot exceed 200 characters.", "warning");
        return;
      }
    }

    // 7. Location: Max 100 chars
    if (key === "location") {
      if (value.length > 100) {
        toast("Location cannot exceed 100 characters.", "warning");
        return;
      }
    }

    addUserMessage(Array.isArray(value) ? value.join(", ") : String(value));
    setAnswer("");

    const newData = { ...data, [key]: value };
    setData(newData);

    // Last question → submit
    if (step === questions.length - 1) {
      setStep(questions.length); // Increment step to trigger 100% complete
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

  const progressPercentage = Math.round((step / questions.length) * 100);

  const getProfileFieldDisplay = (key, val) => {
    if (val === null || val === undefined || (Array.isArray(val) ? val.length === 0 : val === "")) {
      return <span style={styles.waitingText}>Waiting...</span>;
    }
    return <span style={styles.filledText}>{Array.isArray(val) ? val.join(", ") : String(val)}</span>;
  };

  return (
    <div style={styles.container}>
      <div className="chat-two-column-grid" style={{ marginTop: "24px" }}>
        
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
                      color: m.sender === "bot" ? "var(--text-color)" : "#fff",
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
            <div style={styles.inputWrapper}>
              <input
                ref={inputRef}
                value={answer}
                maxLength={questions[Math.min(step, questions.length - 1)].maxLength}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder={questions[Math.min(step, questions.length - 1)].placeholder || `Answer: ${questions[Math.min(step, questions.length - 1)].key}...`}
                style={styles.input}
                disabled={isBotTyping}
                autoFocus
              />
              <span style={styles.charCount}>
                {answer.length}/{questions[Math.min(step, questions.length - 1)].maxLength}
              </span>
            </div>
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
              Step {Math.min(step + 1, questions.length)} of {questions.length}
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
              <span style={styles.itemLabel}>📧 Email</span>
              <div style={styles.itemValue}>{getProfileFieldDisplay("email", data.email)}</div>
            </div>

            <div style={styles.profileItem}>
              <span style={styles.itemLabel}>📞 Phone</span>
              <div style={styles.itemValue}>{getProfileFieldDisplay("phoneNumber", data.phoneNumber)}</div>
            </div>

            <div style={styles.profileItem}>
              <span style={styles.itemLabel}>💻 Skills</span>
              <div style={styles.itemValue}>{getProfileFieldDisplay("skills", data.skills)}</div>
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
                {data.experienceYears !== null && data.experienceYears !== undefined && data.experienceYears !== "" ? (
                  <span style={styles.filledText}>{data.experienceYears} Year{Number(data.experienceYears) === 1 ? "" : "s"}</span>
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
    // Replaced by .chat-two-column-grid in index.css
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
  inputWrapper: {
    flex: 1,
    position: "relative",
    display: "flex",
    alignItems: "center"
  },
  input: {
    width: "100%",
    borderRadius: "12px",
    border: "1px solid var(--card-border)",
    background: "rgba(15, 23, 42, 0.3)",
    color: "var(--text-color)",
    padding: "0 68px 0 16px",
    fontSize: "14px",
    height: "46px",
    outline: "none"
  },
  charCount: {
    position: "absolute",
    right: "12px",
    fontSize: "11px",
    color: "var(--text-secondary)",
    pointerEvents: "none",
    userSelect: "none"
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
    height: "65vh",
    minHeight: "500px",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    overflowY: "auto"
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
    lineHeight: "1.4",
    wordBreak: "break-word",
    overflowWrap: "anywhere"
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
