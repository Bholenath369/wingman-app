// api/usage.js — Clerk-aware version
// Identity:  Clerk JWT in Authorization: Bearer header → userId from sub claim
// Premium:   stored in Clerk publicMetadata.tier via Management API (CLERK_SECRET_KEY)
//            falls back to signed cookie when CLERK_SECRET_KEY is absent (local dev)
// Counts:    signed httpOnly cookie (daily, scoped to userId)

import crypto from "node:crypto";

// ── Constants ──────────────────────────────────────────────────────────────────
const COOKIE_NAME  = "wm_usage";
const SECRET       = process.env.USAGE_SECRET || "change-me-in-production-please";
const COOKIE_DAYS  = 90;

const LIMITS = {
  free: {
    analyze: 3, rewrite: 5, simulate: 15,
    personality: 3, photo: 1, score: 1,
  },
  premium: {
    analyze: 100, rewrite: 200, simulate: 500,
    personality: 100, photo: 50, score: 100,
  },
};

const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || "http://localhost:5173")
  .split(",").map((s) => s.trim()).filter(Boolean);

// ── CORS ───────────────────────────────────────────────────────────────────────
function setCors(req, res) {
  const origin = req.headers.origin;
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Vary", "Origin");
  }
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
}

// ── Clerk JWT verification (dependency-free, uses node:crypto + JWKS) ─────────
const jwksCache = { keys: null, at: 0 };
const JWKS_TTL  = 5 * 60 * 1000; // 5 min

async function getJwks() {
  const issuer = process.env.CLERK_ISSUER;
  if (!issuer) return null;
  const now = Date.now();
  if (jwksCache.keys && now - jwksCache.at < JWKS_TTL) return jwksCache.keys;
  try {
    const res = await fetch(`${issuer}/.well-known/jwks.json`);
    if (!res.ok) return null;
    const { keys } = await res.json();
    jwksCache.keys = keys;
    jwksCache.at = now;
    return keys;
  } catch {
    return null;
  }
}

async function verifyClerkJWT(token) {
  if (!token || typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  let header, payload;
  try {
    header  = JSON.parse(Buffer.from(parts[0], "base64url").toString());
    payload = JSON.parse(Buffer.from(parts[1], "base64url").toString());
  } catch { return null; }
  if (payload.exp && Math.floor(Date.now() / 1000) > payload.exp) return null;
  const keys = await getJwks();
  if (!keys) return null;
  const jwk = keys.find((k) => k.kid === header.kid) ?? keys[0];
  if (!jwk) return null;
  try {
    const publicKey = crypto.createPublicKey({ key: jwk, format: "jwk" });
    const sigData   = Buffer.from(`${parts[0]}.${parts[1]}`);
    const sig       = Buffer.from(parts[2], "base64url");
    const valid     = crypto.verify("SHA256", sigData, publicKey, sig);
    return valid ? payload : null;
  } catch { return null; }
}

function bearerToken(req) {
  const auth = req.headers.authorization || "";
  return auth.startsWith("Bearer ") ? auth.slice(7) : null;
}

// ── Clerk Management API — get tier from publicMetadata ───────────────────────
async function getClerkTier(userId) {
  const secretKey = process.env.CLERK_SECRET_KEY;
  if (!secretKey || !userId) return null;
  try {
    const res = await fetch(`https://api.clerk.com/v1/users/${userId}`, {
      headers: { Authorization: `Bearer ${secretKey}` },
    });
    if (!res.ok) return null;
    const user = await res.json();
    return user.public_metadata?.tier || null;
  } catch { return null; }
}

// ── Signed cookie helpers ──────────────────────────────────────────────────────
function sign(payload) {
  const b64 = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig  = crypto.createHmac("sha256", SECRET).update(b64).digest("base64url");
  return `${b64}.${sig}`;
}

function verify(token) {
  if (!token || typeof token !== "string") return null;
  const [b64, sig] = token.split(".");
  if (!b64 || !sig) return null;
  const expected = crypto.createHmac("sha256", SECRET).update(b64).digest("base64url");
  if (sig !== expected) return null;
  try { return JSON.parse(Buffer.from(b64, "base64url").toString()); }
  catch { return null; }
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

export function getState(req, userId) {
  const cookies = parseCookies(req.headers.cookie);
  const state   = verify(cookies[COOKIE_NAME]);
  const today   = todayKey();

  // Reset if: no state, new day, or different user logged in on this device
  if (!state || state.day !== today || (userId && state.userId !== userId)) {
    return { day: today, counts: {}, tier: "free", userId: userId || null };
  }
  return state;
}

export function setCookie(res, state) {
  const token  = sign(state);
  const maxAge = COOKIE_DAYS * 24 * 60 * 60;
  const attrs  = [
    `${COOKIE_NAME}=${encodeURIComponent(token)}`,
    "Path=/",
    `Max-Age=${maxAge}`,
    "HttpOnly",
    "SameSite=Lax",
  ];
  if (process.env.NODE_ENV === "production") attrs.push("Secure");
  res.setHeader("Set-Cookie", attrs.join("; "));
}

// ── Handler ────────────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  setCors(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();

  // Verify Clerk JWT
  const token   = bearerToken(req);
  const payload = await verifyClerkJWT(token);
  const userId  = payload?.sub || null;

  if (!userId) {
    return res.status(401).json({ error: "Unauthorized — sign in required" });
  }

  const state = getState(req, userId);

  // Resolve tier: cookie first, then Clerk metadata (handles new devices)
  if (state.tier !== "premium") {
    const clerkTier = await getClerkTier(userId);
    if (clerkTier === "premium") state.tier = "premium";
  }

  const limits = LIMITS[state.tier] || LIMITS.free;

  // ── GET — return usage snapshot ──────────────────────────────────────────────
  if (req.method === "GET") {
    setCookie(res, state);
    return res.status(200).json({
      tier:      state.tier,
      day:       state.day,
      counts:    state.counts,
      limits,
      remaining: Object.fromEntries(
        Object.entries(limits).map(([k, max]) => [k, Math.max(0, max - (state.counts[k] || 0))])
      ),
    });
  }

  // ── POST — consume or check ──────────────────────────────────────────────────
  if (req.method === "POST") {
    const { action, feature } = req.body || {};

    if (action === "check") {
      const used = state.counts[feature] || 0;
      const max  = limits[feature] ?? 0;
      setCookie(res, state);
      return res.status(200).json({
        allowed:   used < max,
        remaining: Math.max(0, max - used),
        tier:      state.tier,
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
          error: "Daily limit reached", tier: state.tier, remaining: 0,
        });
      }
      state.counts[feature] = used + 1;
      setCookie(res, state);
      return res.status(200).json({
        ok:        true,
        tier:      state.tier,
        remaining: Math.max(0, limits[feature] - state.counts[feature]),
      });
    }

    return res.status(400).json({ error: "Unknown action" });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
