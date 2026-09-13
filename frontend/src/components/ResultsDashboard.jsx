import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FaSearch, FaFilter, FaCompass, FaChevronRight, 
  FaInfoCircle, FaUndo, FaComments, FaBriefcase, FaListUl, 
  FaGraduationCap, FaNetworkWired, FaCheckCircle, FaExclamationTriangle,
  FaRobot
} from "react-icons/fa";

import styles from '../styles/components/ResultsDashboard.module.css';

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
      <div className={styles.container}>
        <div className={`${styles.skeletonHeader} skeleton`} />
        <div className={styles.skeletonStatsGrid}>
          {[1, 2, 3, 4].map(i => (
            <div key={i} className={`${styles.skeletonStatCard} skeleton`} />
          ))}
        </div>
        <div className={`${styles.skeletonSummary} skeleton`} />
        <div className="two-column-grid" style={{ marginTop: "24px" }}>
          <div className={`${styles.skeletonRoadmap} skeleton`} />
          <div className={styles.skeletonCardsGrid}>
            {[1, 2, 3].map(i => (
              <div key={i} className={`${styles.skeletonCard} skeleton`} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      
      {/* Fallback Banner */}
      {isMockJobsFallback && (
        <div className={styles.banner}>
          <FaExclamationTriangle style={{ color: "var(--warning-color)", fontSize: "16px" }} />
          <span>Live jobs currently unavailable due to search provider rate limits. Showing sample opportunities instead.</span>
        </div>
      )}

      {/* Header Row */}
      <div className={styles.header}>
        <div>
          <span className={styles.dateLabel}>{dateString}</span>
          <h1 className={`${styles.greetingTitle} word-break-all`}>Hello, {profile?.name || "User"} 👋</h1>
          <p className={styles.greetingSubtitle}>Here's your personalized career analysis.</p>
        </div>
        
        <div className={`${styles.headerActions} header-actions`}>
          <button onClick={onViewConversation} className={styles.actionBtn} title="View Conversation Log">
            <FaComments /> View Conversation
          </button>
          <button onClick={onEditProfile} className={styles.actionBtn} title="Prefill questionnaire and edit info">
            Edit Profile
          </button>
          <button onClick={onRestart} className={styles.restartBtn} title="Restart from beginning">
            <FaUndo /> Start New Analysis
          </button>
        </div>
      </div>

      {/* Overview Statistics Panel */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Best Match</span>
          <span className={styles.statValue}>{stats.maxScore}%</span>
          <div className={styles.progressBarTrack}>
            <div className={styles.progressBarFill}
style={{width: `${stats.maxScore}%` }} />
          </div>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Suggested Roles</span>
          <span className={styles.statValue}>{stats.rolesCount}</span>
          <span className={styles.statSubText}>Calculated from DB</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Jobs Found</span>
          <span className={styles.statValue}>{stats.jobsCount}</span>
          <span className={styles.statSubText}>Live listings matches</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Skills Identified</span>
          <span className={styles.statValue}>{stats.skillsCount}</span>
          <span className={styles.statSubText}>In your profile</span>
        </div>
      </div>

      {/* Top Section: AI Insights & Summary */}
      <div className={styles.insightsCard}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>
            <FaRobot style={{ color: "var(--accent-color)", marginRight: "10px" }} /> AI Profile Summary & Insights
          </h2>
          <span className={styles.completeBadge}>✓ Analysis Complete</span>
        </div>
        <div className={styles.insightsBody}>
          <p className={styles.aiSummary}>{result?.ai?.summary || "No AI summary returned from backend."}</p>
          
          <div className={styles.insightsDivider} />
          
          <h3 className={styles.insightsTitle}>💡 Actionable Insights</h3>
          <ul className={styles.insightsList}>
            {aiInsights.map((insight, idx) => (
              <li key={idx} className={styles.insightItem}>
                <div className={styles.bulletPoint} />
                <span className="word-break-all">{insight}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Center Grid: Left (Roadmaps) - Right (Matches) */}
      <div className="two-column-grid">
        
        {/* Suggested Timeline Roadmap */}
        <div className={styles.roadmapPanel}>
          <h2 className={styles.panelTitle}>
            <FaGraduationCap style={{ marginRight: "8px", color: "var(--accent-color)" }} />
            Suggested Learning Roadmap
          </h2>
          {result?.ai?.learningRoadmap && result.ai.learningRoadmap.length > 0 ? (
            <div className={styles.timeline}>
              {result.ai.learningRoadmap.map((step, idx) => (
                <div key={idx} className={styles.timelineItem}>
                  <div className={styles.timelineConnector}>
                    <div className={styles.timelineDot}>{idx + 1}</div>
                    {idx < result.ai.learningRoadmap.length - 1 && <div className={styles.timelineLine} />}
                  </div>
                  <div className={styles.timelineContent}>
                    <h4 className={styles.timelineStepTitle}>Week {idx + 1} Priority</h4>
                    <p className={styles.timelineStepText}>{step}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className={styles.emptyText}>No customized roadmap generated.</p>
          )}
        </div>

        {/* Roles & Jobs Lists */}
        <div className={styles.rolesPanel}>
          
          {/* Filters Bar */}
          <div className={styles.filtersBar}>
            <div className={styles.searchWrapper}>
              <FaSearch className={styles.searchIcon} />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search roles..."
                className={styles.searchInput}
              />
            </div>
            
            <div className={styles.filterGroups}>
              <div className={styles.filterWrapper}>
                <FaFilter className={styles.filterIcon} />
                <select
                  value={selectedExp}
                  onChange={(e) => setSelectedExp(e.target.value)}
                  className={styles.filterSelect}
                >
                  <option value="all">Experience (All)</option>
                  <option value="entry">Entry Level (0 yrs)</option>
                  <option value="mid">Mid Level (1 yr)</option>
                  <option value="senior">Senior (2+ yrs)</option>
                </select>
              </div>

              <div className={styles.filterWrapper}>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className={styles.filterSelect}
                >
                  <option value="all">Job Types (All)</option>
                  <option value="remote">Remote-focused</option>
                </select>
              </div>
            </div>
          </div>

          {/* Role Matches Cards */}
          <h2 className={styles.panelTitle}>Suggested Career Matches ({filteredMatches.length})</h2>
          
          <div className={styles.matchesList}>
            {filteredMatches.length > 0 ? (
              filteredMatches.map((m, idx) => (
                <div key={idx} className={`${styles.matchCard} hover-lift`}>
                  <div className={styles.matchCardHeader}>
                    <div>
                      <h3 className={styles.matchRoleTitle}>{m.role.title}</h3>
                      <p className={styles.matchRoleDesc}>{m.role.description}</p>
                    </div>
                    <div className={styles.matchScoreBadgeRow}>
                      <span className={styles.matchScoreText}>{m.score}% Match</span>
                      <div className={styles.matchScoreBarTrack}>
                        <div 
                          className={styles.matchScoreBarFill}
style={{width: `${m.score}%`,
                            background: m.score >= 70 ? "var(--success-color)" : "var(--accent-color)"
                          }} 
                        />
                      </div>
                    </div>
                  </div>

                  {/* Skills Grid */}
                  <div className={styles.matchCardBody}>
                    <div className={styles.skillsTagRow}>
                      <span className={styles.tagGroupLabel}>Matched Skills:</span>
                      <div className={styles.chipsGrid}>
                        {(m.role.keySkills || m.role.requiredSkills || []).map((skill, sIdx) => {
                          const isMissing = m.gaps?.some(g => g.toLowerCase() === skill.toLowerCase());
                          if (isMissing) return null;
                          return (
                            <span key={sIdx} className={styles.matchChip}>
                              ✓ {skill.toUpperCase()}
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    {m.gaps && m.gaps.length > 0 && (
                      <div className={styles.skillsTagRow}>
                        <span className={styles.tagGroupLabel}>Missing:</span>
                        <div className={styles.chipsGrid}>
                          {m.gaps.map((gap, gIdx) => (
                            <span key={gIdx} className={styles.gapChip}>
                              ⚠ {gap.toUpperCase()}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Openings Count and View Button */}
                  <div className={styles.matchCardFooter}>
                    <span className={styles.jobsCountLabel}>
                      💼 {m.jobs?.length || 0} job opportunity{(m.jobs?.length || 0) !== 1 ? "s" : ""} found
                    </span>
                    <button 
                      onClick={() => setSelectedRoleForDrawer(m)}
                      className={styles.detailsBtn}
                    >
                      View Details <FaChevronRight style={{ marginLeft: "6px", fontSize: "11px" }} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className={styles.emptyState}>
                <span className={styles.emptyIllustration}>🔍</span>
                <h3>No careers found</h3>
                <p>Try refining your search terms or adjustments.</p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Global Recommended Jobs List */}
      <div className={styles.globalJobsSection}>
        <h2 className={styles.panelTitle}>Recommended Live Openings</h2>
        <div className={styles.jobsGrid}>
          {filteredMatches.flatMap(m => m.jobs || []).slice(0, 6).map((job, idx) => (
            <div key={idx} className={`${styles.jobCard} hover-lift`}>
              <div className={styles.jobCardHeader}>
                <div 
                  className={styles.companyAvatar}
style={{background: getAvatarBg(job.company) 
                  }}
                >
                  {getAvatarInitials(job.company)}
                </div>
                <div>
                  <h4 className={styles.jobTitleText}>{job.title}</h4>
                  <span className={styles.companyText}>{job.company}</span>
                </div>
              </div>
              
              <div className={styles.jobMetaRow}>
                <span className={styles.metaBadge}>{job.location || "Remote"}</span>
                <span className={styles.metaBadge}>Full Time</span>
                <span className={styles.salaryBadge}>Salary Not Available</span>
              </div>

              <p className={styles.jobSnippet}>{job.snippet || "Explore this job posting for further details."}</p>

              <a 
                href={job.url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className={styles.jobApplyLink}
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

