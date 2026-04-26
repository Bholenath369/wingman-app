// api/upgrade-redeem.js — Clerk-aware version
// After Stripe checkout success the client calls this endpoint which:
//   1. Verifies the Stripe session_id
//   2. Confirms payment_status === "paid"
//   3. Updates the signed cookie to tier: "premium" (device-bound, immediate)
//   4. Sets Clerk publicMetadata.tier = "premium" via Management API (cross-device)

import { getState, setCookie } from "./usage.js";
import crypto from "node:crypto";

const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || "http://localhost:5173")
  .split(",").map((s) => s.trim()).filter(Boolean);

function setCors(req, res) {
  const origin = req.headers.origin;
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Vary", "Origin");
  }
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
}

// ── Clerk JWT verification (mirrors api/usage.js) ─────────────────────────────
const jwksCache = { keys: null, at: 0 };
const JWKS_TTL  = 5 * 60 * 1000;

async function getJwks() {
  const issuer = process.env.CLERK_ISSUER;
  if (!issuer) return null;
  const now = Date.now();
  if (jwksCache.keys && now - jwksCache.at < JWKS_TTL) return jwksCache.keys;
  try {
    const res = await fetch(`${issuer}/.well-known/jwks.json`);
    if (!res.ok) return null;
    const { keys } = await res.json();
    jwksCache.keys = keys; jwksCache.at = now;
    return keys;
  } catch { return null; }
}

async function verifyClerkJWT(token) {
  if (!token) return null;
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
    const valid = crypto.verify(
      "SHA256",
      Buffer.from(`${parts[0]}.${parts[1]}`),
      publicKey,
      Buffer.from(parts[2], "base64url")
    );
    return valid ? payload : null;
  } catch { return null; }
}

// ── Set Clerk publicMetadata.tier ─────────────────────────────────────────────
async function setClerkPremium(userId) {
  const secretKey = process.env.CLERK_SECRET_KEY;
  if (!secretKey || !userId) return;
  try {
    await fetch(`https://api.clerk.com/v1/users/${userId}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ public_metadata: { tier: "premium" } }),
    });
  } catch (err) {
    console.error("Clerk metadata update failed:", err.message);
  }
}

// ── Handler ────────────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  setCors(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  // Auth
  const auth    = req.headers.authorization || "";
  const token   = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  const payload = await verifyClerkJWT(token);
  if (!payload?.sub) return res.status(401).json({ error: "Unauthorized" });
  const userId = payload.sub;

  const { sessionId } = req.body || {};
  if (!sessionId || typeof sessionId !== "string") {
    return res.status(400).json({ error: "Missing sessionId" });
  }

  const STRIPE_KEY = process.env.STRIPE_SECRET_KEY;
  if (!STRIPE_KEY) return res.status(500).json({ error: "Stripe not configured" });

  try {
    // Verify Stripe session
    const resp = await fetch(
      `https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}`,
      { headers: { Authorization: `Bearer ${STRIPE_KEY}` } }
    );
    if (!resp.ok) return res.status(400).json({ error: "Invalid session" });

    const session = await resp.json();
    if (session.payment_status !== "paid" && session.status !== "complete") {
      return res.status(402).json({ error: "Payment not completed" });
    }

    // 1. Update signed cookie immediately (this device)
    const state = getState(req, userId);
    state.tier   = "premium";
    state.userId = userId;
    state.stripeCustomerId = session.customer;
    setCookie(res, state);

    // 2. Persist premium in Clerk metadata (all future devices/sessions)
    await setClerkPremium(userId);

    return res.status(200).json({ ok: true, tier: "premium" });
  } catch (err) {
    console.error("Upgrade redeem error:", err.message);
    return res.status(500).json({ error: "Failed to verify upgrade" });
  }
}
