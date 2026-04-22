// src/components/OnboardingModal.jsx
import { useState, useEffect } from "react";
import { setUserVibe } from "../lib/claude";
import { haptic, floatEmoji } from "../lib/animations";

const STYLE_OPTIONS = [
  { key: "witty and sarcastic",   emoji: "😏", label: "Witty",      desc: "Sharp, a little edgy" },
  { key: "warm and genuine",      emoji: "🤍", label: "Genuine",    desc: "Real, no games" },
  { key: "cool and mysterious",   emoji: "🌙", label: "Mysterious", desc: "Let them wonder" },
  { key: "playful and flirty",    emoji: "⚡", label: "Playful",    desc: "Light and fun" },
  { key: "direct and confident",  emoji: "🎯", label: "Confident",  desc: "Say what you mean" },
  { key: "thoughtful and deep",   emoji: "🌊", label: "Thoughtful", desc: "Meaningful moments" },
];

const STRUGGLE_OPTIONS = [
  { key: "I come on too strong",                   emoji: "🔥", label: "Too intense" },
  { key: "I get too shy or boring",                emoji: "🐢", label: "Too passive" },
  { key: "I overthink every message",              emoji: "🌀", label: "Overthinking" },
  { key: "Conversations die after a few texts",    emoji: "💀", label: "Conversations die" },
  { key: "I can't get past small talk",            emoji: "🧊", label: "Stuck on small talk" },
  { key: "I never know when to escalate",          emoji: "🪜", label: "Bad timing" },
];

// Inline SVG illustrations per step
function StepIllustration({ step }) {
  if (step === 0) return (
    <svg width="120" height="100" viewBox="0 0 120 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ margin: "0 auto 20px", display: "block" }}>
      <circle cx="60" cy="50" r="38" fill="rgba(232,84,122,0.08)" stroke="rgba(232,84,122,0.2)" strokeWidth="1"/>
      <circle cx="60" cy="50" r="24" fill="rgba(232,84,122,0.12)" stroke="rgba(232,84,122,0.3)" strokeWidth="1">
        <animate attributeName="r" values="24;27;24" dur="2.4s" repeatCount="indefinite"/>
      </circle>
      <text x="60" y="57" textAnchor="middle" fontSize="22">🧠</text>
      <circle cx="36" cy="28" r="3" fill="#E8547A" opacity="0.6">
        <animate attributeName="opacity" values="0.3;1;0.3" dur="1.8s" repeatCount="indefinite"/>
      </circle>
      <circle cx="88" cy="32" r="2" fill="#7C5CFC" opacity="0.6">
        <animate attributeName="opacity" values="0.3;1;0.3" dur="2.2s" repeatCount="indefinite" begin="0.5s"/>
      </circle>
      <circle cx="82" cy="74" r="2.5" fill="#E8547A" opacity="0.6">
        <animate attributeName="opacity" values="0.3;1;0.3" dur="1.6s" repeatCount="indefinite" begin="1s"/>
      </circle>
    </svg>
  );

  if (step === 1) return (
    <svg width="140" height="90" viewBox="0 0 140 90" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ margin: "0 auto 20px", display: "block" }}>
      {STYLE_OPTIONS.slice(0, 4).map((s, i) => (
        <g key={i}>
          <rect x={10 + (i % 2) * 68} y={i < 2 ? 8 : 50} width="58" height="28" rx="14"
            fill={i === 1 ? "rgba(232,84,122,0.2)" : "rgba(255,255,255,0.04)"}
            stroke={i === 1 ? "rgba(232,84,122,0.6)" : "rgba(255,255,255,0.1)"} strokeWidth="0.8"/>
          <text x={39 + (i % 2) * 68} y={i < 2 ? 26 : 68} textAnchor="middle" fontSize="14">{s.emoji}</text>
        </g>
      ))}
      <circle cx="70" cy="45" r="5" fill="#E8547A" opacity="0.8">
        <animate attributeName="r" values="4;6;4" dur="1.5s" repeatCount="indefinite"/>
      </circle>
    </svg>
  );

  return (
    <svg width="130" height="90" viewBox="0 0 130 90" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ margin: "0 auto 20px", display: "block" }}>
      <rect x="15" y="10" width="100" height="65" rx="14" fill="rgba(232,84,122,0.06)" stroke="rgba(232,84,122,0.2)" strokeWidth="0.8"/>
      <rect x="25" y="24" width="60" height="9" rx="4.5" fill="rgba(232,84,122,0.25)">
        <animate attributeName="width" values="30;60;30" dur="2s" repeatCount="indefinite"/>
      </rect>
      <rect x="25" y="40" width="80" height="9" rx="4.5" fill="rgba(124,92,252,0.2)">
        <animate attributeName="width" values="50;80;50" dur="2.5s" repeatCount="indefinite" begin="0.3s"/>
      </rect>
      <rect x="25" y="56" width="45" height="9" rx="4.5" fill="rgba(232,84,122,0.15)">
        <animate attributeName="width" values="20;45;20" dur="1.8s" repeatCount="indefinite" begin="0.6s"/>
      </rect>
      <circle cx="108" cy="58" r="14" fill="linear-gradient(135deg,#E8547A,#7C5CFC)">
        <animate attributeName="r" values="12;15;12" dur="1.4s" repeatCount="indefinite"/>
      </circle>
      <text x="108" y="63" textAnchor="middle" fontSize="14">✨</text>
    </svg>
  );
}

