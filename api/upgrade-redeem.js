// api/upgrade-redeem.js
// After Stripe checkout success, the user lands on /?upgrade=success&session_id=...
// The client calls this endpoint which:
//   1. Verifies the session_id with Stripe's API
//   2. Confirms payment_status === "paid"
//   3. Updates the user's signed cookie to tier: "premium"
//
// This gives you a working premium flow without needing a database on day one.

import { getState, setCookie } from "./usage.js";

const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || "http://localhost:5173")
  .split(",").map(s => s.trim()).filter(Boolean);

function setCors(req, res) {
  const origin = req.headers.origin;
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Vary", "Origin");
  }
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

export default async function handler(req, res) {
  setCors(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { sessionId } = req.body || {};
  if (!sessionId || typeof sessionId !== "string") {
    return res.status(400).json({ error: "Missing sessionId" });
  }

  const STRIPE_KEY = process.env.STRIPE_SECRET_KEY;
  if (!STRIPE_KEY) return res.status(500).json({ error: "Stripe not configured" });

  try {
    // Verify session with Stripe
    const resp = await fetch(
      `https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}`,
      { headers: { Authorization: `Bearer ${STRIPE_KEY}` } }
    );
    if (!resp.ok) return res.status(400).json({ error: "Invalid session" });

    const session = await resp.json();
    if (session.payment_status !== "paid" && session.status !== "complete") {
      return res.status(402).json({ error: "Payment not completed" });
    }

    // Upgrade the cookie
    const state = getState(req);
    state.tier = "premium";
    state.stripeCustomerId = session.customer;
    setCookie(res, state);

    return res.status(200).json({ ok: true, tier: "premium" });
  } catch (err) {
    console.error("Upgrade redeem error:", err.message);
    return res.status(500).json({ error: "Failed to verify upgrade" });
  }
}
