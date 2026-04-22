import { useState, useRef, useEffect } from "react";
import { simulateReply, scoreConversation } from "../lib/claude";
import { useUsage } from "../lib/useUsage";
import PremiumGate from "../components/PremiumGate";

const PERSONAS = [
  {
    key: "cold",
    emoji: "🥶",
    name: "Sofia",
    label: "Cold girl",
    desc: "Hard to impress, tests you constantly",
    bgColor: "rgba(148,163,184,0.15)",
    opener: "Hey. So you finally texted.",
    free: true,
  },
  {
    key: "interested",
    emoji: "😊",
    name: "Mia",
    label: "Interested",
    desc: "Warm, open, but won't chase",
    bgColor: "rgba(232,84,122,0.12)",
    opener: "Oh hi! I was actually thinking about you.",
    free: false,
  },
  {
    key: "highvalue",
    emoji: "👑",
    name: "Alex",
    label: "High value",
    desc: "Confident, busy, selective",
    bgColor: "rgba(124,92,252,0.12)",
    opener: "I have 10 minutes. Make it count.",
    free: false,
  },
  {
    key: "shy",
    emoji: "🌸",
    name: "Lily",
    label: "Shy type",
    desc: "Introverted, opens up slowly",
    bgColor: "rgba(34,197,94,0.12)",
    opener: "Oh... hey. Um, hi.",
    free: false,
  },
];

const FREE_MSG_CAP = 10;

