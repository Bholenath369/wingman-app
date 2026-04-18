// src/lib/claude.js
// Central API layer — all Claude calls go through the backend proxy

const API_URL = import.meta.env.VITE_API_URL || "";

async function callClaude({ system, userMessage, maxTokens = 800 }) {
  const res = await fetch(`${API_URL}/api/claude`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ system, userMessage, maxTokens }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error || `API error ${res.status}`);
  }
  const data = await res.json();
  return data.text ?? "";
}

// ── 1. Screenshot Analyzer ───────────────────────────────────
export async function analyzeScreenshot(conversationText) {
  const system = `You are an elite dating coach with deep expertise in attraction psychology,
communication dynamics, and emotional intelligence. You analyze conversation screenshots
and generate reply options that feel human, confident, and emotionally aware.

NEVER use generic pickup lines. Avoid cringe. Be real, witty, and emotionally intelligent.
Match the energy and emotional register of the conversation.

Respond ONLY with a JSON array of exactly 4 reply objects, nothing else:
[
  { "type": "flirty",    "emoji": "😏", "text": "..." },
  { "type": "funny",     "emoji": "😂", "text": "..." },
  { "type": "confident", "emoji": "😎", "text": "..." },
  { "type": "emotional", "emoji": "❤️", "text": "..." }
]
Rules:
- Each reply must feel like a natural continuation from a real, confident person
- No more than 2 sentences per reply
- Flirty: subtly suggestive, not explicit
- Funny: genuinely clever, not forced
- Confident: secure, doesn't seek approval
- Emotional: warm, vulnerable without being needy`;

  const raw = await callClaude({
    system,
    userMessage: `Here is the conversation to reply to:\n\n${conversationText}\n\nGenerate 4 reply options.`,
    maxTokens: 600,
  });

  try {
    const clean = raw.replace(/```json|```/g, "").trim();
    return JSON.parse(clean);
  } catch {
    return FALLBACK_REPLIES;
  }
}

// ── 2. Personality Detection ─────────────────────────────────
export async function detectPersonality(conversationText) {
  const system = `You are a behavioral psychologist and dating expert. Analyze the OTHER person's
messages in a dating conversation for personality traits, interest level, and emotional patterns.

Respond ONLY with valid JSON matching this exact shape, nothing else:
{
  "insight": "2-3 sentence behavioral insight about what's really happening",
  "interest": 78,
  "warmth": 65,
  "testing": 55,
  "playfulness": 82,
  "traits": ["Extrovert leaning", "Playful", "Emotionally open", "Selective"],
  "mistakes": [
    { "type": "warn", "text": "..." },
    { "type": "warn", "text": "..." },
    { "type": "good", "text": "..." }
  ]
}
interest/warmth/testing/playfulness are integers 0-100.
traits: 3-4 descriptive tags.
mistakes: 2-3 items mixing warn and good feedback about the user's behavior.
Be specific, psychologically accurate, and never generic.`;

  const raw = await callClaude({
    system,
    userMessage: `Analyze this conversation:\n\n${conversationText}`,
    maxTokens: 500,
  });

  try {
    const clean = raw.replace(/```json|```/g, "").trim();
    return JSON.parse(clean);
  } catch {
    return FALLBACK_PERSONALITY;
  }
}

// ── 3. Message Coach ─────────────────────────────────────────
export async function rewriteMessage(userMessage, style) {
  const styleGuides = {
    attractive: "Make it intriguing and magnetic. Create slight mystery. Don't be available or eager. Keep it short.",
    confident:  "Rewrite with total self-assurance. No questions that seek validation. Statements not questions. Calm, secure energy.",
    emotional:  "Add genuine warmth and vulnerability without being needy. Show real feeling without desperation.",
    playful:    "Add wit, lightness, and a little teasing. Should make them smile. Unexpected but not silly.",
  };

  const system = `You are an expert dating coach rewriting messages to be more effective.
Style requested: ${style} — ${styleGuides[style] || styleGuides.attractive}

Rules:
- Keep the core intent and topic of the original message
- Sound completely natural and human, not like an AI
- Maximum 2 sentences
- Respond with ONLY the rewritten message, no explanation, no quotes`;

  return callClaude({
    system,
    userMessage: `Rewrite this message:\n\n"${userMessage}"`,
    maxTokens: 120,
  });
}

// ── 4. AI Simulation ─────────────────────────────────────────
export async function simulateReply(persona, conversationHistory, latestMessage) {
  const personaProfiles = {
    cold: `You are Sofia. You're hard to impress, give short responses, and test people constantly.
You don't show enthusiasm easily. You reply in 1-2 sentences max. You're not rude, just selective and guarded.
When someone says something genuinely interesting, you might crack slightly — but never obviously.`,

    interested: `You are Mia. You're genuinely interested in this person but won't chase them.
You're warm, responsive, occasionally flirtatious. You ask follow-up questions when interested.
You reply naturally, 1-3 sentences. You show excitement subtly.`,

    highvalue: `You are Alex. You're confident, successful, and very busy. You find most people boring.
You reply directly and efficiently. You appreciate boldness and originality. You don't entertain games.
If someone impresses you, you show brief, understated appreciation. 1-2 sentences max.`,

    shy: `You are Lily. You're introverted and take time to open up. You overthink and sometimes hedge.
You use "haha" and "um" sometimes. You're very sweet once comfortable. You reply in 1-2 sentences.
You're clearly interested but nervous to show it fully.`,
  };

  const system = `${personaProfiles[persona] || personaProfiles.cold}

You are in a real text conversation. Respond naturally as this persona would.
Never break character. Never explain yourself. Just respond as the character would text.
Keep it SHORT — real people don't write paragraphs in texts.`;

  const recentHistory = conversationHistory.slice(-20);
  const historyText = recentHistory
    .map((m) => `${m.role === "user" ? "Them" : "You"}: ${m.content}`)
    .join("\n");

  return callClaude({
    system,
    userMessage: `Conversation so far:\n${historyText}\n\nThem: ${latestMessage}\n\nYour reply:`,
    maxTokens: 100,
  });
}

// ── Fallbacks ────────────────────────────────────────────────
const FALLBACK_REPLIES = [
  { type: "flirty",    emoji: "😏", text: "Careful — I might just start thinking about you exclusively. That's a lot of real estate to give up." },
  { type: "funny",     emoji: "😂", text: "Bold of you to assume there's competition. My brain's basically a shrine at this point." },
  { type: "confident", emoji: "😎", text: "Good. Keep thinking. I tend to be worth it." },
  { type: "emotional", emoji: "❤️", text: "That's genuinely one of the most unexpectedly sweet things I've heard all week." },
];

const FALLBACK_PERSONALITY = {
  insight: "She's genuinely interested but subtly testing your confidence. Her tone is playful with warmth underneath — respond with ease, not eagerness.",
  interest: 82, warmth: 75, testing: 60, playfulness: 88,
  traits: ["Extrovert leaning", "Playful", "Emotionally open", "Selective"],
  mistakes: [
    { type: "warn", text: "You responded too fast (under 30s) — signaled high anxiety, reduced perceived value." },
    { type: "warn", text: "Your message ended with a question — you're seeking approval. Try a statement instead." },
    { type: "good", text: "Your humor landed well — she matched your energy and escalated warmth." },
  ],
};
