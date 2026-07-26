import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import API from "../api/apiClient";
import { FaRobot, FaUser } from "react-icons/fa";

export default function ChatProfileBuilder({ onComplete }) {
  const [step, setStep] = useState(0);
  const [answer, setAnswer] = useState("");
  const [messages, setMessages] = useState([]);
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

  // Auto scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // First bot question
  useEffect(() => {
    addBotMessage(questions[0].q);
  }, []);

  const addBotMessage = (msg) => {
    setMessages((prev) => [...prev, { sender: "bot", text: msg }]);
  };

  const addUserMessage = (msg) => {
    setMessages((prev) => [...prev, { sender: "user", text: msg }]);
  };

  const next = async () => {
    if (!answer.trim()) return;

    addUserMessage(answer);

    const key = questions[step].key;
    let value = answer.trim();

    if (key === "skills" || key === "interests") {
      value = value.split(",").map((s) => s.trim());
    }
    if (key === "experienceYears") {
      value = Number(value);
    }

    const newData = { ...data, [key]: value };
    setData(newData);
    setAnswer("");

    // Last question → submit
    if (step === questions.length - 1) {
      addBotMessage("Awesome! 🔍 Analyzing your profile...");

      const res = await API.post("/profile", newData);

      setTimeout(() => {
        onComplete(res.data);
      }, 1200);

      return;
    }

    // Next question
    setTimeout(() => {
      addBotMessage(questions[step + 1].q);
    }, 500);

    setStep(step + 1);
  };

  return (
    <div style={styles.page}>
      <div style={styles.chatWrapper}>
        <div style={styles.chatContainer}>
          {messages.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              style={{
                ...styles.message,
                background: m.sender === "bot" ? "#1f2937" : "#3b82f6",
                alignSelf: m.sender === "bot" ? "flex-start" : "flex-end"
              }}
            >
              <div style={styles.avatar}>
                {m.sender === "bot" ? <FaRobot /> : <FaUser />}
              </div>
              <span>{m.text}</span>
            </motion.div>
          ))}

          <div ref={chatEndRef} />
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            next();
          }}
          style={styles.inputBox}
        >
          <input
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Type your answer..."
            style={styles.input}
          />
          <button type="submit" style={styles.button} disabled={!answer.trim()}>
            Send
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  page: {
    height: "100vh",
    width: "100%",
    background: "linear-gradient(to bottom right, #0f172a, #1e293b)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    color: "white"
  },

  chatWrapper: {
    width: "100%",
    maxWidth: "600px",
    height: "85vh",
    background: "rgba(255,255,255,0.06)",
    backdropFilter: "blur(10px)",
    borderRadius: "20px",
    padding: 20,
    display: "flex",
    flexDirection: "column",
    border: "1px solid rgba(255,255,255,0.2)"
  },

  chatContainer: {
    flex: 1,
    overflowY: "auto",
    paddingRight: 5,
    display: "flex",
    flexDirection: "column",
    gap: 12
  },

  message: {
    display: "flex",
    gap: 10,
    padding: "12px 16px",
    borderRadius: 16,
    maxWidth: "75%",
    color: "white",
    fontSize: 15,
    boxShadow: "0 4px 10px rgba(0,0,0,0.2)"
  },

  avatar: {
    fontSize: 20
  },

  inputBox: {
    display: "flex",
    gap: 10,
    marginTop: 12
  },

  input: {
    flex: 1,
    padding: "12px 14px",
    borderRadius: 12,
    border: "none",
    outline: "none",
    background: "rgba(255,255,255,0.15)",
    color: "white"
  },

  button: {
    padding: "12px 18px",
    background: "#3b82f6",
    color: "white",
    border: "none",
    borderRadius: 12,
    cursor: "pointer",
    fontWeight: 500
  }
};
