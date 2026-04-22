// Vercel serverless function — proxies Claude API calls
// API key stays server-side, never exposed to the browser

const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
const MODELS = [
  "claude-sonnet-4-6",
  "claude-haiku-4-5-20251001",
];

const ALLOWED_PREFIXES = [
  "You are an elite dating coach",
  "You are a behavioral psychologist",
  "You are an expert dating coach",
  "You are Sofia",
  "You are Mia",
  "You are Alex",
  "You are Lily",
];

function isAllowedSystem(system) {
  if (!system || typeof system !== "string") return false;
  return ALLOWED_PREFIXES.some((prefix) => system.startsWith(prefix));
}

export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const ANTHROPIC_KEY = (process.env.ANTHROPIC_API_KEY || "").trim();
  if (!ANTHROPIC_KEY) {
    return res.status(500).json({ error: "API key not configured on server." });
  }

  const { system, userMessage, maxTokens } = req.body || {};

  if (!system || !userMessage || typeof system !== "string" || typeof userMessage !== "string") {
    return res.status(400).json({ error: "Missing required fields: system, userMessage" });
  }

  if (!isAllowedSystem(system)) {
    return res.status(400).json({ error: "Invalid system prompt." });
  }

  const tokens = Math.min(Math.max(Number(maxTokens) || 800, 50), 1200);

  try {
    // Try each model until one works
    let lastError = null;
    for (const model of MODELS) {
      const response = await fetch(ANTHROPIC_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": ANTHROPIC_KEY,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model,
          max_tokens: tokens,
          system,
          messages: [{ role: "user", content: userMessage }],
        }),
      });

      if (response.status === 404) {
        lastError = `Model ${model} not found`;
        continue; // try next model
      }

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        return res.status(response.status).json({
          error: err?.error?.message || `Anthropic API error ${response.status}`,
        });
      }

      const data = await response.json();
      const text = data.content?.[0]?.text ?? "";
      return res.status(200).json({ text });
    }

    // All models failed
    return res.status(500).json({ error: lastError || "No available model" });
  } catch (err) {
    console.error("Claude proxy error:", err.message);
    return res.status(500).json({ error: "Internal server error" });
  }
}
