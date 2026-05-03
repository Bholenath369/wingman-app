import { useState, useRef, useEffect } from "react";
import { analyzeScreenshotSmart, analyzeScreenshotImageSmart } from "../lib/claude";
import { getWingmanReply } from "../lib/instantReplies";
import { useUsage } from "../lib/useUsage";
import { staggerIn, haptic } from "../lib/animations";
import PremiumGate from "../components/PremiumGate";
import ReplyCard from "../components/ReplyCard";
import { SkeletonReplyCards } from "../components/SkeletonLoader";

const DEMO_CONVO = `Her: A million random thoughts, but talking to you is definitely the nicest one right now 🌙
Her: worth it if it means you're thinking about me too`;

const STAGE_LABELS = {
  first_message: "First message", early_chat: "Early chat",
  building_rapport: "Building rapport", dying_conversation: "Fading out",
  post_date: "After the date",
};
const TEMP_COLORS = { cold: "#60A5FA", cool: "#22D3EE", warm: "#FBBF24", hot: "#F43F5E" };

export default function AnalyzeScreen() {
  const [stage, setStage]           = useState("upload");
  const [replies, setReplies]       = useState([]);
  const [context, setContext]       = useState(null);
  const [convoText, setConvoText]   = useState("");
  const [submittedText, setSubmittedText] = useState("");
  const [previewImage, setPreviewImage]   = useState(null);
  const [error, setError]           = useState("");
  const [rejectedStyles, setRejectedStyles] = useState([]);
  const [currentSource, setCurrentSource]   = useState(null);
  const [currentFile, setCurrentFile]       = useState(null);
  const fileRef   = useRef();
  const repliesRef = useRef();
  const { consume, remaining, isPremium, loading: usageLoading } = useUsage();

  // Stagger animate reply cards when they appear
  useEffect(() => {
    if (stage === "replies" && repliesRef.current) {
      staggerIn(repliesRef.current, 90);
    }
  }, [stage, replies]);

  function parseConvoBubbles(text) {
    return text.split("\n").filter(Boolean).map((line) => {
      const match = line.match(/^(Her|Me|Him|Them|You):\s*(.+)/i);
      if (match) return {
        side: ["me","you"].includes(match[1].toLowerCase()) ? "you" : "them",
        text: match[2],
      };
      return { side: "them", text: line };
    });
  }

  async function runAnalysis({ text = null, file = null, avoid = [] }) {
    const check = await consume("analyze");
    if (!check.allowed) { setError("Daily limit reached. Upgrade to Premium."); return; }

    setError("");
    setStage("typing");
    if (text)  { setSubmittedText(text); setPreviewImage(null); setCurrentSource("text"); }
    if (file)  {
      if (previewImage) URL.revokeObjectURL(previewImage);
      setPreviewImage(URL.createObjectURL(file));
      setSubmittedText(""); setCurrentSource("image"); setCurrentFile(file);
    }

    try {
      const result = text
        ? avoid.length === 0
          ? await getWingmanReply(text, analyzeScreenshotSmart)
          : await analyzeScreenshotSmart(text, { avoidStyles: avoid })
        : await analyzeScreenshotImageSmart(file, { avoidStyles: avoid });
      setContext(result.context);
      setReplies(result.replies);
      haptic("success");
      setStage("replies");
    } catch (e) {
      setError(e.message || "Analysis failed. Try again.");
      setStage("upload");
    }
  }

  async function handleThumbsDown(styleKey) {
    const newAvoid = [...rejectedStyles, styleKey];
    setRejectedStyles(newAvoid);
    setStage("typing");
    if (currentSource === "text") await runAnalysis({ text: submittedText, avoid: newAvoid });
    else if (currentFile) await runAnalysis({ file: currentFile, avoid: newAvoid });
  }

  function handleFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setError("Image too large. Max 5MB."); return; }
    setRejectedStyles([]);
    runAnalysis({ file });
  }

  function reset() {
    if (previewImage) URL.revokeObjectURL(previewImage);
    setStage("upload"); setReplies([]); setContext(null);
    setConvoText(""); setSubmittedText(""); setPreviewImage(null);
    setCurrentFile(null); setCurrentSource(null); setRejectedStyles([]); setError("");
  }

  const atLimit = !usageLoading && !isPremium && (remaining?.analyze ?? 0) === 0;

  return (
    <div>
      <div className="hero hero-gradient">
        <div className="hero-illustration">📱</div>
        <div className="hero-content">
          <div className="hero-eyebrow">✨ Your move</div>
          <h2>Say exactly the right thing</h2>
          <p>We read the vibe so you always know what to say next.</p>
        </div>
      </div>

      {error && <div style={errorStyle}>{error}</div>}

      {stage === "upload" && !atLimit && (
        <>
          <button
            className="upload-area"
            onClick={() => fileRef.current.click()}
            onMouseOver={(e) => { e.currentTarget.style.transform = "scale(1.01)"; }}
            onMouseOut={(e)  => { e.currentTarget.style.transform = ""; }}
            style={{ transition: "transform 0.2s cubic-bezier(0.34,1.56,0.64,1)" }}
          >
            <div className="upload-icon" style={{ animation: "emojiFloat 2.5s ease-in-out infinite" }}>📱</div>
            <h3>Drop your screenshot here</h3>
            <p>WhatsApp · Tinder · Instagram · iMessage</p>
          </button>
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif"
            style={{ display: "none" }} onChange={handleFileChange} />

          <div className="section-label">Or paste conversation text</div>
          <textarea className="coach-textarea"
            placeholder="Paste chat messages here..."
            value={convoText}
            onChange={(e) => setConvoText(e.target.value)}
            style={{ height: 100, marginBottom: 10 }}
          />
          <button
            className="btn-primary"
            style={{ width: "100%", padding: 13, borderRadius: 10, opacity: convoText.trim().length < 5 ? .4 : 1 }}
            disabled={convoText.trim().length < 5}
            onClick={() => { setRejectedStyles([]); runAnalysis({ text: convoText }); }}
          >
            Analyze conversation →
          </button>
          <div style={{ textAlign: "center", marginTop: 14 }}>
            <button
              onClick={() => { setRejectedStyles([]); runAnalysis({ text: DEMO_CONVO }); }}
              style={{ fontSize: 12, color: "var(--accent)", background: "none", border: "none" }}
            >
              Try with demo conversation
            </button>
          </div>
          {!isPremium && !usageLoading && (
            <div style={{ textAlign: "center", marginTop: 12, fontSize: 12, color: "var(--text3)" }}>
              {remaining?.analyze ?? 0} free analyses remaining today
            </div>
          )}
        </>
      )}

      {atLimit && <PremiumGate
        title="Daily limit reached"
        description="Upgrade for unlimited analyses, all personas, and deep personality insights."
        features={["Unlimited screenshot analyses","All 4 practice personas","Profile photo analyzer","Bio rewriter"]}
      />}

      {stage === "typing" && (
        <>
          {previewImage
            ? <div style={previewStyle}><img src={previewImage} alt="" style={{ width: "100%", display: "block" }} /></div>
            : <div className="chat-preview">
                {parseConvoBubbles(submittedText).map((b, i) => (
                  <div key={i} className={`bubble bubble-${b.side}`}>{b.text}</div>
                ))}
              </div>
          }
          <SkeletonReplyCards />
        </>
      )}

      {stage === "replies" && (
        <>
          {previewImage
            ? <div style={previewStyle}><img src={previewImage} alt="" style={{ width: "100%", display: "block" }} /></div>
            : <div className="chat-preview">
                {parseConvoBubbles(submittedText).map((b, i) => (
                  <div key={i} className={`bubble bubble-${b.side}`}>{b.text}</div>
                ))}
              </div>
          }

          {/* Context card */}
          {context && (
            <div style={contextCardStyle}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                <span style={{ ...chip, background: "rgba(232,84,122,0.12)", color: "#F08090" }}>
                  {STAGE_LABELS[context.stage] || context.stage}
                </span>
                <span style={{ ...chip, background: `${TEMP_COLORS[context.temperature]}22`, color: TEMP_COLORS[context.temperature] }}>
                  {context.temperature} vibe
                </span>
                {context.theyFeeling && (
                  <span style={{ ...chip, background: "rgba(124,92,252,0.12)", color: "#9B87F5" }}>
                    {context.theyFeeling}
                  </span>
                )}
              </div>
              {context.risk && (
                <div style={{ marginTop: 8, fontSize: 11, color: "rgba(255,255,255,0.55)" }}>
                  <span style={{ color: "#FBBF24" }}>⚠ </span>
                  Avoid: {context.risk.replace(/_/g, " ")}
                </div>
              )}
            </div>
          )}

          <div className="section-label">AI reply suggestions</div>
          <div ref={repliesRef} className="reply-stack">
            {replies.map((r, i) => (
              <ReplyCard
                key={`${r.type}-${rejectedStyles.length}`}
                reply={r}
                index={i}
                isBest={i === 0}
                onThumbsDown={handleThumbsDown}
              />
            ))}
          </div>

          {rejectedStyles.length > 0 && (
            <div style={{ textAlign: "center", fontSize: 11, color: "var(--text3)", marginTop: 4, fontStyle: "italic" }}>
              ✓ Avoiding: {rejectedStyles.join(", ")}
            </div>
          )}

          <div className="share-hook">
            <p>"This AI fixed my dating life" — share your best reply</p>
            <button onClick={() => {
              const text = "Check out AI Dating Wingman — it writes your best replies ✨";
              if (navigator.share) navigator.share({ title: "AI Wingman", text }).catch(() => {});
              else navigator.clipboard.writeText(text).catch(() => {});
            }}>Share ↗</button>
          </div>

          <button className="reset-btn" onClick={reset}>← Analyze another screenshot</button>
        </>
      )}
    </div>
  );
}

const errorStyle = {
  background: "rgba(239,68,68,0.1)", border: "0.5px solid rgba(239,68,68,0.3)",
  borderRadius: 10, padding: "10px 14px", marginBottom: 14, fontSize: 13, color: "#FCA5A5",
};
const previewStyle = {
  marginBottom: 14, borderRadius: 12, overflow: "hidden",
  border: "0.5px solid var(--border)", maxHeight: 340,
};
const contextCardStyle = {
  background: "linear-gradient(135deg, rgba(232,84,122,0.06), rgba(124,92,252,0.06))",
  border: "0.5px solid rgba(232,84,122,0.18)",
  borderRadius: 12, padding: "12px 14px", marginBottom: 14,
  animation: "fadeScale .35s ease",
};
const chip = {
  padding: "4px 10px", borderRadius: 20,
  fontSize: 10, fontWeight: 600,
  letterSpacing: "0.3px", textTransform: "capitalize",
};
