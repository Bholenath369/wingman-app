import { useState } from "react";
import { rewriteMessage } from "../lib/claude";
import { useUsage } from "../lib/useUsage";
import PremiumGate from "../components/PremiumGate";

const STYLES = [
  { key: "attractive", label: "🔥 Attractive" },
  { key: "confident",  label: "🎯 Confident"  },
  { key: "emotional",  label: "❤️ Emotional"  },
  { key: "playful",    label: "⚡ Playful"      },
];

export default function CoachScreen() {
  const [text, setText]       = useState("");
  const [style, setStyle]     = useState(null);
  const [result, setResult]   = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied]   = useState(false);
  const [shared, setShared]   = useState(false);
  const [error, setError]     = useState("");
  const [showHowTo, setShowHowTo] = useState(
    () => localStorage.getItem("wm_coach_howto") !== "1"
  );
  const { consume, remaining, isPremium, loading: usageLoading } = useUsage();

  async function shareRewrite() {
    const preview = text.length > 80 ? text.slice(0, 77) + "..." : text;
    const shareText = `✍️ Wingman just upgraded my message:\n\nBefore: "${preview}"\n\nAfter: "${result}"\n\nFind the words. Win the heart.\nwingman-six-beta.vercel.app`;
    if (navigator.share) {
      try { await navigator.share({ text: shareText, url: "https://wingman-six-beta.vercel.app" }); } catch {}
    } else {
      try {
        await navigator.clipboard.writeText(shareText);
        setShared(true);
        setTimeout(() => setShared(false), 2500);
      } catch {}
    }
  }

  function dismissHowTo() {
    setShowHowTo(false);
    localStorage.setItem("wm_coach_howto", "1");
  }

  async function rewrite(s) {
    if (!text.trim()) return;

    const check = await consume("rewrite");
    if (!check.allowed) {
      setError("Daily limit reached.");
      return;
    }

    setStyle(s);
    setLoading(true);
    setResult("");
    setError("");
    try {
      const out = await rewriteMessage(text, s);
      setResult(out.trim());
    } catch {
      setError("Couldn't reach AI — try again in a moment.");
    } finally {
      setLoading(false);
    }
  }

  function copyResult() {
    navigator.clipboard.writeText(result).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const rewritesLeft = remaining?.rewrite ?? 0;
  const hitLimit = !usageLoading && !isPremium && rewritesLeft === 0;

  return (
    <div>
      <div className="hero hero-gradient" style={{ marginBottom: 16 }}>
        <div className="hero-illustration">✍️</div>
        <div className="hero-content">
          <div className="hero-eyebrow">� Message Coach</div>
          <h2>Turn good into irresistible</h2>
          <p>Words that land. Feelings that stick. Pick a style and watch it transform.</p>
        </div>
      </div>

      {error && (
        <div style={{
          background: "rgba(239,68,68,0.1)",
          border: "0.5px solid rgba(239,68,68,0.3)",
          borderRadius: 10,
          padding: "10px 14px",
          marginBottom: 14,
          fontSize: 13,
          color: "#FCA5A5",
        }}>
          {error}
        </div>
      )}

      {showHowTo && (
        <div className="insight-box" style={{ position: "relative" }}>
          <button
            onClick={dismissHowTo}
            style={{ position: "absolute", top: 10, right: 12, background: "none", border: "none", color: "var(--text3)", fontSize: 16, cursor: "pointer", lineHeight: 1 }}
            aria-label="Dismiss"
          >×</button>
          <div className="insight-label">How it works</div>
          <p>Paste your draft, choose a style, and get a rewrite that sounds human, confident, and magnetic.</p>
        </div>
      )}

      <textarea
        className="coach-textarea"
        placeholder='e.g. "hey wanna hang out sometime?"'
        value={text}
        onChange={(e) => { setText(e.target.value); setResult(""); setStyle(null); }}
      />

      <div className="rewrite-row">
        {STYLES.map((s) => (
          <button
            key={s.key}
            className={`rewrite-btn ${style === s.key ? "active" : ""}`}
            onClick={() => rewrite(s.key)}
            disabled={!text.trim() || hitLimit}
          >
            {s.label}
          </button>
        ))}
      </div>

      {loading && (
        <div className="typing-wrap">
          <div className="typing-indicator">
            <div className="dot" /><div className="dot" /><div className="dot" />
          </div>
          <span style={{ fontSize: 12, color: "var(--text2)" }}>Rewriting...</span>
        </div>
      )}

      {result && !loading && (
        <>
          <div className="section-label">Rewritten version</div>
          <div className="rewritten-msg">{result}</div>
          <div className="action-row">
            <button className="btn-primary" onClick={copyResult}>
              {copied ? "Copied!" : "Use this reply"}
            </button>
            <button className="btn-ghost" onClick={() => rewrite(style)}>Regenerate</button>
          </div>

          {/* Before / After share card */}
          <div className="share-card">
            <div className="share-card-row">
              <span className="share-card-label">Before</span>
              <span className="share-card-text">{text.length > 90 ? text.slice(0, 87) + "..." : text}</span>
            </div>
            <div className="share-card-arrow">↓</div>
            <div className="share-card-row after">
              <span className="share-card-label">After (✨ {style})</span>
              <span className="share-card-text">{result}</span>
            </div>
            <button className="share-result-btn" onClick={shareRewrite}>
              {shared ? "✓ Copied to clipboard!" : "Share this transformation 🔗"}
            </button>
          </div>

          {!isPremium && (
            <div style={{
              textAlign: "center",
              marginTop: 14,
              fontSize: 12,
              color: "var(--text3)",
            }}>
              {rewritesLeft} free rewrites remaining today
            </div>
          )}
        </>
      )}

      {hitLimit && (
        <PremiumGate
          title="Daily limit reached"
          description="Upgrade for unlimited rewrites and advanced coaching."
          features={[
            "Unlimited message rewrites",
            "Unlimited screenshot analyses",
            "All 4 practice personas",
            "Profile photo analyzer",
            "Conversation scoring",
          ]}
        />
      )}

      {!result && !loading && !hitLimit && (
        <div style={{ marginTop: 24 }}>
          <div className="section-label">Coach tips</div>
          {[
            "End with a statement, not a question — it shows confidence.",
            "Avoid double-texting within 30 minutes of sending.",
            "Match their message length — don't over-invest early.",
          ].map((tip, i) => (
            <div key={i} style={{
              display: "flex",
              gap: 10,
              alignItems: "flex-start",
              padding: "10px 12px",
              background: "var(--bg2)",
              borderRadius: "var(--r-xs)",
              marginBottom: 8,
              border: "0.5px solid var(--border)",
              fontSize: 13,
              color: "var(--text2)",
              lineHeight: 1.5,
            }}>
              <span style={{ color: "var(--accent)", flexShrink: 0 }}>✦</span>
              {tip}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