export default function SimulateScreen() {
  const [persona, setPersona]   = useState(PERSONAS[0]);
  const [messages, setMessages] = useState([{ role: "assistant", content: PERSONAS[0].opener }]);
  const [input, setInput]       = useState("");
  const [typing, setTyping]     = useState(false);
  const [error, setError]       = useState("");
  const [scoreData, setScoreData] = useState(null);
  const [scoring, setScoring]   = useState(false);
  const messagesRef = useRef();
  const { consume, isPremium, loading: usageLoading } = useUsage();

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages, typing]);

  const userMessageCount = messages.filter((m) => m.role === "user").length;
  const atMsgCap = !isPremium && userMessageCount >= FREE_MSG_CAP;

  function selectPersona(p) {
    if (!p.free && !isPremium) {
      setError(`${p.name} is a Premium persona. Upgrade to unlock.`);
      return;
    }
    setPersona(p);
    setMessages([{ role: "assistant", content: p.opener }]);
    setInput("");
    setError("");
    setScoreData(null);
  }

  async function send() {
    const msg = input.trim();
    if (!msg || typing || atMsgCap) return;

    const check = await consume("simulate");
    if (!check.allowed) {
      setError("Daily limit reached. Upgrade for unlimited practice.");
      return;
    }

    setInput("");
    setError("");

    const newHistory = [...messages, { role: "user", content: msg }];
    setMessages(newHistory);
    setTyping(true);

    try {
      const reply = await simulateReply(persona.key, messages, msg);
      setMessages([...newHistory, { role: "assistant", content: reply.trim() }]);
    } catch {
      setError("Couldn't reach AI — try again.");
      setMessages(newHistory);
    } finally {
      setTyping(false);
    }
  }

  async function handleScore() {
    if (!isPremium) {
      setError("Conversation scoring is a Premium feature.");
      return;
    }
    const check = await consume("score");
    if (!check.allowed) {
      setError("Daily scoring limit reached.");
      return;
    }
    setScoring(true);
    setError("");
    try {
      const result = await scoreConversation(messages, persona.key);
      setScoreData(result);
    } catch {
      setError("Couldn't score that conversation.");
    } finally {
      setScoring(false);
    }
  }

  function resetConversation() {
    setMessages([{ role: "assistant", content: persona.opener }]);
    setScoreData(null);
    setError("");
  }

  return (
    <div>
      <div className="hero hero-with-image" style={{ marginBottom: 16 }}>
        <img className="hero-img" src="/images/hero-simulate.svg" alt="" aria-hidden="true" />
        <div className="hero-content">
          <div className="hero-eyebrow">🎭 Simulation Mode</div>
          <h2>Practice makes perfect</h2>
          <p>Chat with AI personas that respond realistically. Get comfortable before the real thing.</p>
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

      <div className="section-label">Choose a persona</div>
      <div className="persona-grid">
        {PERSONAS.map((p) => {
          const locked = !p.free && !isPremium;
          return (
            <div
              key={p.key}
              className={`persona-card ${persona.key === p.key ? "selected" : ""}`}
              style={{ opacity: locked ? 0.55 : 1, position: "relative" }}
              onClick={() => selectPersona(p)}
            >
              {locked && (
                <span style={{
                  position: "absolute",
                  top: 8,
                  right: 10,
                  fontSize: 11,
                  color: "var(--accent)",
                }}>🔒</span>
              )}
              <div className="persona-avatar" style={{ background: p.bgColor }}>{p.emoji}</div>
              <h4>{p.label}</h4>
              <p>{p.desc}</p>
            </div>
          );
        })}
      </div>

      <div className="sim-chat">
        <div className="sim-header">
          <div className="sim-avatar">{persona.emoji}</div>
          <div className="sim-header-info">
            <h4>{persona.name} ({persona.label})</h4>
            <p>AI persona — practice safely</p>
          </div>
          {isPremium && <span className="premium-badge">Premium</span>}
        </div>

        <div className="sim-messages" ref={messagesRef}>
          {messages.map((m, i) => (
            <div
              key={i}
              className={`bubble ${m.role === "user" ? "bubble-you" : "bubble-them"}`}
              style={{
                alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                animation: "slideUp .2s ease",
              }}
            >
              {m.content}
            </div>
          ))}
          {typing && (
            <div className="typing-indicator" style={{ alignSelf: "flex-start" }}>
              <div className="dot" /><div className="dot" /><div className="dot" />
            </div>
          )}
        </div>

        <div className="sim-input-row">
          <input
            className="sim-input"
            placeholder={atMsgCap ? "Message cap reached — upgrade for unlimited" : "Type your reply..."}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            disabled={atMsgCap}
          />
          <button className="send-btn" onClick={send} disabled={typing || atMsgCap}>→</button>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 12, justifyContent: "center" }}>
        <button
          onClick={resetConversation}
          style={{
            fontSize: 12,
            color: "var(--text2)",
            background: "none",
            border: "none",
            textDecoration: "underline",
            textUnderlineOffset: 3,
          }}
        >
          Reset conversation
        </button>
        {userMessageCount >= 3 && (
          <button
            onClick={handleScore}
            disabled={scoring}
            style={{
              fontSize: 12,
              color: "var(--accent)",
              background: "none",
              border: "none",
              textDecoration: "underline",
              textUnderlineOffset: 3,
            }}
          >
            {scoring ? "Scoring..." : "Score my performance →"}
          </button>
        )}
      </div>

      {scoreData && (
        <div className="card" style={{ marginTop: 16 }}>
          <div className="card-title">Your conversation score</div>

          <div style={{ textAlign: "center", margin: "12px 0 18px" }}>
            <div style={{
              fontFamily: "var(--font-display)",
              fontSize: 42,
              color: "var(--accent)",
              lineHeight: 1,
            }}>{scoreData.overall}</div>
            <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 4 }}>OVERALL</div>
          </div>

          {Object.entries(scoreData.scores || {}).map(([k, v]) => (
            <div className="trait-row" key={k}>
              <div className="trait-label" style={{ textTransform: "capitalize" }}>{k}</div>
              <div className="trait-bar">
                <div
                  className="trait-fill"
                  style={{
                    width: `${v}%`,
                    background: "linear-gradient(90deg,#E8547A,#7C5CFC)",
                  }}
                />
              </div>
              <div className="trait-value">{v}%</div>
            </div>
          ))}

          {scoreData.strengths?.length > 0 && (
            <>
              <div className="card-title" style={{ marginTop: 16 }}>Strengths</div>
              {scoreData.strengths.map((s, i) => (
                <div key={i} className="feedback-row good">
                  <span style={{ fontSize: 14, flexShrink: 0 }}>✓</span>
                  <span>{s}</span>
                </div>
              ))}
            </>
          )}

          {scoreData.improvements?.length > 0 && (
            <>
              <div className="card-title" style={{ marginTop: 12 }}>Work on this</div>
              {scoreData.improvements.map((s, i) => (
                <div key={i} className="feedback-row warn">
                  <span style={{ fontSize: 14, flexShrink: 0 }}>→</span>
                  <span>{s}</span>
                </div>
              ))}
            </>
          )}

          {scoreData.nextMove && (
            <div className="insight-box" style={{ marginTop: 12 }}>
              <div className="insight-label">Next move</div>
              <p>{scoreData.nextMove}</p>
            </div>
          )}
        </div>
      )}

      {!isPremium && !usageLoading && (
        <PremiumGate
          title="Unlock all 4 personas + scoring"
          description="Get graded on every conversation, unlock all personas, and practice without limits."
          features={[
            "All 4 practice personas (Mia, Alex, Lily unlocked)",
            "Unlimited message length",
            "AI conversation scoring after every practice",
            "Specific feedback on confidence, humor, and pacing",
            "Plus: unlimited rewrites, analyses, and photo analyzer",
          ]}
        />
      )}
    </div>
  );
}
