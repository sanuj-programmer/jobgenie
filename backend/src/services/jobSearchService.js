const axios = require("axios");

async function fetchJobsForRole(roleTitle, limit = 5) {
  // If no RapidAPI key → ALWAYS use mock jobs
  if (!process.env.RAPIDAPI_KEY) {
    return Array.from({ length: limit }).map((_, i) => ({
      id: `mock-${i}`,
      title: roleTitle,
      company: `Example Company ${i + 1}`,
      location: "Remote",
      url: "https://example.com",
      snippet: "Mock job result because RapidAPI key was missing or failed."
    }));
  }

  try {
    const res = await axios.get(`https://${process.env.RAPIDAPI_HOST}/search`, {
      params: { query: roleTitle, num_pages: "1" },
      headers: {
        "x-rapidapi-key": process.env.RAPIDAPI_KEY,
        "x-rapidapi-host": process.env.RAPIDAPI_HOST
      }
    });

    const data = res.data?.data || [];
    if (!data.length) throw new Error("Empty API response");

    return data.slice(0, limit).map(j => ({
      id: j.job_id || j.id,
      title: j.job_title || roleTitle,
      company: j.employer_name || "Unknown",
      location: j.job_city || "Remote",
      url: j.job_apply_link || "#",
      snippet: (j.job_description || "").slice(0, 240)
    }));
  } catch (err) {
    console.error("Jobs API error — using mock jobs:", err?.message);

    return Array.from({ length: limit }).map((_, i) => ({
      id: `mock-fallback-${i}`,
      title: roleTitle,
      company: `Mock Company ${i + 1}`,
      location: "Remote",
      url: "https://example.com",
      snippet: "Mock job (RapidAPI rate limit or key error)."
    }));
  }
}

module.exports = { fetchJobsForRole };
