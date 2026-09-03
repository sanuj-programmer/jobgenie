import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FaSearch, FaFilter, FaCompass, FaChevronRight, 
  FaInfoCircle, FaUndo, FaComments, FaBriefcase, FaListUl, 
  FaGraduationCap, FaNetworkWired, FaCheckCircle, FaExclamationTriangle,
  FaRobot
} from "react-icons/fa";

export default function ResultsDashboard({ 
  result, 
  profile, 
  onEditProfile, 
  onRestart, 
  onViewConversation,
  isLoading
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedExp, setSelectedExp] = useState("all");
  const [selectedType, setSelectedType] = useState("all");

  // Format date
  const dateString = useMemo(() => {
    return new Date().toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric"
    });
  }, []);

  // Filter matches client-side
  const filteredMatches = useMemo(() => {
    if (!result?.matches) return [];
    return result.matches.filter((m) => {
      const matchesSearch = m.role.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        m.role.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const roleExp = m.role.minExperience !== undefined ? m.role.minExperience : 0;
      let matchesExp = true;
      if (selectedExp === "entry") matchesExp = roleExp === 0;
      if (selectedExp === "mid") matchesExp = roleExp === 1;
      if (selectedExp === "senior") matchesExp = roleExp > 1;

      let matchesType = true;
      if (selectedType === "remote") {
        matchesType = m.jobs?.some(j => j.location.toLowerCase().includes("remote") || j.snippet?.toLowerCase().includes("remote")) || true;
      }

      return matchesSearch && matchesExp && matchesType;
    });
  }, [result, searchTerm, selectedExp, selectedType]);

  // Statistics counters
  const stats = useMemo(() => {
    if (!result?.matches) return { maxScore: 0, rolesCount: 0, jobsCount: 0, skillsCount: 0 };
    const maxScore = result.matches[0]?.score || 0;
    const rolesCount = result.matches.length;
    const jobsCount = result.matches.reduce((acc, curr) => acc + (curr.jobs?.length || 0), 0);
    const skillsCount = profile?.skills?.length || 0;
    return { maxScore, rolesCount, jobsCount, skillsCount };
  }, [result, profile]);

  // Dynamic AI insights generator based on matches and profile
  const aiInsights = useMemo(() => {
    if (!result?.matches || !profile) return [];
    
    const strongestMatch = result.matches[0];
    const topRole = strongestMatch?.role?.title || "N/A";
    const userSkills = profile.skills.map(s => s.toLowerCase());
    
    const insights = [
      `Your strongest fit is in ${topRole} paths, scoring a solid ${strongestMatch?.score || 0}% match.`,
      `You possess strong foundational capabilities in ${profile.skills.slice(0, 3).join(", ")}.`,
    ];

    if (strongestMatch?.gaps?.length > 0) {
      insights.push(
        `Learning ${strongestMatch.gaps.slice(0, 2).join(" and ")} would bridge critical gaps and increase your score by up to 15%.`
      );
    } else {
      insights.push("You possess 100% of the baseline skills suggested for your top role!");
    }

    if (profile.experienceYears === 0) {
      insights.push("Since you are starting fresh, we recommend seeking entry-level internships or open-source projects first.");
    } else {
      insights.push(`Your ${profile.experienceYears} year(s) of experience provides a competitive edge in fast-paced teams.`);
    }

    return insights;
  }, [result, profile]);

  // Check if JSearch returned mock fallback data
  const isMockJobsFallback = useMemo(() => {
    if (!result?.matches) return false;
    return result.matches.some(m => 
      m.jobs?.some(j => j.id?.startsWith("mock-fallback") || j.snippet?.toLowerCase().includes("mock job"))
    );
  }, [result]);

  const [selectedRoleForDrawer, setSelectedRoleForDrawer] = useState(null);

  // Initial Avatar generator
  const getAvatarInitials = (companyName) => {
    if (!companyName) return "?";
    return companyName.trim().charAt(0).toUpperCase();
  };

  const getAvatarBg = (companyName) => {
    const code = (companyName || "").charCodeAt(0) || 65;
    const hue = (code * 17) % 360;
    return `hsl(${hue}, 70%, 40%)`;
  };

  // Render Skeleton Placeholders
  if (isLoading) {
    return (
      <div style={styles.container}>
        <div style={styles.skeletonHeader} className="skeleton" />
        <div style={styles.skeletonStatsGrid}>
          {[1, 2, 3, 4].map(i => (
            <div key={i} style={styles.skeletonStatCard} className="skeleton" />
          ))}
        </div>
        <div style={styles.skeletonSummary} className="skeleton" />
        <div className="two-column-grid" style={{ marginTop: "24px" }}>
          <div style={styles.skeletonRoadmap} className="skeleton" />
          <div style={styles.skeletonCardsGrid}>
            {[1, 2, 3].map(i => (
              <div key={i} style={styles.skeletonCard} className="skeleton" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      
      {/* Fallback Banner */}
      {isMockJobsFallback && (
        <div style={styles.banner}>
          <FaExclamationTriangle style={{ color: "var(--warning-color)", fontSize: "16px" }} />
          <span>Live jobs currently unavailable due to search provider rate limits. Showing sample opportunities instead.</span>
        </div>
      )}

      {/* Header Row */}
      <div style={styles.header}>
        <div>
          <span style={styles.dateLabel}>{dateString}</span>
          <h1 style={styles.greetingTitle} className="word-break-all">Hello, {profile?.name || "User"} 👋</h1>
          <p style={styles.greetingSubtitle}>Here's your personalized career analysis.</p>
        </div>
        
        <div style={styles.headerActions} className="header-actions">
          <button onClick={onViewConversation} style={styles.actionBtn} title="View Conversation Log">
            <FaComments /> View Conversation
          </button>
          <button onClick={onEditProfile} style={styles.actionBtn} title="Prefill questionnaire and edit info">
            Edit Profile
          </button>
          <button onClick={onRestart} style={styles.restartBtn} title="Restart from beginning">
            <FaUndo /> Start New Analysis
          </button>
        </div>
      </div>

      {/* Overview Statistics Panel */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <span style={styles.statLabel}>Best Match</span>
          <span style={styles.statValue}>{stats.maxScore}%</span>
          <div style={styles.progressBarTrack}>
            <div style={{ ...styles.progressBarFill, width: `${stats.maxScore}%` }} />
          </div>
        </div>
        <div style={styles.statCard}>
          <span style={styles.statLabel}>Suggested Roles</span>
          <span style={styles.statValue}>{stats.rolesCount}</span>
          <span style={styles.statSubText}>Calculated from DB</span>
        </div>
        <div style={styles.statCard}>
          <span style={styles.statLabel}>Jobs Found</span>
          <span style={styles.statValue}>{stats.jobsCount}</span>
          <span style={styles.statSubText}>Live listings matches</span>
        </div>
        <div style={styles.statCard}>
          <span style={styles.statLabel}>Skills Identified</span>
          <span style={styles.statValue}>{stats.skillsCount}</span>
          <span style={styles.statSubText}>In your profile</span>
        </div>
      </div>

      {/* Top Section: AI Insights & Summary */}
      <div style={styles.insightsCard}>
        <div style={styles.cardHeader}>
          <h2 style={styles.cardTitle}>
            <FaRobot style={{ color: "var(--accent-color)", marginRight: "10px" }} /> AI Profile Summary & Insights
          </h2>
          <span style={styles.completeBadge}>✓ Analysis Complete</span>
        </div>
        <div style={styles.insightsBody}>
          <p style={styles.aiSummary}>{result?.ai?.summary || "No AI summary returned from backend."}</p>
          
          <div style={styles.insightsDivider} />
          
          <h3 style={styles.insightsTitle}>💡 Actionable Insights</h3>
          <ul style={styles.insightsList}>
            {aiInsights.map((insight, idx) => (
              <li key={idx} style={styles.insightItem}>
                <div style={styles.bulletPoint} />
                <span className="word-break-all">{insight}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Center Grid: Left (Roadmaps) - Right (Matches) */}
      <div className="two-column-grid">
        
        {/* Suggested Timeline Roadmap */}
        <div style={styles.roadmapPanel}>
          <h2 style={styles.panelTitle}>
            <FaGraduationCap style={{ marginRight: "8px", color: "var(--accent-color)" }} />
            Suggested Learning Roadmap
          </h2>
          {result?.ai?.learningRoadmap && result.ai.learningRoadmap.length > 0 ? (
            <div style={styles.timeline}>
              {result.ai.learningRoadmap.map((step, idx) => (
                <div key={idx} style={styles.timelineItem}>
                  <div style={styles.timelineConnector}>
                    <div style={styles.timelineDot}>{idx + 1}</div>
                    {idx < result.ai.learningRoadmap.length - 1 && <div style={styles.timelineLine} />}
                  </div>
                  <div style={styles.timelineContent}>
                    <h4 style={styles.timelineStepTitle}>Week {idx + 1} Priority</h4>
                    <p style={styles.timelineStepText}>{step}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={styles.emptyText}>No customized roadmap generated.</p>
          )}
        </div>

        {/* Roles & Jobs Lists */}
        <div style={styles.rolesPanel}>
          
          {/* Filters Bar */}
          <div style={styles.filtersBar}>
            <div style={styles.searchWrapper}>
              <FaSearch style={styles.searchIcon} />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search roles..."
                style={styles.searchInput}
              />
            </div>
            
            <div style={styles.filterGroups}>
              <div style={styles.filterWrapper}>
                <FaFilter style={styles.filterIcon} />
                <select
                  value={selectedExp}
                  onChange={(e) => setSelectedExp(e.target.value)}
                  style={styles.filterSelect}
                >
                  <option value="all">Experience (All)</option>
                  <option value="entry">Entry Level (0 yrs)</option>
                  <option value="mid">Mid Level (1 yr)</option>
                  <option value="senior">Senior (2+ yrs)</option>
                </select>
              </div>

              <div style={styles.filterWrapper}>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  style={styles.filterSelect}
                >
                  <option value="all">Job Types (All)</option>
                  <option value="remote">Remote-focused</option>
                </select>
              </div>
            </div>
          </div>

          {/* Role Matches Cards */}
          <h2 style={styles.panelTitle}>Suggested Career Matches ({filteredMatches.length})</h2>
          
          <div style={styles.matchesList}>
            {filteredMatches.length > 0 ? (
              filteredMatches.map((m, idx) => (
                <div key={idx} style={styles.matchCard} className="hover-lift">
                  <div style={styles.matchCardHeader}>
                    <div>
                      <h3 style={styles.matchRoleTitle}>{m.role.title}</h3>
                      <p style={styles.matchRoleDesc}>{m.role.description}</p>
                    </div>
                    <div style={styles.matchScoreBadgeRow}>
                      <span style={styles.matchScoreText}>{m.score}% Match</span>
                      <div style={styles.matchScoreBarTrack}>
                        <div 
                          style={{ 
                            ...styles.matchScoreBarFill, 
                            width: `${m.score}%`,
                            background: m.score >= 70 ? "var(--success-color)" : "var(--accent-color)"
                          }} 
                        />
                      </div>
                    </div>
                  </div>

                  {/* Skills Grid */}
                  <div style={styles.matchCardBody}>
                    <div style={styles.skillsTagRow}>
                      <span style={styles.tagGroupLabel}>Matched Skills:</span>
                      <div style={styles.chipsGrid}>
                        {(m.role.keySkills || m.role.requiredSkills || []).map((skill, sIdx) => {
                          const isMissing = m.gaps?.some(g => g.toLowerCase() === skill.toLowerCase());
                          if (isMissing) return null;
                          return (
                            <span key={sIdx} style={styles.matchChip}>
                              ✓ {skill.toUpperCase()}
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    {m.gaps && m.gaps.length > 0 && (
                      <div style={styles.skillsTagRow}>
                        <span style={styles.tagGroupLabel}>Missing:</span>
                        <div style={styles.chipsGrid}>
                          {m.gaps.map((gap, gIdx) => (
                            <span key={gIdx} style={styles.gapChip}>
                              ⚠ {gap.toUpperCase()}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Openings Count and View Button */}
                  <div style={styles.matchCardFooter}>
                    <span style={styles.jobsCountLabel}>
                      💼 {m.jobs?.length || 0} job opportunity{(m.jobs?.length || 0) !== 1 ? "s" : ""} found
                    </span>
                    <button 
                      onClick={() => setSelectedRoleForDrawer(m)}
                      style={styles.detailsBtn}
                    >
                      View Details <FaChevronRight style={{ marginLeft: "6px", fontSize: "11px" }} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div style={styles.emptyState}>
                <span style={styles.emptyIllustration}>🔍</span>
                <h3>No careers found</h3>
                <p>Try refining your search terms or adjustments.</p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Global Recommended Jobs List */}
      <div style={styles.globalJobsSection}>
        <h2 style={styles.panelTitle}>Recommended Live Openings</h2>
        <div style={styles.jobsGrid}>
          {filteredMatches.flatMap(m => m.jobs || []).slice(0, 6).map((job, idx) => (
            <div key={idx} style={styles.jobCard} className="hover-lift">
              <div style={styles.jobCardHeader}>
                <div 
                  style={{ 
                    ...styles.companyAvatar, 
                    background: getAvatarBg(job.company) 
                  }}
                >
                  {getAvatarInitials(job.company)}
                </div>
                <div>
                  <h4 style={styles.jobTitleText}>{job.title}</h4>
                  <span style={styles.companyText}>{job.company}</span>
                </div>
              </div>
              
              <div style={styles.jobMetaRow}>
                <span style={styles.metaBadge}>{job.location || "Remote"}</span>
                <span style={styles.metaBadge}>Full Time</span>
                <span style={styles.salaryBadge}>Salary Not Available</span>
              </div>

              <p style={styles.jobSnippet}>{job.snippet || "Explore this job posting for further details."}</p>

              <a 
                href={job.url} 
                target="_blank" 
                rel="noopener noreferrer" 
                style={styles.jobApplyLink}
              >
                Open Original Job
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* Role Details Side Drawer */}
      {selectedRoleForDrawer && (
        <div 
          onClick={() => setSelectedRoleForDrawer(null)}
          style={{ cursor: "pointer" }}
        >
          {/* Lazy integration drawer trigger */}
          <RoleDetailDrawerWrapper 
            isOpen={!!selectedRoleForDrawer}
            onClose={() => setSelectedRoleForDrawer(null)}
            match={selectedRoleForDrawer}
          />
        </div>
      )}

    </div>
  );
}

// Simple lazy-load proxy component for RoleDetailDrawer
function RoleDetailDrawerWrapper({ isOpen, onClose, match }) {
  const [DrawerComp, setDrawerComp] = useState(null);

  React.useEffect(() => {
    import("./RoleDetailDrawer").then((mod) => {
      setDrawerComp(() => mod.default);
    });
  }, []);

  if (!DrawerComp) return null;
  return <DrawerComp isOpen={isOpen} onClose={onClose} match={match} />;
}

const styles = {
  container: {
    maxWidth: "1400px",
    margin: "0 auto",
    padding: "30px 24px 80px 24px",
    width: "100%",
    minHeight: "calc(100vh - 128px)",
    display: "flex",
    flexDirection: "column",
    gap: "30px"
  },
  banner: {
    background: "rgba(245, 158, 11, 0.08)",
    border: "1px solid var(--warning-color)",
    borderRadius: "12px",
    padding: "12px 18px",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    color: "var(--text-color)",
    fontSize: "13px",
    lineHeight: "1.4"
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    flexWrap: "wrap",
    gap: "20px"
  },
  dateLabel: {
    fontSize: "12px",
    color: "var(--text-secondary)",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: "0.5px"
  },
  greetingTitle: {
    fontSize: "28px",
    fontWeight: "850",
    letterSpacing: "-0.5px",
    color: "var(--text-color)",
    marginTop: "4px"
  },
  greetingSubtitle: {
    fontSize: "14px",
    color: "var(--text-secondary)"
  },
  headerActions: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap"
  },
  actionBtn: {
    background: "rgba(255, 255, 255, 0.05)",
    border: "1px solid var(--card-border)",
    borderRadius: "10px",
    color: "var(--text-color)",
    padding: "10px 16px",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    transition: "background var(--transition-speed)"
  },
  restartBtn: {
    background: "var(--accent-color)",
    border: "none",
    borderRadius: "10px",
    color: "#fff",
    padding: "10px 16px",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    transition: "background var(--transition-speed)"
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))",
    gap: "20px"
  },
  statCard: {
    background: "var(--card-bg)",
    backdropFilter: "blur(12px)",
    border: "1px solid var(--card-border)",
    boxShadow: "var(--card-shadow)",
    borderRadius: "var(--border-radius)",
    padding: "20px 24px",
    display: "flex",
    flexDirection: "column",
    gap: "6px"
  },
  statLabel: {
    fontSize: "12px",
    color: "var(--text-secondary)",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: "0.5px"
  },
  statValue: {
    fontSize: "28px",
    fontWeight: "800",
    color: "var(--text-color)"
  },
  statSubText: {
    fontSize: "11px",
    color: "var(--text-secondary)",
    opacity: 0.7
  },
  progressBarTrack: {
    height: "4px",
    background: "var(--card-border)",
    borderRadius: "2px",
    width: "100%",
    marginTop: "4px",
    overflow: "hidden"
  },
  progressBarFill: {
    height: "100%",
    background: "var(--accent-color)",
    borderRadius: "2px"
  },
  insightsCard: {
    background: "var(--card-bg)",
    backdropFilter: "blur(12px)",
    border: "1px solid var(--card-border)",
    boxShadow: "var(--card-shadow)",
    borderRadius: "var(--border-radius)",
    padding: "24px"
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "1px solid var(--card-border)",
    paddingBottom: "14px",
    marginBottom: "16px"
  },
  cardTitle: {
    fontSize: "16px",
    fontWeight: "750",
    color: "var(--text-color)",
    display: "flex",
    alignItems: "center"
  },
  completeBadge: {
    background: "rgba(16, 185, 129, 0.12)",
    color: "var(--success-color)",
    border: "1px solid rgba(16, 185, 129, 0.25)",
    borderRadius: "20px",
    padding: "3px 10px",
    fontSize: "11px",
    fontWeight: "700"
  },
  insightsBody: {
    display: "flex",
    flexDirection: "column",
    gap: "16px"
  },
  aiSummary: {
    fontSize: "14px",
    lineHeight: "1.6",
    color: "var(--text-color)"
  },
  insightsDivider: {
    height: "1px",
    background: "var(--card-border)"
  },
  insightsTitle: {
    fontSize: "14px",
    fontWeight: "700",
    color: "var(--text-color)"
  },
  insightsList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    listStyle: "none"
  },
  insightItem: {
    display: "flex",
    alignItems: "flex-start",
    gap: "10px",
    fontSize: "13.5px",
    color: "var(--text-secondary)",
    lineHeight: "1.5"
  },
  bulletPoint: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    background: "var(--accent-color)",
    marginTop: "6px",
    flexShrink: 0
  },
  twoColumnGrid: {
    // Replaced by .two-column-grid class in index.css
  },
  roadmapPanel: {
    background: "var(--card-bg)",
    backdropFilter: "blur(12px)",
    border: "1px solid var(--card-border)",
    boxShadow: "var(--card-shadow)",
    borderRadius: "var(--border-radius)",
    padding: "24px",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    height: "fit-content"
  },
  panelTitle: {
    fontSize: "16px",
    fontWeight: "750",
    color: "var(--text-color)",
    display: "flex",
    alignItems: "center"
  },
  timeline: {
    display: "flex",
    flexDirection: "column",
    paddingLeft: "10px"
  },
  timelineItem: {
    display: "flex",
    gap: "16px"
  },
  timelineConnector: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center"
  },
  timelineDot: {
    width: "26px",
    height: "26px",
    borderRadius: "50%",
    background: "rgba(59, 130, 246, 0.15)",
    border: "1.5px solid var(--accent-color)",
    color: "var(--accent-color)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "11px",
    fontWeight: "700"
  },
  timelineLine: {
    width: "2px",
    flex: 1,
    background: "var(--card-border)",
    margin: "4px 0"
  },
  timelineContent: {
    paddingBottom: "24px",
    flex: 1
  },
  timelineStepTitle: {
    fontSize: "14px",
    fontWeight: "700",
    color: "var(--text-color)"
  },
  timelineStepText: {
    fontSize: "13px",
    color: "var(--text-secondary)",
    lineHeight: "1.5",
    marginTop: "4px"
  },
  emptyText: {
    fontSize: "13px",
    color: "var(--text-secondary)",
    fontStyle: "italic"
  },
  rolesPanel: {
    display: "flex",
    flexDirection: "column",
    gap: "20px"
  },
  filtersBar: {
    background: "var(--card-bg)",
    backdropFilter: "blur(12px)",
    border: "1px solid var(--card-border)",
    borderRadius: "14px",
    padding: "12px 16px",
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "12px"
  },
  searchWrapper: {
    position: "relative",
    flex: 1,
    minWidth: "200px"
  },
  searchIcon: {
    position: "absolute",
    left: "12px",
    top: "50%",
    transform: "translateY(-50%)",
    color: "var(--text-secondary)",
    fontSize: "14px"
  },
  searchInput: {
    width: "100%",
    background: "var(--bg-color)",
    border: "1px solid var(--card-border)",
    borderRadius: "10px",
    padding: "0 12px 0 36px",
    height: "38px",
    fontSize: "13px",
    color: "var(--text-color)",
    outline: "none"
  },
  filterGroups: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap"
  },
  filterWrapper: {
    display: "flex",
    alignItems: "center",
    background: "var(--bg-color)",
    border: "1px solid var(--card-border)",
    borderRadius: "10px",
    padding: "0 10px",
    height: "38px"
  },
  filterIcon: {
    color: "var(--text-secondary)",
    fontSize: "12px",
    marginRight: "6px"
  },
  filterSelect: {
    background: "none",
    border: "none",
    color: "var(--text-color)",
    fontSize: "13px",
    outline: "none",
    cursor: "pointer",
    paddingRight: "8px"
  },
  matchesList: {
    display: "flex",
    flexDirection: "column",
    gap: "18px"
  },
  matchCard: {
    background: "var(--card-bg)",
    backdropFilter: "blur(12px)",
    border: "1px solid var(--card-border)",
    borderRadius: "var(--border-radius)",
    boxShadow: "var(--card-shadow)",
    padding: "20px 24px",
    display: "flex",
    flexDirection: "column",
    gap: "16px"
  },
  matchCardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "16px"
  },
  matchRoleTitle: {
    fontSize: "16px",
    fontWeight: "750",
    color: "var(--text-color)"
  },
  matchRoleDesc: {
    fontSize: "13px",
    color: "var(--text-secondary)",
    lineHeight: "1.4",
    marginTop: "4px"
  },
  matchScoreBadgeRow: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: "6px",
    flexShrink: 0
  },
  matchScoreText: {
    fontSize: "14px",
    fontWeight: "700",
    color: "var(--accent-color)"
  },
  matchScoreBarTrack: {
    height: "4px",
    width: "80px",
    background: "var(--card-border)",
    borderRadius: "2px",
    overflow: "hidden"
  },
  matchScoreBarFill: {
    height: "100%",
    borderRadius: "2px"
  },
  matchCardBody: {
    display: "flex",
    flexDirection: "column",
    gap: "12px"
  },
  skillsTagRow: {
    display: "flex",
    flexDirection: "row",
    alignItems: "flex-start",
    gap: "8px",
    flexWrap: "wrap"
  },
  tagGroupLabel: {
    fontSize: "12px",
    fontWeight: "600",
    color: "var(--text-secondary)",
    marginTop: "3px"
  },
  chipsGrid: {
    display: "flex",
    flexWrap: "wrap",
    gap: "6px"
  },
  matchChip: {
    fontSize: "10.5px",
    fontWeight: "600",
    color: "var(--success-color)",
    background: "rgba(16, 185, 129, 0.1)",
    padding: "2px 8px",
    borderRadius: "4px"
  },
  gapChip: {
    fontSize: "10.5px",
    fontWeight: "600",
    color: "var(--danger-color)",
    background: "rgba(239, 68, 68, 0.1)",
    padding: "2px 8px",
    borderRadius: "4px"
  },
  matchCardFooter: {
    borderTop: "1px solid rgba(255, 255, 255, 0.04)",
    paddingTop: "12px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },
  jobsCountLabel: {
    fontSize: "12px",
    color: "var(--text-secondary)"
  },
  detailsBtn: {
    background: "rgba(59, 130, 246, 0.1)",
    border: "1px solid rgba(59, 130, 246, 0.2)",
    color: "var(--accent-color)",
    padding: "6px 14px",
    borderRadius: "8px",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    transition: "background var(--transition-speed)"
  },
  emptyState: {
    background: "var(--card-bg)",
    border: "1px solid var(--card-border)",
    borderRadius: "var(--border-radius)",
    padding: "40px",
    textAlign: "center",
    color: "var(--text-secondary)"
  },
  emptyIllustration: {
    fontSize: "36px",
    marginBottom: "10px",
    display: "block"
  },
  globalJobsSection: {
    marginTop: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "20px"
  },
  jobsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 320px), 1fr))",
    gap: "20px"
  },
  jobCard: {
    background: "var(--card-bg)",
    backdropFilter: "blur(12px)",
    border: "1px solid var(--card-border)",
    boxShadow: "var(--card-shadow)",
    borderRadius: "var(--border-radius)",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "14px"
  },
  jobCardHeader: {
    display: "flex",
    alignItems: "center",
    gap: "12px"
  },
  companyAvatar: {
    width: "40px",
    height: "40px",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    fontWeight: "750",
    fontSize: "18px"
  },
  jobTitleText: {
    fontSize: "14px",
    fontWeight: "700",
    color: "var(--text-color)"
  },
  companyText: {
    fontSize: "12px",
    color: "var(--text-secondary)"
  },
  jobMetaRow: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap"
  },
  metaBadge: {
    fontSize: "11px",
    fontWeight: "600",
    color: "var(--text-secondary)",
    background: "rgba(255,255,255,0.04)",
    padding: "2px 8px",
    borderRadius: "4px"
  },
  salaryBadge: {
    fontSize: "11px",
    fontWeight: "600",
    color: "var(--text-secondary)",
    background: "rgba(255, 255, 255, 0.04)",
    padding: "2px 8px",
    borderRadius: "4px",
    opacity: 0.8
  },
  jobSnippet: {
    fontSize: "13px",
    color: "var(--text-secondary)",
    lineHeight: "1.4",
    display: "-webkit-box",
    WebkitLineClamp: "2",
    WebkitBoxOrient: "vertical",
    overflow: "hidden"
  },
  jobApplyLink: {
    background: "rgba(255, 255, 255, 0.05)",
    border: "1px solid var(--card-border)",
    color: "var(--text-color)",
    padding: "8px",
    borderRadius: "8px",
    fontSize: "12px",
    fontWeight: "600",
    textAlign: "center",
    textDecoration: "none",
    transition: "background var(--transition-speed)"
  },
  skeletonHeader: {
    height: "70px",
    borderRadius: "12px",
    width: "60%"
  },
  skeletonStatsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "20px"
  },
  skeletonStatCard: {
    height: "100px",
    borderRadius: "16px"
  },
  skeletonSummary: {
    height: "150px",
    borderRadius: "16px"
  },
  skeletonRoadmap: {
    height: "350px",
    borderRadius: "16px"
  },
  skeletonCardsGrid: {
    display: "flex",
    flexDirection: "column",
    gap: "20px"
  },
  skeletonCard: {
    height: "180px",
    borderRadius: "16px"
  }
};
