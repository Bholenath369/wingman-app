import { useState } from "react";
import { generateImage } from "../lib/image";

const TEMPLATES = [
  {
    category: "dating-profile",
    emoji: "📸",
    label: "Profile Photo Backdrop",
    prompts: [
      { label: "Coffee shop vibe", prompt: "Warm cozy coffee shop interior with soft bokeh lights, wooden table, latte art, inviting atmosphere" },
      { label: "Golden hour outdoor", prompt: "Beautiful golden hour sunset, outdoor park setting, warm natural lighting, soft lens flare" },
      { label: "Urban rooftop", prompt: "Modern city rooftop at twilight, skyline in background, warm string lights, stylish atmosphere" },
      { label: "Beach sunset", prompt: "Tropical beach at sunset, soft waves, golden sand, warm pastel sky colors" },
    ],
  },
  {
    category: "conversation-starter",
    emoji: "💬",
    label: "Conversation Starter Cards",
    prompts: [
      { label: "Fun question card", prompt: "Aesthetic card design with playful typography, pastel gradient background, fun and flirty mood, social media story format" },
      { label: "This or that", prompt: "Split design card, two contrasting fun choices, vibrant colors, modern dating aesthetic, social media format" },
      { label: "Icebreaker meme", prompt: "Funny wholesome meme template, clean modern design, dating humor, warm and approachable aesthetic" },
      { label: "Compliment card", prompt: "Elegant card with romantic aesthetic, soft pink and gold tones, heartfelt mood, shareable social format" },
    ],
  },
  {
    category: "date-idea",
    emoji: "✨",
    label: "Date Idea Inspiration",
    prompts: [
      { label: "Picnic setup", prompt: "Aesthetic picnic blanket setup in a park, wine, cheese board, flowers, romantic date setting, overhead view" },
      { label: "Movie night", prompt: "Cozy home movie night setup, projector screen, blankets, popcorn, fairy lights, romantic indoor date" },
      { label: "Art gallery", prompt: "Modern art gallery interior, elegant couple viewing art, sophisticated date atmosphere, warm lighting" },
      { label: "Night market", prompt: "Vibrant night market with colorful food stalls, lanterns, street food, fun date night atmosphere" },
    ],
  },
];

const FREE_LIMIT = 3;

function getTodayKey() {
  return `wingman_images_${new Date().toISOString().slice(0, 10)}`;
}
function getSavedCount() {
  try { return parseInt(localStorage.getItem(getTodayKey()) || "0", 10); } catch { return 0; }
}
function saveCount(n) {
  try { localStorage.setItem(getTodayKey(), String(n)); } catch {}
}

