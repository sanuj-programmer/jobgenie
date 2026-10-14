const Groq = require("groq-sdk");

// Resilient priority list of active Groq models with JSON capability
const CANDIDATE_MODELS = [
  "openai/gpt-oss-20b",
  "openai/gpt-oss-120b",
  "qwen/qwen3.8-27b"
];

function getGroqClient() {
  if (process.env.GROQ_API_KEY) {
    return new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return null;
}

async function askCareerAI(profile) {
  const groqClient = getGroqClient();
  if (!groqClient) {
    console.warn("Groq client not initialized - GROQ_API_KEY missing");
    return null;
  }

  const prompt = `
You are JobGenie AI. Analyze the user's profile and return ONLY JSON.

User Profile:
Name: ${profile.name}
Skills: ${(profile.skills || []).join(", ")}
Education: ${profile.education || "Not specified"}
Experience: ${profile.experienceYears || 0} years
Location: ${profile.location || "Not specified"}

Return JSON strictly in this structure:
{
  "summary": "Short summary of the user and their career trajectory",
  "suggestedRoles": [
    { "title": "Role Name", "reason": "Why this role fits their background" }
  ],
  "learningRoadmap": [
    "Step 1: Skill or technology to learn",
    "Step 2: Next milestone",
    "Step 3: Advanced practice"
  ]
}
`;

  for (const model of CANDIDATE_MODELS) {
    try {
      const completion = await groqClient.chat.completions.create({
        model: model,
        messages: [
          { role: "system", content: "You are JobGenie AI. You must always respond with valid JSON." },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" },
        temperature: 0.3
      });

      const text = completion.choices?.[0]?.message?.content || "";
      const parsed = JSON.parse(text);
      if (parsed && (parsed.summary || parsed.learningRoadmap)) {
        return parsed;
      }
    } catch (err) {
      console.warn(`Groq model ${model} failed:`, err.message);
      // Try next candidate model in list
    }
  }

  return null;
}

module.exports = { askCareerAI };
