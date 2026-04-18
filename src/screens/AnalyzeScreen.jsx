import { useState, useRef } from "react";
import { analyzeScreenshot } from "../lib/claude";

const DEMO_CONVO = `Her: A million random thoughts, but talking to you is definitely the nicest one right now 🌙
Her: worth it if it means you're thinking about me too`;

export default function AnalyzeScreen() {
  const [stage, setStage]       = useState("upload"); // upload | typing | replies
  const [replies, setReplies]   = useState([]);
  const [copied, setCopied]     = useState(null);
  const [convoText, setConvoText] = useState("");
  const [submittedText, setSubmittedText] = useState("");
  const [error, setError]       = useState("");
  const fileRef = useRef();

  function parseConvoBubbles(text) {
    return text.split("\n").filter(Boolean).map((line) => {
      const match = line.match(/^(Her|Me|Him|Them|You):\s*(.+)/i);
      if (match) return { side: match[1].toLowerCase() === "me" || match[1].toLowerCase() === "you" ? "you" : "them", text: match[2] };
      return { side: "them", text: line };
    });
  }

  async function handleUpload(text) {
    setSubmittedText(text);
    setStage("typing");
    setError("");
    try {
      const result = await analyzeScreenshot(text);
      setReplies(result);
      setStage("replies");
    } catch (e) {
      setError("Couldn't reach AI — check your API key.");
      setStage("upload");
    }
  }

  function handleFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    // In production: send to OCR endpoint. For demo, use placeholder text.
    const reader = new FileReader();
    reader.onload = () => handleUpload(DEMO_CONVO);
    reader.readAsDataURL(file);
  }

  function copyReply(text, idx) {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(idx);
    setTimeout(() => setCopied(null), 2000);
  }

  function reset() {
    setStage("upload");
    setReplies([]);
    setConvoText("");
    setError("");
  }

  const TAG_COLORS = {
    flirty:    "#E8547A",
    funny:     "#F59E0B",
    confident: "#7C5CFC",
    emotional: "#22C55E",
  };

  return (
    <div>
      <div className="hero hero-with-image">
        <img className="hero-img" src="/images/hero-analyze.svg" alt="" aria-hidden="true" />
        <div className="hero-content">
          <div className="hero-eyebrow">✦ AI Wingman</div>
          <h2>Get the perfect reply</h2>
          <p>Upload any chat screenshot — we'll read the room and write your best move.</p>
        </div>
      </div>

      {error && (
        <div style={{ background: "rgba(239,68,68,0.1)", border: "0.5px solid rgba(239,68,68,0.3)", borderRadius: 10, padding: "10px 14px", marginBottom: 14, fontSize: 13, color: "#FCA5A5" }}>
          {error}
        </div>
      )}

      {stage === "upload" && (
        <>
          <button className="upload-area" onClick={() => fileRef.current.click()}>
            <div className="upload-icon">📱</div>
            <h3>Drop your screenshot here</h3>
            <p>WhatsApp · Tinder · Instagram · iMessage</p>
          </button>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFileChange} />

          <div className="section-label">Or paste conversation text</div>
          <textarea
            className="coach-textarea"
            placeholder="Paste chat messages here..."
            value={convoText}
            onChange={(e) => setConvoText(e.target.value)}
            style={{ height: 100, marginBottom: 10 }}
          />
          <button
            className="btn-primary"
            style={{ width: "100%", padding: 13, borderRadius: 10, opacity: convoText.trim().length < 5 ? .4 : 1 }}
            disabled={convoText.trim().length < 5}
            onClick={() => handleUpload(convoText)}
          >
            Analyze conversation →
          </button>

          <div style={{ textAlign: "center", marginTop: 14 }}>
            <button onClick={() => handleUpload(DEMO_CONVO)} style={{ fontSize: 12, color: "var(--accent)", background: "none", border: "none" }}>
              Try with demo conversation
            </button>
          </div>
        </>
      )}

      {stage === "typing" && (
        <>
          <div className="chat-preview">
            {parseConvoBubbles(submittedText).map((b, i) => (
              <div key={i} className={`bubble bubble-${b.side}`}>{b.text}</div>
            ))}
          </div>
          <div className="typing-wrap">
            <div className="typing-indicator">
              <div className="dot" /><div className="dot" /><div className="dot" />
            </div>
            <span style={{ fontSize: 12, color: "var(--text2)" }}>AI is reading the vibe...</span>
          </div>
        </>
      )}

      {stage === "replies" && (
        <>
          <div className="chat-preview">
            {parseConvoBubbles(submittedText).map((b, i) => (
              <div key={i} className={`bubble bubble-${b.side}`}>{b.text}</div>
            ))}
          </div>

          <div className="section-label">AI reply suggestions</div>
          <div className="reply-stack">
            {replies.map((r, i) => (
              <div
                key={i}
                className={`reply-card ${i === 0 ? "best-match" : ""}`}
              >
                {i === 0 && <span className="best-badge">Best match</span>}
                <div className="reply-tag" style={{ color: TAG_COLORS[r.type] || "var(--accent)" }}>
                  {r.emoji} {r.type}
                </div>
                <div className="reply-text">{r.text}</div>
                <button className="copy-btn" onClick={() => copyReply(r.text, i)}>
                  {copied === i ? "Copied!" : "Copy reply ↗"}
                </button>
              </div>
            ))}
          </div>

          <div className="share-hook">
            <p>"This AI fixed my dating life" — share your best reply</p>
            <button onClick={() => {
              const text = "Check out AI Dating Wingman — it writes your best replies ✨";
              if (navigator.share) { navigator.share({ title: "AI Wingman", text }).catch(() => {}); }
              else { navigator.clipboard.writeText(text).catch(() => {}); }
            }}>Share ↗</button>
          </div>

          <button className="reset-btn" onClick={reset}>← Analyze another screenshot</button>
        </>
      )}
    </div>
  );
}
