const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");

const app = express();
const PORT = process.env.PORT || 3001;

// ── CORS ─────────────────────────────────────────────────────
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || "http://localhost:5173,http://localhost:5174")
  .split(",")
  .map((s) => s.trim());

app.use(
  cors({
    origin(origin, cb) {
      if (!origin || ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
      cb(new Error("Not allowed by CORS"));
    },
  })
);

app.use(express.json({ limit: "50kb" }));

// ── Rate limiting ────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 60_000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests — try again in a minute." },
});
app.use("/api/", limiter);

// ── Health check ─────────────────────────────────────────────
app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

// ── Claude proxy ─────────────────────────────────────────────
const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY || "";
const MODEL_TEXT   = "claude-haiku-3-5";
const MODEL_VISION = "claude-sonnet-4-5";

// Allowed system prompt prefixes to prevent abuse
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

app.post("/api/claude", async (req, res) => {
  try {
    if (!ANTHROPIC_KEY) {
      return res.status(500).json({ error: "API key not configured on server." });
    }

    const { system, userMessage, maxTokens } = req.body;

    if (!system || !userMessage || typeof system !== "string" || typeof userMessage !== "string") {
      return res.status(400).json({ error: "Missing required fields: system, userMessage" });
    }

    if (!isAllowedSystem(system)) {
      return res.status(400).json({ error: "Invalid system prompt." });
    }

    const isVision = !!(req.body && req.body.image);
    const model = isVision ? MODEL_VISION : MODEL_TEXT;
    const tokens = Math.min(Math.max(Number(maxTokens) || 800, 50), 1200);

    const messages = [{ role: "user", content: userMessage }];

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

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return res
        .status(response.status)
        .json({ error: err?.error?.message || `Anthropic API error ${response.status}` });
    }

    const data = await response.json();
    const text = data.content?.[0]?.text ?? "";
    res.json({ text });
  } catch (err) {
    console.error("Claude proxy error:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ── Usage tracking (cookie-based, simplified for local dev) ─────────────
// In production, Vercel serverless api/usage.js handles this fully.
// Here we just return permissive limits so dev can test all features.
app.get("/api/usage", (_req, res) => {
  res.json({
    tier: "premium",
    usage: { analyze: 0, rewrite: 0, simulate: 0, personality: 0, photo: 0, score: 0 },
    limits: { analyze: 100, rewrite: 200, simulate: 500, personality: 100, photo: 50, score: 100 },
  });
});
app.post("/api/usage", (req, res) => {
  const { action } = req.body || {};
  if (!action) return res.status(400).json({ error: "Missing action" });
  res.json({ ok: true, action });
});

// ── Image generation (Together AI) ──────────────────────────────────────
const TOGETHER_URL = "https://api.together.xyz/v1/images/generations";
const TOGETHER_KEY = (process.env.TOGETHER_API_KEY || "").trim();

app.post("/api/generate-image", async (req, res) => {
  if (!TOGETHER_KEY) {
    return res.status(503).json({ error: "Image generation API key not configured. Add TOGETHER_API_KEY to .env.local" });
  }
  const { prompt, category } = req.body || {};
  if (!prompt) return res.status(400).json({ error: "Missing prompt" });

  try {
    const response = await fetch(TOGETHER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${TOGETHER_KEY}` },
      body: JSON.stringify({ model: "black-forest-labs/FLUX.1-schnell-Free", prompt, n: 1, width: 512, height: 512 }),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return res.status(response.status).json({ error: err?.error?.message || "Image API error" });
    }
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("Image gen error:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ── Stripe checkout (stub — fill STRIPE_SECRET_KEY in .env.local) ────────
const STRIPE_KEY = (process.env.STRIPE_SECRET_KEY || "").trim();

app.post("/api/create-checkout", async (req, res) => {
  if (!STRIPE_KEY) {
    return res.status(503).json({ error: "Stripe not configured. Add STRIPE_SECRET_KEY to .env.local" });
  }
  // Forward to stripe — minimal local stub
  res.status(501).json({ error: "Use Vercel production for Stripe checkout" });
});

app.listen(PORT, () => {
  console.log(`\n🚀 Wingman API running at http://localhost:${PORT}`);
  console.log(`   Claude: ${ANTHROPIC_KEY ? "✅ key loaded" : "❌ ANTHROPIC_API_KEY missing"}`);
  console.log(`   Images: ${TOGETHER_KEY ? "✅ key loaded" : "⚠️  TOGETHER_API_KEY not set (image gen disabled)"}`);
  console.log(`   Stripe: ${STRIPE_KEY ? "✅ key loaded" : "⚠️  STRIPE_SECRET_KEY not set (payments disabled)"}\n`);
});
