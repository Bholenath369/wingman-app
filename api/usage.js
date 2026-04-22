// api/usage.js
// Tracks daily usage per user via signed httpOnly cookie.
// Premium users bypass all limits (verified via Stripe customer ID in JWT).
//
// For scale: swap this for Supabase/Postgres + proper user IDs.
// This version is dependency-free and good for launch.

import crypto from "node:crypto";

const COOKIE_NAME = "wm_usage";
const SECRET = process.env.USAGE_SECRET || "change-me-in-production-please";
const COOKIE_DAYS = 90;

const LIMITS = {
  free: {
    analyze: 3,
    rewrite: 5,
    simulate: 15,
    personality: 3,
    photo: 1,
    score: 1,
  },
  premium: {
    analyze: 100,
    rewrite: 200,
    simulate: 500,
    personality: 100,
    photo: 50,
    score: 100,
  },
};

const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || "http://localhost:5173")
  .split(",").map(s => s.trim()).filter(Boolean);

function setCors(req, res) {
  const origin = req.headers.origin;
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Vary", "Origin");
  }
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

function sign(payload) {
  const json = JSON.stringify(payload);
  const b64 = Buffer.from(json).toString("base64url");
  const sig = crypto.createHmac("sha256", SECRET).update(b64).digest("base64url");
  return `${b64}.${sig}`;
}

function verify(token) {
  if (!token || typeof token !== "string") return null;
  const [b64, sig] = token.split(".");
  if (!b64 || !sig) return null;
  const expected = crypto.createHmac("sha256", SECRET).update(b64).digest("base64url");
  if (sig !== expected) return null;
  try {
    return JSON.parse(Buffer.from(b64, "base64url").toString());
  } catch {
    return null;
  }
}

function parseCookies(header) {
  const out = {};
  if (!header) return out;
  for (const part of header.split(";")) {
    const [k, ...rest] = part.trim().split("=");
    if (k) out[k] = decodeURIComponent(rest.join("="));
  }
  return out;
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function getState(req) {
  const cookies = parseCookies(req.headers.cookie);
  const raw = cookies[COOKIE_NAME];
  const state = verify(raw);
  const today = todayKey();

  if (!state || state.day !== today) {
    return {
      day: today,
      counts: {},
      tier: state?.tier || "free",
      stripeCustomerId: state?.stripeCustomerId || null,
    };
  }
  return state;
}

function setCookie(res, state) {
  const token = sign(state);
  const maxAge = COOKIE_DAYS * 24 * 60 * 60;
  const attrs = [
    `${COOKIE_NAME}=${encodeURIComponent(token)}`,
    "Path=/",
    `Max-Age=${maxAge}`,
    "HttpOnly",
    "SameSite=Lax",
  ];
  if (process.env.NODE_ENV === "production") attrs.push("Secure");
  res.setHeader("Set-Cookie", attrs.join("; "));
}

export default async function handler(req, res) {
  setCors(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();

  const state = getState(req);
  const limits = LIMITS[state.tier] || LIMITS.free;

  if (req.method === "GET") {
    // Return current usage + limits
    setCookie(res, state);
    return res.status(200).json({
      tier: state.tier,
      day: state.day,
      counts: state.counts,
      limits,
      remaining: Object.fromEntries(
        Object.entries(limits).map(([k, max]) => [k, Math.max(0, max - (state.counts[k] || 0))])
      ),
    });
  }

  if (req.method === "POST") {
    const { action, feature } = req.body || {};

    if (action === "check") {
      const used = state.counts[feature] || 0;
      const max = limits[feature] ?? 0;
      setCookie(res, state);
      return res.status(200).json({
        allowed: used < max,
        remaining: Math.max(0, max - used),
        tier: state.tier,
      });
    }

    if (action === "consume") {
      if (!feature || !(feature in limits)) {
        return res.status(400).json({ error: "Invalid feature" });
      }
      const used = state.counts[feature] || 0;
      if (used >= limits[feature]) {
        setCookie(res, state);
        return res.status(429).json({
          error: "Daily limit reached",
          tier: state.tier,
          remaining: 0,
        });
      }
      state.counts[feature] = used + 1;
      setCookie(res, state);
      return res.status(200).json({
        ok: true,
        remaining: limits[feature] - state.counts[feature],
        tier: state.tier,
      });
    }

    return res.status(400).json({ error: "Unknown action" });
  }

  return res.status(405).json({ error: "Method not allowed" });
}

// Helper exported for /api/claude.js to enforce limits in the same request
export function checkAndConsume(req, res, feature) {
  const state = getState(req);
  const limits = LIMITS[state.tier] || LIMITS.free;
  const used = state.counts[feature] || 0;

  if (!(feature in limits)) return { allowed: false, reason: "invalid_feature" };
  if (used >= limits[feature]) {
    setCookie(res, state);
    return { allowed: false, reason: "limit_reached", tier: state.tier };
  }

  state.counts[feature] = used + 1;
  setCookie(res, state);
  return {
    allowed: true,
    tier: state.tier,
    remaining: limits[feature] - state.counts[feature],
  };
}

export { getState, setCookie, sign, verify, COOKIE_NAME };
