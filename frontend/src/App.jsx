import { useState } from "react";
import API from "./api/apiClient";
import ChatProfileBuilder from "./components/ChatProfileBuilder";

export default function App() {
  const [profile, setProfile] = useState(null);
  const [result, setResult] = useState(null);

  const onComplete = async (p) => {
    setProfile(p);

    const res = await API.post("/match", p);   // send full profile
    setResult(res.data);
  };

  if (!profile) {
    return <ChatProfileBuilder onComplete={onComplete} />;
  }

  return (
    <div style={styles.page}>
      <div style={styles.centerWrapper}>
        <div style={styles.resultsContainer}>

          {/* ------------------------ */}
          {/*          TITLE          */}
          {/* ------------------------ */}
          <h1 style={styles.heading}>JobGenie Results</h1>

          {/* ------------------------ */}
          {/*      AI SUMMARY BOX     */}
          {/* ------------------------ */}
          {result?.ai && (
            <div style={styles.aiBox}>
              <h2 style={styles.sectionTitle}>Career Summary</h2>
              <p>{result.ai.summary}</p>

              <h2 style={styles.sectionTitle}>Suggested Roles</h2>
              <ul>
                {result.ai.suggestedRoles.map((r, i) => (
                  <li key={i}>
                    <strong>{r.title}:</strong> {r.reason}
                  </li>
                ))}
              </ul>

              <h2 style={styles.sectionTitle}>Learning Roadmap</h2>
              <ul>
                {result.ai.learningRoadmap.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ul>
            </div>
          )}

          {/* ------------------------ */}
          {/*     BEST ROLE MATCHES    */}
          {/* ------------------------ */}
          <h2 style={styles.sectionTitle2}>Best Role Matches</h2>

          <div style={styles.cardGrid}>
            {result?.matches?.map((m, idx) => (
              <div key={idx} style={styles.card}>
                <h3 style={styles.cardTitle}>{m.role.title}</h3>
                <p style={styles.score}>Score: {m.score}%</p>
                <p style={styles.description}>{m.role.description}</p>

                {/* Jobs Section */}
                <p style={{ marginTop: 10, opacity: 0.8 }}>Jobs:</p>
                <ul>
                  {m.jobs?.map((j, i) => (
                    <li key={i}>
                      {j.title} — {j.company}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    width: "100%",
    minHeight: "100vh",
    background: "linear-gradient(to bottom right, #0f172a, #1e293b)",
    padding: "50px 20px",
    display: "flex",
    justifyContent: "center",   // CENTER CONTENT
    alignItems: "flex-start",
    color: "white",
  },

  resultsContainer: {
    width: "100%",
    maxWidth: "900px",
    margin: "0 auto",
    textAlign: "center",         // CENTER ALL TEXT
    background: "rgba(255,255,255,0.04)",
    borderRadius: "16px",
    padding: "35px",
    border: "1px solid rgba(255,255,255,0.1)",
    boxShadow: "0 8px 20px rgba(0,0,0,0.3)",
  },

  heading: {
    fontSize: "32px",
    fontWeight: "700",
    marginBottom: "25px",
  },

  aiBox: {
    background: "rgba(255,255,255,0.06)",
    padding: "25px",
    borderRadius: "12px",
    marginBottom: "30px",
    textAlign: "center",
  },

  sectionTitle: {
    fontSize: "22px",
    fontWeight: "600",
    marginTop: "20px",
    marginBottom: "8px",
  },

  sectionTitle2: {
    fontSize: "26px",
    fontWeight: "700",
    marginTop: "25px",
    marginBottom: "20px",
  },

  cardGrid: {
    marginTop: "20px",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: "20px",
  },

  card: {
    padding: "20px",
    borderRadius: "12px",
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.1)",
  },

  cardTitle: {
    fontSize: "20px",
    fontWeight: "600",
    marginBottom: "8px",
  },

  score: {
    fontSize: "15px",
    opacity: 0.9,
    marginBottom: "10px",
  },

  description: {
    opacity: 0.8,
    fontSize: "14px",
  },
};
