// Vercel serverless function — proxies image generation via Together AI (FLUX)
// API key stays server-side, never exposed to the browser

const TOGETHER_URL = "https://api.together.xyz/v1/images/generations";
const MODEL = "black-forest-labs/FLUX.1-schnell-Free";

// Only allow dating-related prompt categories
const ALLOWED_CATEGORIES = [
  "dating-profile",
  "conversation-starter",
  "date-idea",
];

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  const TOGETHER_KEY = (process.env.TOGETHER_API_KEY || "").trim();
  if (!TOGETHER_KEY) {
    return res
      .status(500)
      .json({ error: "Image API key not configured on server." });
  }

  const { prompt, category } = req.body || {};

  if (!prompt || typeof prompt !== "string" || prompt.length > 500) {
    return res
      .status(400)
      .json({ error: "Missing or invalid prompt (max 500 chars)." });
  }

  if (!category || !ALLOWED_CATEGORIES.includes(category)) {
    return res.status(400).json({ error: "Invalid image category." });
  }

  // Safety: prepend a dating-context prefix so users can't generate arbitrary images
  const safePrompt = `High quality, tasteful, dating-appropriate image: ${prompt}. Professional photography style, warm lighting, positive mood. Safe for work.`;

  try {
    const response = await fetch(TOGETHER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${TOGETHER_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        prompt: safePrompt,
        width: 768,
        height: 768,
        steps: 4,
        n: 1,
        response_format: "b64_json",
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return res.status(response.status).json({
        error: err?.error?.message || `Image API error ${response.status}`,
      });
    }

    const data = await response.json();
    const b64 = data?.data?.[0]?.b64_json;

    if (!b64) {
      return res.status(500).json({ error: "No image returned from API." });
    }

    return res.status(200).json({ image: `data:image/png;base64,${b64}` });
  } catch (err) {
    console.error("Image generation error:", err.message);
    return res.status(500).json({ error: "Internal server error" });
  }
}
