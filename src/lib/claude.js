// src/lib/claude.js
// Central API layer — all Claude calls go through the backend proxy

const API_URL = import.meta.env.VITE_API_URL || "";
const VIBE_KEY = "wingman_user_vibe";

// ── Client-side in-memory cache (text-only calls, cleared on reload) ─
// Avoids burning API credits when user re-submits the same conversation.
const _responseCache = new Map();
function _cacheKey(system, userMessage) {
  // Simple deterministic key — good enough for same-session dedup
  return `${system.length}:${userMessage}`;
}

// ── Input truncation — only send last ~1500 chars of conversation ─
// Reduces input tokens on every text analysis call without losing context.
// The last few exchanges are what the AI needs; the full history adds cost.
function truncateConvo(text, maxChars = 1500) {
  if (!text || text.length <= maxChars) return text;
  // Keep the end of the conversation (most recent messages)
  return "..." + text.slice(-maxChars);
}

// ── Personality cache (localStorage) ────────────────────────
// Same conversation → same result. No need to call the API twice.
const PERSONALITY_CACHE_KEY = "wm_personality_cache";
function getPersonalityCache(key) {
  try {
    const store = JSON.parse(localStorage.getItem(PERSONALITY_CACHE_KEY) || "{}");
    return store[key] || null;
  } catch { return null; }
}
function setPersonalityCache(key, value) {
  try {
    const store = JSON.parse(localStorage.getItem(PERSONALITY_CACHE_KEY) || "{}");
    store[key] = value;
    // Keep only last 20 entries
    const keys = Object.keys(store);
    if (keys.length > 20) delete store[keys[0]];
    localStorage.setItem(PERSONALITY_CACHE_KEY, JSON.stringify(store));
  } catch {}
}

// ── User vibe persistence (localStorage) ─────────────────────
export function getUserVibe() {
  try { return JSON.parse(localStorage.getItem(VIBE_KEY)); } catch { return null; }
}
export function setUserVibe(vibe) {
  try { localStorage.setItem(VIBE_KEY, JSON.stringify(vibe)); } catch {}
}

async function callClaude({ system, userMessage, maxTokens = 500, image = null }) {
  // Return cached result for identical text-only calls (no API charge)
  if (!image) {
    const key = _cacheKey(system, userMessage);
    if (_responseCache.has(key)) return _responseCache.get(key);
  }

  const body = { system, userMessage, maxTokens };
  if (image) body.image = image;

  const res = await fetch(`${API_URL}/api/claude`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error || `API error ${res.status}`);
  }
  const data = await res.json();
  const text = data.text ?? "";

  // Cache text-only results
  if (!image) {
    const key = _cacheKey(system, userMessage);
    _responseCache.set(key, text);
    // Limit cache to 50 entries to avoid memory bloat
    if (_responseCache.size > 50) {
      _responseCache.delete(_responseCache.keys().next().value);
    }
  }
  return text;
}

// Strip data URL prefix to get pure base64
function extractBase64(dataUrl) {
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) return null;
  return { mediaType: match[1], data: match[2] };
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

// ── 1a. Screenshot Analyzer (text version) ───────────────────
export async function analyzeScreenshot(conversationText) {
  const system = SCREENSHOT_SYSTEM;
  const raw = await callClaude({
    system,
    userMessage: `Here is the conversation to reply to:\n\n${truncateConvo(conversationText)}\n\nGenerate 4 reply options.`,
    maxTokens: 400,
  });
  return parseReplies(raw);
}

// ── 1b. Screenshot Analyzer (VISION — real image) ────────────
export async function analyzeScreenshotImage(file) {
  const dataUrl = await fileToBase64(file);
  const img = extractBase64(dataUrl);
  if (!img) throw new Error("Invalid image file");

  const system = SCREENSHOT_SYSTEM;
  const raw = await callClaude({
    system,
    userMessage:
      "Read this chat screenshot carefully. Identify who sent which message (left bubbles vs right bubbles). " +
      "Then generate 4 reply options that continue the conversation naturally. Return JSON only.",
    image: img,
    maxTokens: 900,
  });
  return parseReplies(raw);
}

function parseReplies(raw) {
  try {
    const clean = raw.replace(/```json|```/g, "").trim();
    // Find the JSON array even if model added preamble
    const start = clean.indexOf("[");
    const end = clean.lastIndexOf("]");
    if (start === -1 || end === -1) throw new Error("no JSON array");
    return JSON.parse(clean.slice(start, end + 1));
  } catch {
    return FALLBACK_REPLIES;
  }
}

