// api/stripe-webhook.js
// Stripe webhook endpoint. Verifies signature, then updates user tier.
//
// Setup:
// 1. In Stripe Dashboard: Developers > Webhooks > Add endpoint
//    URL: https://your-app.vercel.app/api/stripe-webhook
//    Events: checkout.session.completed, customer.subscription.deleted, invoice.payment_failed
// 2. Copy the signing secret into STRIPE_WEBHOOK_SECRET env var.
//
// For MVP without a database, we redirect users through a special upgrade URL
// that sets their premium cookie. For production, store {stripeCustomerId: tier}
// in Postgres/Supabase.

import crypto from "node:crypto";

export const config = {
  api: {
    bodyParser: false, // Stripe needs raw body for signature verification
  },
};

async function getRawBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return Buffer.concat(chunks);
}

function verifyStripeSignature(payload, header, secret) {
  if (!header || !secret) return false;
  const parts = Object.fromEntries(
    header.split(",").map((p) => p.split("=").map((s) => s.trim()))
  );
  if (!parts.t || !parts.v1) return false;

  const signedPayload = `${parts.t}.${payload.toString("utf8")}`;
  const expected = crypto.createHmac("sha256", secret).update(signedPayload).digest("hex");

  // Constant-time comparison
  const a = Buffer.from(parts.v1, "hex");
  const b = Buffer.from(expected, "hex");
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) return res.status(500).json({ error: "Webhook secret not configured" });

  const sigHeader = req.headers["stripe-signature"];
  const rawBody = await getRawBody(req);

  if (!verifyStripeSignature(rawBody, sigHeader, secret)) {
    return res.status(400).json({ error: "Invalid signature" });
  }

  let event;
  try {
    event = JSON.parse(rawBody.toString("utf8"));
  } catch {
    return res.status(400).json({ error: "Invalid JSON" });
  }

  // Handle events
  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        // TODO: persist { stripeCustomerId: session.customer, tier: "premium" }
        // For now, just log — the client is redirected to /?upgrade=success
        // which calls /api/upgrade-redeem to set the premium cookie.
        console.log("Subscription started:", session.customer, session.id);
        break;
      }
      case "customer.subscription.deleted":
      case "invoice.payment_failed": {
        const obj = event.data.object;
        console.log("Subscription ended/failed:", obj.customer);
        // TODO: downgrade user to free tier in DB
        break;
      }
      default:
        // Acknowledge unhandled events so Stripe doesn't retry
        break;
    }
  } catch (err) {
    console.error("Webhook handler error:", err.message);
    return res.status(500).json({ error: "Handler failed" });
  }

  return res.status(200).json({ received: true });
}
