// src/components/ReplyCard.jsx
import { useEffect, useRef, useState } from "react";
import { confettiBurst, floatEmoji, addRipple, haptic } from "../lib/animations";
import SendToApp from "./SendToApp";

const TAG_COLORS = {
  flirty:    { color: "#E8547A", bg: "rgba(232,84,122,0.08)", emoji: "😏" },
  funny:     { color: "#F59E0B", bg: "rgba(245,158,11,0.08)",  emoji: "😂" },
  confident: { color: "#7C5CFC", bg: "rgba(124,92,252,0.08)", emoji: "😎" },
  emotional: { color: "#22C55E", bg: "rgba(34,197,94,0.08)",  emoji: "❤️" },
};

export default function ReplyCard({ reply, index, isBest, onThumbsDown }) {
  const [copied, setCopied]       = useState(false);
  const [thumbsUp, setThumbsUp]   = useState(false);
  const [thumbsDown, setThumbsDown] = useState(false);
  const copyBtnRef  = useRef();
  const thumbUpRef  = useRef();
  const thumbDownRef= useRef();
  const cardRef     = useRef();

  const scheme = TAG_COLORS[reply.type] || TAG_COLORS.confident;

  // Ripple on copy button
  useEffect(() => { addRipple(copyBtnRef.current); }, []);

  // Spring-in on mount
  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    el.style.opacity   = "0";
    el.style.transform = "translateY(24px) scale(0.97)";
    const delay = 80 + index * 90;
    const timer = setTimeout(() => {
      el.style.transition = "opacity 0.45s cubic-bezier(0.34,1.4,0.64,1), transform 0.45s cubic-bezier(0.34,1.4,0.64,1)";
      el.style.opacity    = "1";
      el.style.transform  = "translateY(0) scale(1)";
    }, delay);
    return () => clearTimeout(timer);
  }, [index]);

  function handleCopy() {
    navigator.clipboard.writeText(reply.text).catch(() => {});
    setCopied(true);
    haptic("light");
    // Confetti burst from button position
    const rect = copyBtnRef.current?.getBoundingClientRect();
    if (rect) confettiBurst(rect.left + rect.width / 2, rect.top, 28);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleThumbUp(e) {
    setThumbsUp(true);
    haptic("light");
    const rect = thumbUpRef.current?.getBoundingClientRect();
    if (rect) {
      floatEmoji("❤️", rect.left + 10, rect.top);
      floatEmoji("✨", rect.left + 20, rect.top - 10);
    }
    setTimeout(() => setThumbsUp(false), 1000);
  }

  function handleThumbDown(e) {
    setThumbsDown(true);
    haptic("medium");
    setTimeout(() => { setThumbsDown(false); onThumbsDown?.(reply.type); }, 400);
  }

  return (
    <div
      ref={cardRef}
      className={`reply-card ${isBest ? "best-match" : ""}`}
      style={{
        background: isBest ? scheme.bg : "var(--bg2)",
        borderColor: isBest ? scheme.color : "var(--border)",
        borderWidth: isBest ? 1 : 0.5,
        willChange: "transform, opacity",
      }}
    >
      {isBest && (
        <span className="best-badge" style={{ color: scheme.color }}>
          ✦ Best match
        </span>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <span style={{
          fontSize: 22,
          filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.3))",
          animation: isBest ? "emojiFloat 3s ease-in-out infinite" : "none",
        }}>
          {reply.emoji}
        </span>
        <div className="reply-tag" style={{ color: scheme.color }}>
          {reply.type}
        </div>
        {isBest && (
          <div style={{
            marginLeft: "auto",
            width: 8, height: 8,
            borderRadius: "50%",
            background: scheme.color,
            boxShadow: `0 0 8px ${scheme.color}`,
            animation: "glowPulse 1.8s ease-in-out infinite",
          }} />
        )}
      </div>

      <div className="reply-text" style={{ lineHeight: 1.6 }}>{reply.text}</div>

      {/* Send to apps */}
      <SendToApp text={reply.text} />

      {/* Actions row */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 12 }}>
        <button
          ref={copyBtnRef}
          onClick={handleCopy}
          style={{
            padding: "7px 14px",
            borderRadius: 20,
            background: copied ? scheme.color : "transparent",
            border: `0.5px solid ${copied ? scheme.color : "var(--border2)"}`,
            color: copied ? "#fff" : "var(--accent)",
            fontSize: 11,
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.25s cubic-bezier(0.34,1.56,0.64,1)",
            transform: copied ? "scale(1.05)" : "scale(1)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {copied ? "✓ Copied!" : "Copy reply ↗"}
        </button>

        <div style={{ marginLeft: "auto", display: "flex", gap: 2 }}>
          <button
            ref={thumbUpRef}
            onClick={handleThumbUp}
            style={{
              ...thumbBtnStyle,
              transform: thumbsUp ? "scale(1.4)" : "scale(1)",
              filter: thumbsUp ? "drop-shadow(0 0 6px #22C55E)" : "none",
            }}
            title="Love this"
          >
            👍
          </button>
          <button
            ref={thumbDownRef}
            onClick={handleThumbDown}
            style={{
              ...thumbBtnStyle,
              transform: thumbsDown ? "scale(0.8)" : "scale(1)",
              opacity: thumbsDown ? 0.5 : 1,
            }}
            title="Regenerate avoiding this style"
          >
            👎
          </button>
        </div>
      </div>
    </div>
  );
}

const thumbBtnStyle = {
  background: "none",
  border: "none",
  fontSize: 16,
  cursor: "pointer",
  padding: "5px 7px",
  borderRadius: 8,
  transition: "transform 0.2s cubic-bezier(0.34,1.56,0.64,1), filter 0.2s, opacity 0.2s",
  lineHeight: 1,
};
