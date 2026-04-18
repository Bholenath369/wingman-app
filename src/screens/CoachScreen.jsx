import { useState } from "react";
import { rewriteMessage } from "../lib/claude";

const STYLES = [
  { key: "attractive", label: "More attractive" },
  { key: "confident",  label: "More confident"  },
  { key: "emotional",  label: "More emotional"  },
  { key: "playful",    label: "Playful"          },
];

const FREE_LIMIT = 5;

function getTodayKey() {
  return `wingman_rewrites_${new Date().toISOString().slice(0, 10)}`;
}

function getSavedCount() {
  try {
    const key = getTodayKey();
    return parseInt(localStorage.getItem(key) || "0", 10);
  } catch {
    return 0;
  }
}

function saveCount(n) {
  try {
    localStorage.setItem(getTodayKey(), String(n));
  } catch {}
}

export default function CoachScreen() {
  const [text, setText]         = useState("");
  const [style, setStyle]       = useState(null);
  const [result, setResult]     = useState("");
  const [loading, setLoading]   = useState(false);
  const [count, setCount]       = useState(getSavedCount);
  const [copied, setCopied]     = useState(false);
  const [error, setError]       = useState("");

  async function rewrite(s) {
    if (!text.trim()) return;
    setStyle(s);
    setLoading(true);
    setResult("");
    setError("");
    try {
      const out = await rewriteMessage(text, s);
      setResult(out.trim());
      setCount((c) => { const next = c + 1; saveCount(next); return next; });
    } catch {
      setError("Couldn't reach AI — check your API key.");
    } finally {
      setLoading(false);
    }
  }

  function copyResult() {
    navigator.clipboard.writeText(result).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const hitLimit = count >= FREE_LIMIT;

  return (
    <div>
      <div className="hero hero-with-image" style={{ marginBottom: 16 }}>
        <img className="hero-img" src="/images/hero-coach.svg" alt="" aria-hidden="true" />
        <div className="hero-content">
          <div className="hero-eyebrow">💬 Message Coach</div>
          <h2>Say it better</h2>
          <p>Type what you want to say — we'll rewrite it to actually land.</p>
        </div>
      </div>

      {error && (
        <div style={{ background: "rgba(239,68,68,0.1)", border: "0.5px solid rgba(239,68,68,0.3)", borderRadius: 10, padding: "10px 14px", marginBottom: 14, fontSize: 13, color: "#FCA5A5" }}>
          {error}
        </div>
      )}

      <div className="insight-box">
        <div className="insight-label">How it works</div>
        <p>Paste your draft, choose a style, and get a rewrite that sounds human, confident, and magnetic.</p>
      </div>

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

          <div style={{ textAlign: "center", marginTop: 14, fontSize: 12, color: "var(--text3)" }}>
            {FREE_LIMIT - count} free rewrites remaining today
          </div>
        </>
      )}

      {hitLimit && (
        <div className="premium-gate" style={{ marginTop: 16 }}>
          <h3>Daily limit reached</h3>
          <p>Upgrade for unlimited rewrites, advanced coaching, and personality-matched suggestions.</p>
          <button className="premium-btn">Unlock Premium — $9.99/mo</button>
        </div>
      )}

      {!result && !loading && !hitLimit && (
        <div style={{ marginTop: 24 }}>
          <div className="section-label">Coach tips</div>
          {[
            "End with a statement, not a question — it shows confidence.",
            "Avoid double-texting within 30 minutes of sending.",
            "Match their message length — don't over-invest early.",
          ].map((tip, i) => (
            <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "10px 12px", background: "var(--bg2)", borderRadius: "var(--r-xs)", marginBottom: 8, border: "0.5px solid var(--border)", fontSize: 13, color: "var(--text2)", lineHeight: 1.5 }}>
              <span style={{ color: "var(--accent)", flexShrink: 0 }}>✦</span>
              {tip}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
