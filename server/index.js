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
const MODEL = "claude-sonnet-4-20250514";

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

    const tokens = Math.min(Math.max(Number(maxTokens) || 800, 50), 1200);

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

app.listen(PORT, () => {
  console.log(`Wingman API running on port ${PORT}`);
});
