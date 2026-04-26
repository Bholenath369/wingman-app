// api/create-checkout.js — Clerk-aware version
// Links the Stripe customer to the signed-in Clerk user ID (stored in metadata)
// so upgrade-redeem can look them up cross-device.

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

  const STRIPE_KEY = process.env.STRIPE_SECRET_KEY;
  const PRICE_ID   = process.env.STRIPE_PRICE_ID;
  const APP_URL    = process.env.APP_URL || "http://localhost:5173";

  if (!STRIPE_KEY || !PRICE_ID) {
    return res.status(500).json({ error: "Stripe not configured" });
  }

  try {
    const params = new URLSearchParams();
    params.append("mode", "subscription");
    params.append("line_items[0][price]", PRICE_ID);
    params.append("line_items[0][quantity]", "1");
    params.append("success_url", `${APP_URL}/?upgrade=success&session_id={CHECKOUT_SESSION_ID}`);
    params.append("cancel_url",  `${APP_URL}/?upgrade=cancel`);
    params.append("allow_promotion_codes",    "true");
    params.append("automatic_tax[enabled]",   "true");
    params.append("billing_address_collection", "auto");
    // Attach Clerk user ID to Stripe session for post-upgrade lookup
    params.append("metadata[clerk_user_id]", userId);

    const resp = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${STRIPE_KEY}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params,
    });

    if (!resp.ok) {
      const err = await resp.json().catch(() => ({}));
      return res.status(resp.status).json({
        error: err?.error?.message || `Stripe error ${resp.status}`,
      });
    }

    const session = await resp.json();
    return res.status(200).json({ url: session.url, id: session.id });
  } catch (err) {
    console.error("Checkout error:", err.message);
    return res.status(500).json({ error: "Failed to create checkout" });
  }
}
