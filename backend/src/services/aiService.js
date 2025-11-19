const Groq = require("groq-sdk");

// Initialize Groq client
let groqClient = null;
if (process.env.GROQ_API_KEY) {
  groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
}

async function askCareerAI(profile) {
  if (!groqClient) return null;

  const prompt = `
You are JobGenie AI. Analyze the user's profile and return ONLY JSON.

User Profile:
Name: ${profile.name}
Skills: ${profile.skills.join(", ")}
Interests: ${profile.interests.join(", ")}
Education: ${profile.education}
Experience: ${profile.experienceYears}

Return JSON in this structure:
{
  "summary": "Short summary of the user",
  "suggestedRoles": [
    { "title": "Role Name", "reason": "Why this role fits" }
  ],
  "learningRoadmap": [
    "Step 1",
    "Step 2",
    "Step 3"
  ]
}
`;

  try {
    const completion = await groqClient.chat.completions.create({
      model: "llama-3.1-8b-instant",   // ⭐ PERFECT MODEL (WORKING)
      messages: [
        { role: "system", content: "You are JobGenie AI." },
        { role: "user", content: prompt }
      ],
      temperature: 0.3
    });

    const text = completion.choices?.[0]?.message?.content || "";

    // try to extract JSON if AI wrapped it in text
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return { raw: text };

    return JSON.parse(jsonMatch[0]);
  } catch (err) {
    console.error("Groq AI error:", err.response?.data || err.message);
    return null;
  }
}

module.exports = { askCareerAI };
