const express = require("express");
const router = express.Router();
const Role = require("../models/Role");
const stringSimilarity = require("string-similarity");
const { askCareerAI } = require("../services/aiService");
const { fetchJobsForRole } = require("../services/jobSearchService");
const auth = require("../middleware/auth");

const norm = s => (s||"").toString().toLowerCase().trim();

function scoreSkills(userSkills = [], roleSkills = []) {
  if (!roleSkills || roleSkills.length === 0) return 0;
  const u = userSkills.map(norm);
  let total = 0;
  roleSkills.forEach(rs => {
    const best = stringSimilarity.findBestMatch(norm(rs), u);
    total += best.bestMatch.rating; // 0..1
  });
  return (total / roleSkills.length) * 50; // weight 50
}
function scoreExp(userExp = 0, minExp = 0) {
  if (!minExp) return 30;
  return Math.min(userExp / minExp, 1) * 30; // weight 30
}
function scoreEdu(userEdu = "", needEdu = "") {
  if (!needEdu) return 20;
  return stringSimilarity.compareTwoStrings(norm(userEdu), norm(needEdu)) * 20; // weight 20
}

router.post("/", auth, async (req, res) => {
  try {
    const profile = req.body;
    // ensure arrays
    profile.skills = Array.isArray(profile.skills) ? profile.skills : (profile.skills ? profile.skills.split(",").map(s=>s.trim()) : []);

    const roles = await Role.find().lean();

    const results = await Promise.all(roles.map(async role => {
      const skillScore = scoreSkills(profile.skills, role.keySkills || []);
      const expScore = scoreExp(Number(profile.experienceYears)||0, Number(role.minExperience)||0);
      const eduScore = scoreEdu(profile.education||"", role.educationNeed||"");

      const total = Math.round(skillScore + expScore + eduScore);

      const userLow = (profile.skills||[]).map(norm);
      const gaps = (role.keySkills||[]).filter(rs => {
        const best = stringSimilarity.findBestMatch(norm(rs), userLow);
        return best.bestMatch.rating < 0.45;
      });

      // fetch jobs for this role (top 3)
      const jobs = await fetchJobsForRole(role.title, 3);

      return {
        role,
        score: total,
        breakdown: { skillScore: Math.round(skillScore), expScore: Math.round(expScore), eduScore: Math.round(eduScore) },
        gaps,
        jobs
      };
    }));

    results.sort((a,b)=> b.score - a.score);

    // ask Groq AI for explanation + roadmap
    let ai = null;
    try { ai = await askCareerAI(profile); } catch(e) { console.error("AI error", e); }

    res.json({ matches: results, ai });
  } catch (err) {
    console.error("Match error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