function parseSmartResult(raw) {
  try {
    const clean = raw.replace(/```json|```/g, "").trim();
    const start = clean.indexOf("{");
    const end = clean.lastIndexOf("}");
    if (start === -1 || end === -1) throw new Error("no JSON object");
    const parsed = JSON.parse(clean.slice(start, end + 1));
    return {
      context: parsed.context || FALLBACK_CONTEXT,
      replies: Array.isArray(parsed.replies) ? parsed.replies : FALLBACK_REPLIES,
    };
  } catch {
    return { context: FALLBACK_CONTEXT, replies: FALLBACK_REPLIES };
  }
}

const SMART_SYSTEM = `You are an elite dating coach. Analyze the conversation and generate smart reply options.

Respond ONLY with a JSON object matching this exact shape:
{
  "context": {
    "stage": "first_message" | "early_chat" | "building_rapport" | "dying_conversation" | "post_date",
    "temperature": "cold" | "cool" | "warm" | "hot",
    "theyFeeling": "curious" | "playful" | "guarded" | "excited" | "bored" | "interested" | null,
    "risk": "being_too_eager" | "going_too_slow" | "low_energy" | "over_qualifying" | null
  },
  "replies": [
    { "type": "flirty",    "emoji": "😏", "text": "..." },
    { "type": "funny",     "emoji": "😂", "text": "..." },
    { "type": "confident", "emoji": "😎", "text": "..." },
    { "type": "emotional", "emoji": "❤️", "text": "..." }
  ]
}

Rules:
- Each reply must feel natural and human, not like AI wrote it
- No more than 2 sentences per reply
- Flirty: subtly suggestive, not explicit
- Funny: genuinely clever, not forced
- Confident: secure, doesn't seek approval
- Emotional: warm, vulnerable without being needy
- NEVER use generic pickup lines`;

// ── 1c. Smart Screenshot Analyzer (text version) ─────────────
export async function analyzeScreenshotSmart(conversationText, { avoidStyles = [] } = {}) {
  const avoidNote = avoidStyles.length
    ? `\n\nThe user disliked these styles: ${avoidStyles.join(", ")}. Generate different alternatives.`
    : "";
  const raw = await callClaude({
    system: SMART_SYSTEM,
    userMessage: `Analyze this conversation and generate 4 reply options.\n\n${truncateConvo(conversationText)}${avoidNote}`,
    maxTokens: 450,
  });
  return parseSmartResult(raw);
}

// ── 1d. Smart Screenshot Analyzer (VISION) ───────────────────
export async function analyzeScreenshotImageSmart(file, { avoidStyles = [] } = {}) {
  const dataUrl = await fileToBase64(file);
  const img = extractBase64(dataUrl);
  if (!img) throw new Error("Invalid image file");

  const avoidNote = avoidStyles.length
    ? ` The user disliked these styles: ${avoidStyles.join(", ")}. Generate different alternatives.`
    : "";
  const raw = await callClaude({
    system: SMART_SYSTEM,
    userMessage:
      "Read this chat screenshot. Identify who sent which message (left vs right bubbles). " +
      "Analyze the conversation context and generate 4 reply options. Return JSON only." + avoidNote,
    image: img,
    maxTokens: 800,
  });
  return parseSmartResult(raw);
}

const SCREENSHOT_SYSTEM = `You are an elite dating coach with deep expertise in attraction psychology,
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

  // Check localStorage cache first
  const cacheKey = conversationText.slice(-200);
  const cached = getPersonalityCache(cacheKey);
  if (cached) return cached;

  const raw = await callClaude({
    system,
    userMessage: `Analyze this conversation:\n\n${truncateConvo(conversationText)}`,
    maxTokens: 350,
  });

  try {
    const clean = raw.replace(/```json|```/g, "").trim();
    const start = clean.indexOf("{");
    const end = clean.lastIndexOf("}");
    const result = JSON.parse(clean.slice(start, end + 1));
    setPersonalityCache(cacheKey, result);
    return result;
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

  // 8 exchanges is plenty for persona context; keeps input tokens low
  const recentHistory = conversationHistory.slice(-8);
  const historyText = recentHistory
    .map((m) => `${m.role === "user" ? "Them" : "You"}: ${m.content}`)
    .join("\n");

  return callClaude({
    system,
    userMessage: `Conversation so far:\n${historyText}\n\nThem: ${latestMessage}\n\nYour reply:`,
    maxTokens: 150,
  });
}

// ── 5. Conversation Scoring (Premium) ────────────────────────
export async function scoreConversation(conversationHistory, persona) {
  const system = `You are a conversation scoring expert. Analyze a practice conversation between a user
and an AI persona, then grade the user's performance across key dating-communication dimensions.

