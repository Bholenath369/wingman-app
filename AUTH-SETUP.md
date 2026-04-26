# AUTH-SETUP.md — Wingman Clerk Auth Setup

## What was installed
- Google + Apple + Email login via Clerk
- Per-user usage tracking (tied to Clerk user ID)
- Premium status persists across devices via Clerk metadata
- Signed-in guard — anonymous users see a login screen

---

## Step 1 — Create a Clerk account (free)
1. Go to https://clerk.com → Sign Up
2. Click **Add Application** → name it **Wingman**
3. Enable sign-in methods: **Email**, **Google**, **Apple**
4. Click **Create Application**

---

## Step 2 — Get your keys
In Clerk dashboard → **API Keys**:
- Copy **Publishable key** (starts with `pk_test_` or `pk_live_`)
- Copy **Secret key** (starts with `sk_test_` or `sk_live_`)

In Clerk dashboard → **API Keys** → scroll down to **JWT verification**:
- Copy the **Issuer URL** — looks like `https://your-app.clerk.accounts.dev`

---

## Step 3 — Add env vars to Vercel
Go to https://vercel.com → your project → **Settings → Environment Variables**

Add these five variables (all environments):

| Name | Value |
|------|-------|
| `VITE_CLERK_PUBLISHABLE_KEY` | `pk_test_...` |
| `CLERK_ISSUER` | `https://your-app.clerk.accounts.dev` |
| `CLERK_SECRET_KEY` | `sk_test_...` |
| `STRIPE_SECRET_KEY` | *(already set)* |
| `STRIPE_PRICE_ID` | *(already set)* |

Then click **Redeploy** (or push a commit).

---

## Step 4 — Add env vars for local dev
Create / update `.env.local` in your project root:

```
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_ISSUER=https://your-app.clerk.accounts.dev
CLERK_SECRET_KEY=sk_test_...
```

Then restart dev server: `npm run dev`

---

## Step 5 — (Optional) Enable Apple Sign In
Apple requires a domain verification file.  
In Clerk dashboard → **SSO connections → Apple** → follow the domain verification steps.  
This needs your production domain, so skip for local testing.

---

## How premium now works
1. User clicks **Go Premium** → Stripe checkout
2. After payment, `/api/upgrade-redeem` is called automatically
3. It sets `publicMetadata.tier = "premium"` on the Clerk user record
4. On any device/browser, the user's tier is fetched from Clerk on login
5. No database needed — Clerk IS the database for auth + tier

---

## Troubleshooting

**"Missing VITE_CLERK_PUBLISHABLE_KEY" error on load**  
→ Check `.env.local` has the key and you restarted the dev server.

**Login screen appears but sign-in fails**  
→ Make sure your domain is added in Clerk dashboard → **Domains**.  
   Add `http://localhost:5173` for local, your Vercel URL for production.

**API returns 401 Unauthorized**  
→ `CLERK_ISSUER` in Vercel env vars must exactly match the Issuer URL from Clerk dashboard (no trailing slash).

**Premium not sticking across devices**  
→ Make sure `CLERK_SECRET_KEY` is set in Vercel env vars so the upgrade endpoint can write to Clerk metadata.
