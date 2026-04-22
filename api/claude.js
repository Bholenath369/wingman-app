// Vercel serverless function — proxies Claude API calls
// API key stays server-side. CORS locked to allowed origins.
// Supports both text and vision (image) requests.

const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-sonnet-4-5";

const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || "http://localhost:5173,http://localhost:5174")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const ALLOWED_SYSTEM_PREFIXES = [
  "You are an elite dating coach",
  "You are a behavioral psychologist",
  "You are an expert dating coach",
  "You are a conversation scoring expert",
  "You are Sofia",
  "You are Mia",
  "You are Alex",
  "You are Lily",
];

function isAllowedSystem(system) {
  if (!system || typeof system !== "string") return false;
  return ALLOWED_SYSTEM_PREFIXES.some((p) => system.startsWith(p));
}

function setCors(req, res) {
  const origin = req.headers.origin;
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  }
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Max-Age", "86400");
}

// Minimal in-memory rate limiter (per IP, per minute).
// For production at scale, move to Upstash Redis or similar.
const RATE_WINDOW_MS = 60_000;
const RATE_MAX = 20;
const ipBuckets = new Map();

function rateLimit(req) {
  const ip =
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    req.socket?.remoteAddress ||
    "unknown";
  const now = Date.now();
  const bucket = ipBuckets.get(ip) || { count: 0, resetAt: now + RATE_WINDOW_MS };
  if (now > bucket.resetAt) {
    bucket.count = 0;
    bucket.resetAt = now + RATE_WINDOW_MS;
  }
  bucket.count += 1;
  ipBuckets.set(ip, bucket);
  return bucket.count <= RATE_MAX;
}

export default async function handler(req, res) {
  setCors(req, res);

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  // Block requests with no allowed origin header (prevents drive-by abuse)
  const origin = req.headers.origin;
  if (origin && !ALLOWED_ORIGINS.includes(origin)) {
    return res.status(403).json({ error: "Origin not allowed" });
  }

  if (!rateLimit(req)) {
    return res.status(429).json({ error: "Too many requests. Try again in a minute." });
  }

  const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY || "";
  if (!ANTHROPIC_KEY) {
    return res.status(500).json({ error: "API key not configured on server." });
  }

  const { system, userMessage, maxTokens, image } = req.body || {};

  if (!system || typeof system !== "string" || !isAllowedSystem(system)) {
    return res.status(400).json({ error: "Invalid system prompt." });
  }

  if (!userMessage || typeof userMessage !== "string") {
    return res.status(400).json({ error: "Missing userMessage." });
  }

  // Cap tokens to prevent runaway costs
  const tokens = Math.min(Math.max(Number(maxTokens) || 800, 50), 1500);

  // Build message content — supports text-only or vision (image + text)
  let messageContent;
  if (image && image.data && image.mediaType) {
    // Validate image payload
    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!validTypes.includes(image.mediaType)) {
      return res.status(400).json({ error: "Unsupported image type." });
    }
    // Cap base64 size at ~5MB encoded (~3.75MB raw)
    if (image.data.length > 7_000_000) {
      return res.status(400).json({ error: "Image too large (max ~5MB)." });
    }
    messageContent = [
      {
        type: "image",
        source: { type: "base64", media_type: image.mediaType, data: image.data },
      },
      { type: "text", text: userMessage },
    ];
  } else {
    messageContent = userMessage;
  }

  try {
    const response = await fetch(ANTHROPIC_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: tokens,
        system,
        messages: [{ role: "user", content: messageContent }],
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return res.status(response.status).json({
        error: err?.error?.message || `Anthropic API error ${response.status}`,
      });
    }

    const data = await response.json();
    const text = data.content?.[0]?.text ?? "";
    return res.status(200).json({ text });
  } catch (err) {
    console.error("Claude proxy error:", err.message);
    return res.status(500).json({ error: "Internal server error" });
  }
}
