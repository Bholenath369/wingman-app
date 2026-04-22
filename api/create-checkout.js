// api/create-checkout.js
// Creates a Stripe Checkout session for Premium subscription.
// Requires: STRIPE_SECRET_KEY, STRIPE_PRICE_ID, APP_URL in env vars.

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

  const STRIPE_KEY = process.env.STRIPE_SECRET_KEY;
  const PRICE_ID = process.env.STRIPE_PRICE_ID;
  const APP_URL = process.env.APP_URL || "http://localhost:5173";

  if (!STRIPE_KEY || !PRICE_ID) {
    return res.status(500).json({ error: "Stripe not configured" });
  }

  try {
    // Using Stripe REST API directly — no SDK dependency needed
    const params = new URLSearchParams();
    params.append("mode", "subscription");
    params.append("line_items[0][price]", PRICE_ID);
    params.append("line_items[0][quantity]", "1");
    params.append("success_url", `${APP_URL}/?upgrade=success&session_id={CHECKOUT_SESSION_ID}`);
    params.append("cancel_url", `${APP_URL}/?upgrade=cancel`);
    params.append("allow_promotion_codes", "true");
    params.append("automatic_tax[enabled]", "true");
    params.append("billing_address_collection", "auto");

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