export default function ImageGenScreen() {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [customPrompt, setCustomPrompt]         = useState("");
  const [imageUrl, setImageUrl]                  = useState("");
  const [loading, setLoading]                    = useState(false);
  const [error, setError]                        = useState("");
  const [count, setCount]                        = useState(getSavedCount);
  const [activePrompt, setActivePrompt]          = useState("");

  const hitLimit = count >= FREE_LIMIT;

  async function generate(prompt, category) {
    if (hitLimit) return;
    setLoading(true);
    setImageUrl("");
    setError("");
    setActivePrompt(prompt);
    try {
      const url = await generateImage(prompt, category);
      setImageUrl(url);
      setCount((c) => { const next = c + 1; saveCount(next); return next; });
    } catch (e) {
      setError(e.message || "Couldn't generate image — try again.");
    } finally {
      setLoading(false);
    }
  }

  function downloadImage() {
    if (!imageUrl) return;
    const a = document.createElement("a");
    a.href = imageUrl;
    a.download = `wingman-${Date.now()}.png`;
    a.click();
  }

  return (
    <div>
      <div className="hero hero-with-image" style={{ marginBottom: 16 }}>
        <div className="hero-content">
          <div className="hero-eyebrow">🎨 Image Studio</div>
          <h2>Create dating visuals</h2>
          <p>Generate profile backdrops, conversation starters, and date inspiration with AI.</p>
        </div>
      </div>

      {error && (
        <div style={{ background: "rgba(239,68,68,0.1)", border: "0.5px solid rgba(239,68,68,0.3)", borderRadius: 10, padding: "10px 14px", marginBottom: 14, fontSize: 13, color: "#FCA5A5" }}>
          {error}
        </div>
      )}

      {/* Category picker */}
      {!selectedCategory && !loading && !imageUrl && (
        <>
          <div className="section-label">Choose a category</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {TEMPLATES.map((t) => (
              <button
                key={t.category}
                className="image-category-btn"
                onClick={() => setSelectedCategory(t)}
                disabled={hitLimit}
              >
                <span style={{ fontSize: 24 }}>{t.emoji}</span>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14, color: "var(--text1)" }}>{t.label}</div>
                  <div style={{ fontSize: 12, color: "var(--text2)", marginTop: 2 }}>
                    {t.prompts.length} templates
                  </div>
                </div>
              </button>
            ))}
          </div>
        </>
      )}

      {/* Template picker */}
      {selectedCategory && !loading && !imageUrl && (
        <>
          <button
            className="btn-ghost"
            onClick={() => { setSelectedCategory(null); setCustomPrompt(""); }}
            style={{ marginBottom: 12, fontSize: 12 }}
          >
            ← Back to categories
          </button>
          <div className="section-label">{selectedCategory.emoji} {selectedCategory.label}</div>

          <div className="image-template-grid">
            {selectedCategory.prompts.map((p, i) => (
              <button
                key={i}
                className="image-template-btn"
                onClick={() => generate(p.prompt, selectedCategory.category)}
                disabled={hitLimit}
              >
                <span className="template-icon">{selectedCategory.emoji}</span>
                {p.label}
              </button>
            ))}
          </div>

          <div style={{ marginTop: 16 }}>
            <div className="section-label">Or describe your own</div>
            <textarea
              className="coach-textarea"
              placeholder="Describe the image you want..."
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              style={{ minHeight: 70 }}
            />
            <button
              className="btn-primary"
              onClick={() => generate(customPrompt, selectedCategory.category)}
              disabled={!customPrompt.trim() || hitLimit}
              style={{ marginTop: 8, width: "100%" }}
            >
              Generate image
            </button>
          </div>
        </>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <div className="typing-wrap" style={{ justifyContent: "center" }}>
            <div className="typing-indicator">
              <div className="dot" /><div className="dot" /><div className="dot" />
            </div>
          </div>
          <p style={{ color: "var(--text2)", fontSize: 13, marginTop: 12 }}>
            Creating your image...
          </p>
        </div>
      )}

      {/* Result */}
      {imageUrl && !loading && (
        <div style={{ marginTop: 8 }}>
          <div className="section-label">Your generated image</div>
          <div className="image-result-wrap">
            <img
              src={imageUrl}
              alt="AI generated"
              className="image-result"
            />
          </div>
          <div className="action-row" style={{ marginTop: 12 }}>
            <button className="btn-primary" onClick={downloadImage}>
              Download
            </button>
            <button className="btn-ghost" onClick={() => generate(activePrompt, selectedCategory?.category || "dating-profile")}>
              Regenerate
            </button>
            <button className="btn-ghost" onClick={() => { setImageUrl(""); setSelectedCategory(null); setCustomPrompt(""); }}>
              New image
            </button>
          </div>
          <div style={{ textAlign: "center", marginTop: 14, fontSize: 12, color: "var(--text3)" }}>
            {FREE_LIMIT - count} free generations remaining today
          </div>
        </div>
      )}

      {hitLimit && (
        <div className="premium-gate" style={{ marginTop: 16 }}>
          <h3>Daily limit reached</h3>
          <p>Upgrade for unlimited image generation, HD quality, and more styles.</p>
          <button className="premium-btn">Unlock Premium — $9.99/mo</button>
        </div>
      )}
    </div>
  );
}