Respond ONLY with valid JSON, nothing else:
{
  "overall": 78,
  "scores": {
    "confidence": 82,
    "humor": 65,
    "pacing": 70,
    "curiosity": 88,
    "authenticity": 75
  },
  "strengths": ["Short specific point", "Another specific win"],
  "improvements": ["Specific actionable note", "Another actionable note"],
  "nextMove": "One short coaching tip for their next message"
}

All scores are integers 0-100.
Be specific to what actually happened in the conversation — no generic advice.
Strengths and improvements should reference actual lines or moments when possible.`;

  const convoText = conversationHistory
    .map((m) => `${m.role === "user" ? "USER" : "THEM"}: ${m.content}`)
    .join("\n");

  const raw = await callClaude({
    system,
    userMessage: `Persona type: ${persona}\n\nConversation:\n${convoText}\n\nScore this conversation.`,
    maxTokens: 450,
  });

  try {
    const clean = raw.replace(/```json|```/g, "").trim();
    const start = clean.indexOf("{");
    const end = clean.lastIndexOf("}");
    return JSON.parse(clean.slice(start, end + 1));
  } catch {
    return FALLBACK_SCORE;
  }
}

// ── 6. Profile Photo / Bio Analyzer (Premium) ────────────────
export async function analyzeProfilePhoto(file) {
  const dataUrl = await fileToBase64(file);
  const img = extractBase64(dataUrl);
  if (!img) throw new Error("Invalid image file");

  const system = `You are an elite dating coach specializing in profile optimization.
Analyze a dating profile photo for how effectively it attracts matches. Consider: lighting,
composition, expression, outfit, background, what the viewer's eye goes to, and what vibe it projects.

Respond ONLY with valid JSON, nothing else:
{
  "overall": 74,
  "scores": {
    "lighting": 80,
    "expression": 65,
    "composition": 78,
    "styling": 70,
    "attractivenessSignal": 75
  },
  "strengths": ["Specific thing that works", "Another specific win"],
  "improvements": ["Concrete actionable change", "Another concrete change"],
  "suggestedUse": "main" | "secondary" | "replace"
}

Be honest but kind. No generic advice. Reference what you actually see in the photo.
Never comment on or guess the person's race, exact age, or identifying features.`;

  const raw = await callClaude({
    system,
    userMessage:
      "Analyze this dating profile photo and score it. Return JSON only.",
    image: img,
    maxTokens: 700,
  });

  try {
    const clean = raw.replace(/```json|```/g, "").trim();
    const start = clean.indexOf("{");
    const end = clean.lastIndexOf("}");
    return JSON.parse(clean.slice(start, end + 1));
  } catch {
    return FALLBACK_PHOTO_SCORE;
  }
}

export async function rewriteBio(currentBio, vibe = "confident") {
  const system = `You are an elite dating coach who writes Tinder/Hinge/Bumble bios that get matches.
Rewrite the user's bio to be more effective. Vibe requested: ${vibe}.

Rules:
- Keep it under 150 characters unless the original was longer
- Avoid clichés ("love to laugh", "work hard play hard", "ask me anything")
- Show personality through specific details, not generic claims
- Include one thing that invites a reply
- Sound like a real person, not marketing copy

Respond with ONLY the rewritten bio. No explanation, no quotes.`;

  return callClaude({
    system,
    userMessage: `Current bio:\n\n${currentBio}\n\nRewrite it.`,
    maxTokens: 200,
  });
}

// ── Fallbacks ────────────────────────────────────────────────
const FALLBACK_CONTEXT = {
  stage: "early_chat",
  temperature: "warm",
  theyFeeling: "interested",
  risk: null,
};

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
    { type: "warn", text: "You responded too fast — signaled high anxiety." },
    { type: "warn", text: "Your message ended with a question — try a statement instead." },
    { type: "good", text: "Your humor landed well — she matched your energy." },
  ],
};

const FALLBACK_SCORE = {
  overall: 72,
  scores: { confidence: 75, humor: 68, pacing: 70, curiosity: 78, authenticity: 72 },
  strengths: ["You kept responses concise", "You showed genuine curiosity"],
  improvements: ["Add more playful tension", "Avoid asking two questions in a row"],
  nextMove: "Send a short statement that makes her curious, not a question.",
};

const FALLBACK_PHOTO_SCORE = {
  overall: 70,
  scores: { lighting: 72, expression: 68, composition: 74, styling: 70, attractivenessSignal: 68 },
  strengths: ["Clear face visibility", "Natural environment"],
  improvements: ["Try a genuine smile that reaches your eyes", "Shoot from slightly above eye level"],
  suggestedUse: "secondary",
};
