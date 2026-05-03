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
  const [activeTone, setActiveTone]         = useState(null);
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

  const TONES = [
    { key: "flirty",     label: "😏 Flirty"     },
    { key: "confident",  label: "💪 Confident"  },
    { key: "funny",      label: "😂 Funny"       },
    { key: "respectful", label: "🤝 Respectful" },
  ];

  return (
    <div style={screenWrap}>

      {/* ── Hero ─────────────────────────────────────── */}
      <div style={heroWrap}>
        <div style={heroBadge}>✨ AI Dating Assistant</div>
        <h1 style={heroHeadline}>Turn texts into<br /><span style={heroAccent}>attraction.</span></h1>
        <p style={heroSub}>Know exactly what to say — every time.</p>
      </div>

      {/* ── Live Chat Example Card ────────────────────── */}
      {stage === "upload" && !atLimit && (
        <div style={chatExCard}>
          <div style={chatExLabel}>🔥 Live example</div>
          <div style={chatExBubbleRow}>
            <div style={bubbleLeft}>
              <span style={bubbleName}>Her</span>
              <div style={bubbleMsgLeft}>hey</div>
            </div>
          </div>
          <div style={chatExBubbleRow}>
            <div style={bubbleRight}>
              <span style={{ ...bubbleName, textAlign: "right" }}>You</span>
              <div style={bubbleMsgRight}>hey wanna hang out sometime?</div>
            </div>
          </div>
          <div style={aiReplyRow}>
            <div style={aiReplyBadge}>⚡ Wingman AI</div>
            <div style={aiReplyMsg}>"Careful… you might start liking me 😏"</div>
          </div>
        </div>
      )}

      {error && <div style={errorStyle}>{error}</div>}

      {/* ── Upload Stage ─────────────────────────────── */}
      {stage === "upload" && !atLimit && (
        <>
          {/* Screenshot upload */}
          <button
            style={uploadCard}
            onClick={() => fileRef.current.click()}
            onMouseOver={(e) => { e.currentTarget.style.borderColor = "rgba(255,26,108,0.6)"; e.currentTarget.style.transform = "scale(1.01)"; }}
            onMouseOut={(e)  => { e.currentTarget.style.borderColor = "rgba(255,26,108,0.25)"; e.currentTarget.style.transform = "scale(1)"; }}
          >
            <div style={uploadIcon}>📱</div>
            <div style={uploadTitle}>Drop your screenshot here</div>
            <div style={uploadSub}>WhatsApp · Tinder · Instagram · iMessage</div>
          </button>
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif"
            style={{ display: "none" }} onChange={handleFileChange} />

          {/* Divider */}
          <div style={divider}><span style={dividerText}>or paste conversation</span></div>

          {/* Textarea */}
          <div style={textareaWrap}>
            <textarea
              style={textareaStyle}
              placeholder={"Her: hey 👋\nYou: hey, what's up?\n..."}
              value={convoText}
              onChange={(e) => setConvoText(e.target.value)}
              rows={4}
            />
          </div>

          {/* Tone chips */}
          <div style={toneRow}>
            {TONES.map((t) => (
              <button
                key={t.key}
                style={{ ...toneChip, ...(activeTone === t.key ? toneChipActive : {}) }}
                onClick={() => setActiveTone(activeTone === t.key ? null : t.key)}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Main CTA */}
          <button
            style={{ ...ctaBtn, opacity: convoText.trim().length < 5 ? 0.45 : 1 }}
            disabled={convoText.trim().length < 5}
            onClick={() => { setRejectedStyles([]); runAnalysis({ text: convoText }); }}
          >
            🔥 Get Perfect Reply
          </button>

          {/* Trust line */}
          <div style={trustLine}>🔒 Private · Secure · Used by 12,000+ users</div>

          {/* Demo link */}
          <div style={{ textAlign: "center", marginTop: 10 }}>
            <button
              onClick={() => { setRejectedStyles([]); runAnalysis({ text: DEMO_CONVO }); }}
              style={demoLink}
            >
              Try with demo conversation
            </button>
          </div>

          {!isPremium && !usageLoading && (
            <div style={usageNote}>
              {remaining?.analyze ?? 0} free analyses remaining today
            </div>
          )}
        </>
      )}

      {/* ── Limit gate ───────────────────────────────── */}
      {atLimit && <PremiumGate
        title="Daily limit reached"
        description="Upgrade for unlimited analyses, all personas, and deep personality insights."
        features={["Unlimited screenshot analyses","All 4 practice personas","Profile photo analyzer","Bio rewriter"]}
      />}

      {/* ── Typing/loading Stage ─────────────────────── */}
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

      {/* ── Replies Stage ────────────────────────────── */}
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

          {context && (
            <div style={contextCardStyle}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                <span style={{ ...chip, background: "rgba(232,84,122,0.15)", color: "#F08090" }}>
                  {STAGE_LABELS[context.stage] || context.stage}
                </span>
                <span style={{ ...chip, background: `${TEMP_COLORS[context.temperature]}22`, color: TEMP_COLORS[context.temperature] }}>
                  {context.temperature} vibe
                </span>
                {context.theyFeeling && (
                  <span style={{ ...chip, background: "rgba(124,92,252,0.15)", color: "#9B87F5" }}>
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

/* ─── Styles ──────────────────────────────────────────────────── */
const screenWrap = {
  padding: "0 0 24px",
};

/* Hero */
const heroWrap = {
  padding: "28px 20px 20px",
  textAlign: "center",
};
const heroBadge = {
  display: "inline-block",
  padding: "5px 14px",
  background: "rgba(255,26,108,0.12)",
  border: "1px solid rgba(255,26,108,0.28)",
  borderRadius: 20,
  fontSize: 11, fontWeight: 700, color: "#FF1A6C",
  fontFamily: "'Sora', sans-serif",
  letterSpacing: "0.4px",
  marginBottom: 12,
};
const heroHeadline = {
  margin: "0 0 8px",
  fontSize: 36, fontWeight: 900, lineHeight: 1.1,
  color: "#fff",
  fontFamily: "'Outfit', sans-serif",
  letterSpacing: "-0.5px",
};
const heroAccent = {
  background: "linear-gradient(135deg, #FF1A6C 0%, #A855F7 60%, #00D4FF 100%)",
  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
};
const heroSub = {
  margin: 0, fontSize: 15, color: "rgba(255,255,255,0.55)",
  fontFamily: "'Sora', sans-serif", lineHeight: 1.5,
};

/* Chat example card */
const chatExCard = {
  margin: "0 16px 18px",
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(157,78,221,0.25)",
  borderRadius: 18,
  padding: "16px 16px 14px",
  backdropFilter: "blur(16px)",
  WebkitBackdropFilter: "blur(16px)",
  boxShadow: "0 4px 32px rgba(157,78,221,0.12)",
};
const chatExLabel = {
  fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.35)",
  fontFamily: "'Sora', sans-serif", letterSpacing: "0.8px",
  textTransform: "uppercase", marginBottom: 10,
};
const chatExBubbleRow = { marginBottom: 6 };
const bubbleName = {
  display: "block", fontSize: 9, fontWeight: 700,
  color: "rgba(255,255,255,0.3)", fontFamily: "'Sora', sans-serif",
  letterSpacing: "0.5px", textTransform: "uppercase", marginBottom: 3,
};
const bubbleLeft = { maxWidth: "70%" };
const bubbleRight = { maxWidth: "70%", marginLeft: "auto" };
const bubbleMsgLeft = {
  display: "inline-block",
  background: "rgba(255,255,255,0.09)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "14px 14px 14px 4px",
  padding: "8px 12px", fontSize: 13, color: "#fff",
  fontFamily: "'Sora', sans-serif",
};
const bubbleMsgRight = {
  display: "inline-block",
  background: "rgba(157,78,221,0.22)",
  border: "1px solid rgba(157,78,221,0.3)",
  borderRadius: "14px 14px 4px 14px",
  padding: "8px 12px", fontSize: 13, color: "#E0CFFF",
  fontFamily: "'Sora', sans-serif",
};
const aiReplyRow = {
  marginTop: 10,
  background: "linear-gradient(135deg, rgba(255,26,108,0.12), rgba(168,85,247,0.14))",
  border: "1px solid rgba(255,26,108,0.28)",
  borderRadius: 12, padding: "10px 12px",
};
const aiReplyBadge = {
  fontSize: 10, fontWeight: 700, color: "#FF1A6C",
  fontFamily: "'Sora', sans-serif", letterSpacing: "0.4px",
  marginBottom: 5,
};
const aiReplyMsg = {
  fontSize: 14, fontWeight: 600, color: "#fff",
  fontFamily: "'Outfit', sans-serif",
};

/* Upload card */
const uploadCard = {
  width: "calc(100% - 32px)",
  margin: "0 16px 10px",
  display: "flex", flexDirection: "column", alignItems: "center",
  gap: 6,
  padding: "22px 16px",
  background: "rgba(255,255,255,0.04)",
  border: "1.5px dashed rgba(255,26,108,0.25)",
  borderRadius: 18,
  cursor: "pointer",
  transition: "all 0.2s ease",
  backdropFilter: "blur(12px)",
  WebkitBackdropFilter: "blur(12px)",
};
const uploadIcon = { fontSize: 32, marginBottom: 2 };
const uploadTitle = {
  fontSize: 15, fontWeight: 700, color: "#fff",
  fontFamily: "'Outfit', sans-serif",
};
const uploadSub = {
  fontSize: 11, color: "rgba(255,255,255,0.38)",
  fontFamily: "'Sora', sans-serif",
};

/* Divider */
const divider = {
  display: "flex", alignItems: "center", gap: 10,
  margin: "14px 16px 12px",
};
const dividerText = {
  fontSize: 11, color: "rgba(255,255,255,0.25)",
  fontFamily: "'Sora', sans-serif", whiteSpace: "nowrap",
  padding: "0 4px",
  borderTop: "1px solid rgba(255,255,255,0.08)",
  width: "100%", textAlign: "center", lineHeight: 0,
  paddingTop: 8,
};

/* Textarea */
const textareaWrap = { padding: "0 16px", marginBottom: 12 };
const textareaStyle = {
  width: "100%", boxSizing: "border-box",
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(157,78,221,0.25)",
  borderRadius: 14, padding: "12px 14px",
  color: "#fff", fontSize: 13, lineHeight: 1.6,
  fontFamily: "'Sora', sans-serif",
  resize: "none", outline: "none",
};

/* Tone chips */
const toneRow = {
  display: "flex", gap: 8, flexWrap: "wrap",
  padding: "0 16px", marginBottom: 16,
};
const toneChip = {
  padding: "7px 14px",
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 20, fontSize: 12, fontWeight: 600,
  color: "rgba(255,255,255,0.55)",
  fontFamily: "'Sora', sans-serif",
  cursor: "pointer", transition: "all 0.18s ease",
};
const toneChipActive = {
  background: "linear-gradient(135deg, rgba(255,26,108,0.2), rgba(168,85,247,0.2))",
  border: "1px solid rgba(255,26,108,0.5)",
  color: "#FF1A6C",
  boxShadow: "0 0 12px rgba(255,26,108,0.2)",
};

/* CTA */
const ctaBtn = {
  display: "block", width: "calc(100% - 32px)",
  margin: "0 16px",
  padding: "16px 24px",
  background: "linear-gradient(135deg, #FF1A6C 0%, #A855F7 100%)",
  border: "none", borderRadius: 16,
  color: "#fff", fontSize: 17, fontWeight: 800,
  fontFamily: "'Outfit', sans-serif",
  cursor: "pointer",
  boxShadow: "0 8px 32px rgba(255,26,108,0.45), 0 0 0 1px rgba(255,26,108,0.2)",
  letterSpacing: "-0.2px",
  transition: "opacity 0.2s",
};

/* Trust line */
const trustLine = {
  textAlign: "center", marginTop: 12,
  fontSize: 11, color: "rgba(255,255,255,0.28)",
  fontFamily: "'Sora', sans-serif", letterSpacing: "0.2px",
};

/* Demo link */
const demoLink = {
  fontSize: 12, color: "var(--accent)",
  background: "none", border: "none",
  cursor: "pointer", fontFamily: "'Sora', sans-serif",
  textDecoration: "underline",
};

/* Usage note */
const usageNote = {
  textAlign: "center", marginTop: 10,
  fontSize: 11, color: "var(--text3)",
  fontFamily: "'Sora', sans-serif",
};

/* Misc */
const errorStyle = {
  margin: "0 16px 14px",
  background: "rgba(239,68,68,0.1)", border: "0.5px solid rgba(239,68,68,0.3)",
  borderRadius: 12, padding: "10px 14px", fontSize: 13, color: "#FCA5A5",
  fontFamily: "'Sora', sans-serif",
};
const previewStyle = {
  margin: "0 16px 14px", borderRadius: 14, overflow: "hidden",
  border: "1px solid rgba(157,78,221,0.2)", maxHeight: 340,
  boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
};
const contextCardStyle = {
  margin: "0 16px 14px",
  background: "linear-gradient(135deg, rgba(232,84,122,0.07), rgba(124,92,252,0.07))",
  border: "1px solid rgba(232,84,122,0.2)",
  borderRadius: 14, padding: "12px 14px",
  backdropFilter: "blur(12px)",
  WebkitBackdropFilter: "blur(12px)",
  animation: "fadeScale .35s ease",
};
const chip = {
  padding: "4px 10px", borderRadius: 20,
  fontSize: 10, fontWeight: 600,
  letterSpacing: "0.3px", textTransform: "capitalize",
  fontFamily: "'Sora', sans-serif",
};