export default function OnboardingModal({ onComplete }) {
  const [step, setStep]       = useState(0);
  const [style, setStyle]     = useState(null);
  const [struggle, setStruggle] = useState(null);
  const [leaving, setLeaving] = useState(false);

  function advanceStep() {
    setLeaving(true);
    setTimeout(() => { setStep((s) => s + 1); setLeaving(false); }, 250);
  }

  function handleStylePick(opt, e) {
    setStyle(opt.key);
    haptic("light");
    const rect = e.currentTarget.getBoundingClientRect();
    floatEmoji(opt.emoji, rect.left + rect.width / 2, rect.top);
    setTimeout(advanceStep, 280);
  }

  function handleStrugglePick(opt, e) {
    setStruggle(opt.key);
    haptic("medium");
    const rect = e.currentTarget.getBoundingClientRect();
    floatEmoji("🎯", rect.left + rect.width / 2, rect.top);
    setTimeout(() => {
      setUserVibe({ style, struggle: opt.key });
      setLeaving(true);
      setTimeout(onComplete, 350);
    }, 280);
  }

  function skip() {
    setUserVibe({ skipped: true });
    setLeaving(true);
    setTimeout(onComplete, 300);
  }

  const steps = [
    {
      title: "Meet your AI wingman",
      sub: "Two quick questions and it'll know exactly how to sound like you.",
      cta: "Let's go →",
    },
    {
      title: "What's your vibe?",
      sub: "Pick the style closest to how you actually text.",
    },
    {
      title: "What usually trips you up?",
      sub: "Your wingman will focus on fixing exactly this.",
    },
  ];

  return (
    <div style={{
      position: "fixed", inset: 0,
      background: "rgba(8,4,16,0.88)",
      backdropFilter: "blur(12px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 9999, padding: 16,
      animation: "fadeIn 0.35s ease",
    }}>
      <div style={{
        background: "linear-gradient(160deg, #1E0A1E 0%, #0D0420 100%)",
        border: "0.5px solid rgba(232,84,122,0.3)",
        borderRadius: 24,
        padding: "32px 24px 28px",
        maxWidth: 400, width: "100%",
        textAlign: "center",
        position: "relative",
        boxShadow: "0 24px 80px rgba(0,0,0,0.6), 0 0 60px rgba(232,84,122,0.1)",
        opacity: leaving ? 0 : 1,
        transform: leaving ? "scale(0.96)" : "scale(1)",
        transition: "opacity 0.25s ease, transform 0.25s ease",
        animation: leaving ? "none" : "slideUp 0.35s cubic-bezier(0.34,1.4,0.64,1)",
      }}>
        {/* Step dots */}
        <div style={{ display: "flex", gap: 6, justifyContent: "center", marginBottom: 20 }}>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{
              width: i === step ? 20 : 6,
              height: 6,
              borderRadius: 3,
              background: i === step ? "var(--accent)" : "rgba(255,255,255,0.12)",
              transition: "all 0.4s cubic-bezier(0.34,1.4,0.64,1)",
            }} />
          ))}
        </div>

        <StepIllustration step={step} />

        <h2 style={{
          fontFamily: "var(--font-display)",
          fontSize: 22,
          color: "#fff",
          marginBottom: 8,
          lineHeight: 1.2,
        }}>
          {steps[step].title}
        </h2>
        <p style={{
          fontSize: 13,
          color: "rgba(255,255,255,0.5)",
          lineHeight: 1.55,
          marginBottom: 22,
        }}>
          {steps[step].sub}
        </p>

        {step === 0 && (
          <>
            <button
              onClick={advanceStep}
              style={{
                width: "100%", padding: 14,
                borderRadius: 14,
                background: "linear-gradient(135deg, #E8547A, #C43060)",
                border: "none", color: "#fff",
                fontSize: 14, fontWeight: 600,
                cursor: "pointer",
                boxShadow: "0 4px 24px rgba(232,84,122,0.4)",
                transition: "transform 0.15s, box-shadow 0.15s",
              }}
              onMouseOver={(e) => { e.currentTarget.style.transform = "scale(1.02)"; e.currentTarget.style.boxShadow = "0 6px 28px rgba(232,84,122,0.5)"; }}
              onMouseOut={(e) => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 4px 24px rgba(232,84,122,0.4)"; }}
            >
              {steps[step].cta}
            </button>
            <button onClick={skip} style={skipStyle}>Skip for now</button>
          </>
        )}

        {step === 1 && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {STYLE_OPTIONS.map((opt) => (
              <button
                key={opt.key}
                onClick={(e) => handleStylePick(opt, e)}
                style={{
                  padding: "12px 10px",
                  borderRadius: 14,
                  background: "rgba(255,255,255,0.04)",
                  border: "0.5px solid rgba(255,255,255,0.1)",
                  color: "var(--text)",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 0.18s cubic-bezier(0.34,1.4,0.64,1)",
                  display: "flex", flexDirection: "column", gap: 3,
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = "rgba(232,84,122,0.1)";
                  e.currentTarget.style.borderColor = "rgba(232,84,122,0.4)";
                  e.currentTarget.style.transform = "scale(1.03)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                  e.currentTarget.style.transform = "";
                }}
              >
                <span style={{ fontSize: 20 }}>{opt.emoji}</span>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{opt.label}</span>
                <span style={{ fontSize: 10, color: "var(--text3)" }}>{opt.desc}</span>
              </button>
            ))}
          </div>
        )}

        {step === 2 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {STRUGGLE_OPTIONS.map((opt) => (
              <button
                key={opt.key}
                onClick={(e) => handleStrugglePick(opt, e)}
                style={{
                  padding: "12px 16px",
                  borderRadius: 14,
                  background: "rgba(255,255,255,0.04)",
                  border: "0.5px solid rgba(255,255,255,0.1)",
                  color: "var(--text)",
                  cursor: "pointer",
                  textAlign: "left",
                  display: "flex", gap: 12, alignItems: "center",
                  fontSize: 13,
                  transition: "all 0.18s cubic-bezier(0.34,1.4,0.64,1)",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = "rgba(124,92,252,0.1)";
                  e.currentTarget.style.borderColor = "rgba(124,92,252,0.4)";
                  e.currentTarget.style.transform = "translateX(4px)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                  e.currentTarget.style.transform = "";
                }}
              >
                <span style={{ fontSize: 20, flexShrink: 0 }}>{opt.emoji}</span>
                <span>{opt.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const skipStyle = {
  background: "none", border: "none",
  color: "rgba(255,255,255,0.3)",
  fontSize: 11, cursor: "pointer",
  marginTop: 14, padding: "4px 8px",
  transition: "color 0.15s",
};
