# AI Dating Wingman — Complete Setup & Deployment Guide

## Project Structure

```
ai-dating-wingman/
├── src/
│   ├── lib/
│   │   └── claude.js          ← All AI prompt engineering (4 features)
│   ├── screens/
│   │   ├── AnalyzeScreen.jsx  ← Screenshot analyzer + reply suggestions
│   │   ├── PersonalityScreen.jsx ← Personality detection engine
│   │   ├── CoachScreen.jsx    ← Message rewriter
│   │   └── SimulateScreen.jsx ← AI persona chat practice
│   ├── App.jsx                ← Navigation shell
│   ├── index.css              ← Design system (dark theme, tokens, animations)
│   └── main.jsx               ← Entry point
├── index.html
├── vite.config.js
├── vercel.json
├── package.json
└── .env.example
```

---

## Step 1 — Get Your API Key

1. Go to https://console.anthropic.com/
2. Create an account or log in
3. Navigate to **API Keys** → **Create Key**
4. Copy the key (starts with `sk-ant-...`)

---

## Step 2 — Local Development

```bash
# Clone or unzip the project
cd ai-dating-wingman

# Install dependencies
npm install

# Create your .env file
cp .env.example .env.local

# Add your API key to .env.local:
# VITE_ANTHROPIC_API_KEY=sk-ant-your-key-here

# Start dev server
npm run dev
# → Opens at http://localhost:5173
```

---

## Step 3 — Deploy to Vercel (Free)

### Option A — Vercel CLI (fastest)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from project root
vercel

# Follow prompts:
# - Link to Vercel account
# - Set project name: ai-dating-wingman
# - Framework detected: Vite ✓

# Add your API key as an environment variable:
vercel env add VITE_ANTHROPIC_API_KEY
# Paste your sk-ant-... key when prompted

# Deploy to production
vercel --prod
# → Your app is live at https://your-app.vercel.app
```

### Option B — GitHub + Vercel Dashboard

1. Push code to a GitHub repo:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourname/ai-dating-wingman
   git push -u origin main
   ```

2. Go to https://vercel.com/new
3. Import your GitHub repository
4. Under **Environment Variables**, add:
   - Key: `VITE_ANTHROPIC_API_KEY`
   - Value: `sk-ant-your-key-here`
5. Click **Deploy**

---

## Step 4 — Add OCR for Real Screenshot Uploads (Optional)

The current build simulates OCR. To process real screenshots:

### Option A — Tesseract.js (free, client-side)

```bash
npm install tesseract.js
```

In `AnalyzeScreen.jsx`, replace the `handleFileChange` function:

```javascript
import Tesseract from 'tesseract.js';

async function handleFileChange(e) {
  const file = e.target.files[0];
  if (!file) return;
  setStage("typing");
  const { data: { text } } = await Tesseract.recognize(file, 'eng');
  await handleUpload(text);
}
```

### Option B — Claude Vision API (best accuracy, uses base64 image)

```javascript
// In claude.js, replace analyzeScreenshot to send the image directly:
export async function analyzeScreenshotImage(base64Image, mimeType = "image/jpeg") {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": API_KEY,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-calls": "true",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 800,
      system: SCREENSHOT_SYSTEM_PROMPT, // same system prompt from claude.js
      messages: [{
        role: "user",
        content: [
          { type: "image", source: { type: "base64", media_type: mimeType, data: base64Image } },
          { type: "text", text: "Read this conversation screenshot and generate 4 reply options as JSON." }
        ]
      }]
    })
  });
  // ... rest of handler
}
```

---

## Step 5 — Add Stripe Payments (Premium Tier)

```bash
npm install @stripe/stripe-js
```

1. Create account at https://stripe.com
2. Create a **Product** and **Price** ($9.99/month recurring)
3. Get your publishable key
4. Add to `.env.local`: `VITE_STRIPE_KEY=pk_live_...`

In `PremiumGate.jsx`:
```javascript
import { loadStripe } from '@stripe/stripe-js';
const stripe = await loadStripe(import.meta.env.VITE_STRIPE_KEY);
await stripe.redirectToCheckout({ lineItems: [{ price: 'price_...', quantity: 1 }], mode: 'subscription', successUrl: '...', cancelUrl: '...' });
```

---

## Step 6 — Add Auth (Clerk — free tier)

```bash
npm install @clerk/clerk-react
```

1. Create account at https://clerk.com
2. Create application
3. Add to `.env.local`: `VITE_CLERK_PUBLISHABLE_KEY=pk_...`

Wrap your app in `main.jsx`:
```jsx
import { ClerkProvider } from '@clerk/clerk-react';
<ClerkProvider publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY}>
  <App />
</ClerkProvider>
```

---

## AI Prompt Engineering — Feature by Feature

### Feature 1: Screenshot Analyzer
- **Model**: claude-sonnet-4-20250514
- **Technique**: JSON-mode output, 4 typed replies
- **Key constraint**: "Never use cringe pickup lines. Sound human."
- **Tokens**: ~600 output

### Feature 2: Personality Detection
- **Model**: claude-sonnet-4-20250514
- **Technique**: Structured JSON with behavioral scores 0-100
- **Key constraint**: "Be specific, psychologically accurate, never generic."
- **Tokens**: ~500 output

### Feature 3: Message Coach
- **Model**: claude-sonnet-4-20250514
- **Technique**: Style injection via system prompt
- **Key constraint**: "Max 2 sentences. Sound completely natural and human."
- **Tokens**: ~120 output (fast)

### Feature 4: AI Simulation
- **Model**: claude-sonnet-4-20250514
- **Technique**: Character persona + conversation history
- **Key constraint**: "Never break character. Keep it SHORT — real people don't write paragraphs in texts."
- **Tokens**: ~100 output (very fast)

---

## Cost Estimates

| Usage           | Monthly API Cost |
|----------------|------------------|
| 100 users/day  | ~$8–15           |
| 1,000 users/day| ~$80–150         |
| 10,000 users/day| ~$800–1,500     |

Free tier: 5 rewrites/day per user (limits costs)
Premium: $9.99/mo (covers ~100+ active free users per paying subscriber)

---

## Monetization Checklist

- [x] Free tier: 5 rewrites/day, 2 persona chats/day
- [ ] Premium gate on: unlimited rewrites, all 4 personas, deep analysis, conversation scoring
- [ ] Add usage tracking with localStorage or Supabase
- [ ] Email capture before hitting limit ("Get 10 free credits")
- [ ] Viral share feature: "My AI wingman said..." → image card

---

## Performance Tips

- All AI calls are client-side (no backend needed)
- Use React.lazy + Suspense for screen code splitting
- Cache personality analysis results in sessionStorage
- Add loading skeletons for better perceived performance
