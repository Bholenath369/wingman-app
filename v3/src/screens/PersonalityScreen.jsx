import { useState, useEffect, useRef } from "react";
import { detectPersonality } from "../lib/claude";
import { useUsage } from "../lib/useUsage";
import { haptic } from "../lib/animations";
import MatchScore from "../components/MatchScore";
import { SkeletonPersonality } from "../components/SkeletonLoader";

const DEMO_CONVO = `Her: A million random thoughts, but talking to you is definitely the nicest one right now 🌙
Her: worth it if it means you're thinking about me too
Me: Same, honestly been thinking about our last conversation
Her: oh yeah? what about it
Me: Just how easy it is to talk to you I guess
Her: haha that's cute
Her: you always say the right thing don't you`;

const PILL_CLASSES = ["pill-pink","pill-purple","pill-green","pill-amber"];

export default function PersonalityScreen() {
  const [data, setData]         = useState(null);
  const [loading, setLoading]   = useState(false);
  const [animated, setAnimated] = useState(false);
  const [convoText, setConvoText] = useState("");
  const [error, setError]       = useState("");
  const barsRef = useRef(false);
  const { consume } = useUsage();

  async function analyze(text) {
    const check = await consume("personality");
    if (!check.allowed) { setError("Daily limit reached."); return; }
    setLoading(true); setData(null); setAnimated(false);
    barsRef.current = false; setError("");
    try {
      const result = await detectPersonality(text);
      setData(result);
      haptic("success");
    } catch { setError("Couldn't reach AI — try again."); }
    finally   { setLoading(false); }
  }

  useEffect(() => {
    if (data && !barsRef.current) {
      barsRef.current = true;
      setTimeout(() => setAnimated(true), 120);
    }
  }, [data]);

  const TRAIT_BARS = data ? [
    { label: "Overall interest", val: data.interest,    color: "linear-gradient(90deg,#E8547A,#C43060)" },
    { label: "Emotional warmth", val: data.warmth,      color: "linear-gradient(90deg,#7C5CFC,#5A3DB8)" },
    { label: "Testing behavior", val: data.testing,     color: "linear-gradient(90deg,#F59E0B,#D97706)" },
    { label: "Playfulness",      val: data.playfulness, color: "linear-gradient(90deg,#22C55E,#16A34A)" },
  ] : [];

  return (
    <div>
      {!data && !loading && (
        <>
          <div className="hero hero-with-image" style={{ marginBottom: 16 }}>
            <img className="hero-img" src="/images/hero-profile.svg" alt="" aria-hidden="true" />
            <div className="hero-content">
              <div className="hero-eyebrow">🧠 Personality Engine</div>
              <h2>Decode their behavior</h2>
              <p>Paste the conversation and get a deep read on interest, personality type, and what you're doing right or wrong.</p>
            </div>
          </div>
          {error && <div style={errorStyle}>{error}</div>}
          <div className="section-label">Paste conversation</div>
          <textarea
            className="coach-textarea"
            placeholder="Paste the full conversation (label messages as 'Her:' or 'Me:')"
            value={convoText}
            onChange={(e) => setConvoText(e.target.value)}
            style={{ height: 120, marginBottom: 12 }}
          />
          <button
            className="btn-primary"
            style={{ width: "100%", padding: 13, borderRadius: 10, opacity: convoText.trim().length < 10 ? .4 : 1 }}
            disabled={convoText.trim().length < 10}
            onClick={() => analyze(convoText)}
          >
            Analyze personality →
          </button>
          <div style={{ textAlign: "center", marginTop: 12 }}>
            <button onClick={() => analyze(DEMO_CONVO)}
              style={{ fontSize: 12, color: "var(--accent)", background: "none", border: "none" }}>
              Try demo conversation
            </button>
          </div>
        </>
      )}

      {loading && (
        <div style={{ paddingTop: 20 }}>
          <div className="hero hero-with-image" style={{ marginBottom: 16 }}>
            <img className="hero-img" src="/images/hero-profile.svg" alt="" aria-hidden="true" />
            <div className="hero-content">
              <div className="hero-eyebrow">🧠 Reading between the lines...</div>
              <h2>Analyzing</h2>
            </div>
          </div>
          <SkeletonPersonality />
        </div>
      )}

      {data && (
        <>
          <div className="section-label" style={{ marginTop: 4 }}>Personality analysis</div>

          <div className="insight-box" style={{ animation: "fadeScale 0.45s ease" }}>
            <div className="insight-label">AI insight</div>
            <p>"{data.insight}"</p>
          </div>

          {/* Animated score grid */}
          <div style={{
            display: "grid", gridTemplateColumns: "1fr 1fr",
            gap: 12, marginBottom: 14,
          }}>
            <MatchScore value={data.interest}    label="Interest"    color="#E8547A" delay={0}   />
            <MatchScore value={data.warmth}      label="Warmth"      color="#7C5CFC" delay={120} />
            <MatchScore value={data.playfulness} label="Playfulness" color="#22C55E" delay={240} />
            <MatchScore value={data.testing}     label="Testing"     color="#F59E0B" delay={360} />
          </div>

          {/* Trait bars */}
          <div className="card">
            <div className="card-title">Interest breakdown</div>
            {TRAIT_BARS.map((t, i) => (
              <div className="trait-row" key={t.label} style={{ animation: `slideUp 0.4s ease ${i * 80}ms both` }}>
                <div className="trait-label">{t.label}</div>
                <div className="trait-bar">
                  <div className="trait-fill" style={{
                    width: animated ? `${t.val}%` : "0%",
                    background: t.color,
                    transition: `width 1.2s cubic-bezier(0.22,1,.36,1) ${i * 120}ms`,
                  }} />
                </div>
                <div className="trait-value">{t.val}%</div>
              </div>
            ))}
          </div>

          <div className="card" style={{ animation: "slideUp 0.4s ease 0.2s both" }}>
            <div className="card-title">Personality type</div>
            <div className="pill-row">
              {(data.traits || []).map((trait, i) => (
                <span key={i} className={`pill ${PILL_CLASSES[i % PILL_CLASSES.length]}`}
                  style={{ animation: `slideUp 0.35s ease ${i * 60}ms both` }}>
                  {trait}
                </span>
              ))}
            </div>
          </div>

          <div className="card" style={{ animation: "slideUp 0.4s ease 0.3s both" }}>
            <div className="card-title">What went wrong</div>
            {(data.mistakes || []).map((m, i) => (
              <div key={i} className={`feedback-row ${m.type}`}
                style={{ animation: `slideUp 0.35s ease ${i * 70}ms both` }}>
                <span style={{ fontSize: 14, flexShrink: 0 }}>{m.type === "warn" ? "⚠️" : "✓"}</span>
                <span>{m.text}</span>
              </div>
            ))}
          </div>

          <button className="reset-btn" onClick={() => { setData(null); setConvoText(""); }}>
            ← Analyze different conversation
          </button>
        </>
      )}
    </div>
  );
}

const errorStyle = {
  background: "rgba(239,68,68,0.1)", border: "0.5px solid rgba(239,68,68,0.3)",
  borderRadius: 10, padding: "10px 14px", marginBottom: 14, fontSize: 13, color: "#FCA5A5",
};
