import { useState, useRef, useEffect } from "react";
import { simulateReply } from "../lib/claude";

const PERSONAS = [
  {
    key: "cold",
    emoji: "🥶",
    name: "Sofia",
    label: "Cold girl",
    desc: "Hard to impress, tests you constantly",
    bgColor: "rgba(148,163,184,0.15)",
    opener: "Hey. So you finally texted.",
  },
  {
    key: "interested",
    emoji: "😊",
    name: "Mia",
    label: "Interested",
    desc: "Warm, open, but won't chase",
    bgColor: "rgba(232,84,122,0.12)",
    opener: "Oh hi! I was actually thinking about you.",
  },
  {
    key: "highvalue",
    emoji: "👑",
    name: "Alex",
    label: "High value",
    desc: "Confident, busy, selective",
    bgColor: "rgba(124,92,252,0.12)",
    opener: "I have 10 minutes. Make it count.",
  },
  {
    key: "shy",
    emoji: "🌸",
    name: "Lily",
    label: "Shy type",
    desc: "Introverted, opens up slowly",
    bgColor: "rgba(34,197,94,0.12)",
    opener: "Oh... hey. Um, hi.",
  },
];

export default function SimulateScreen() {
  const [persona, setPersona]     = useState(PERSONAS[0]);
  const [messages, setMessages]   = useState([{ role: "assistant", content: PERSONAS[0].opener }]);
  const [input, setInput]         = useState("");
  const [typing, setTyping]       = useState(false);
  const [error, setError]         = useState("");
  const messagesRef = useRef();

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages, typing]);

  function selectPersona(p) {
    setPersona(p);
    setMessages([{ role: "assistant", content: p.opener }]);
    setInput("");
    setError("");
  }

  async function send() {
    const msg = input.trim();
    if (!msg || typing) return;
    setInput("");
    setError("");

    const newHistory = [...messages, { role: "user", content: msg }];
    setMessages(newHistory);
    setTyping(true);

    try {
      const reply = await simulateReply(persona.key, messages, msg);
      setMessages([...newHistory, { role: "assistant", content: reply.trim() }]);
    } catch {
      setError("Couldn't reach AI — check your API key.");
      setMessages(newHistory);
    } finally {
      setTyping(false);
    }
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
        <div style={{ background: "rgba(239,68,68,0.1)", border: "0.5px solid rgba(239,68,68,0.3)", borderRadius: 10, padding: "10px 14px", marginBottom: 14, fontSize: 13, color: "#FCA5A5" }}>
          {error}
        </div>
      )}

      <div className="section-label">Choose a persona</div>
      <div className="persona-grid">
        {PERSONAS.map((p) => (
          <div
            key={p.key}
            className={`persona-card ${persona.key === p.key ? "selected" : ""}`}
            onClick={() => selectPersona(p)}
          >
            <div className="persona-avatar" style={{ background: p.bgColor }}>{p.emoji}</div>
            <h4>{p.label}</h4>
            <p>{p.desc}</p>
          </div>
        ))}
      </div>

      <div className="sim-chat">
        <div className="sim-header">
          <div className="sim-avatar">{persona.emoji}</div>
          <div className="sim-header-info">
            <h4>{persona.name} ({persona.label})</h4>
            <p>AI persona — practice safely</p>
          </div>
          <span className="premium-badge">Premium</span>
        </div>

        <div className="sim-messages" ref={messagesRef}>
          {messages.map((m, i) => (
            <div
              key={i}
              className={`bubble ${m.role === "user" ? "bubble-you" : "bubble-them"}`}
              style={{ alignSelf: m.role === "user" ? "flex-end" : "flex-start", animation: "slideUp .2s ease" }}
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
            placeholder="Type your reply..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
          />
          <button className="send-btn" onClick={send} disabled={typing}>→</button>
        </div>
      </div>

      <div style={{ textAlign: "center", marginTop: 12 }}>
        <button
          onClick={() => selectPersona(persona)}
          style={{ fontSize: 12, color: "var(--text2)", background: "none", border: "none", textDecoration: "underline", textUnderlineOffset: 3 }}
        >
          Reset conversation
        </button>
      </div>

      <div className="premium-gate">
        <h3>Unlock all 4 personas + scoring</h3>
        <p>Get graded on each reply, see what attraction patterns you trigger, and unlock unlimited practice sessions.</p>
        <button className="premium-btn">Go Premium — $9.99/mo</button>
      </div>
    </div>
  );
}
