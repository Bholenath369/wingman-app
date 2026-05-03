// src/components/PremiumGate.jsx
import { useState, useEffect, useRef } from "react";
import { startCheckout } from "../lib/useUsage";
import { makeMagnetic, premiumUnlockCelebration, haptic } from "../lib/animations";

const COMPARE = [
  { label: "Screenshot analyses", free: "3/day", pro: "Unlimited" },
  { label: "Message rewrites",    free: "5/day", pro: "Unlimited" },
  { label: "Practice personas",   free: "1",     pro: "All 4"     },
  { label: "Profile analyzer",    free: "✗",     pro: "✓"         },
  { label: "Bio rewriter",        free: "✗",     pro: "✓"         },
];

const PLANS = [
  {
    id: "3day",
    label: "3-Day Pass",
    emoji: "⚡",
    price: "$2.99",
    period: "3 days",
    perDay: "$1.00/day",
    badge: null,
    desc: "Try everything, no commitment",
    color: "rgba(157,78,221,0.18)",
    border: "rgba(157,78,221,0.35)",
    textColor: "#C084FC",
  },
  {
    id: "weekly",
    label: "Weekly",
    emoji: "🗓️",
    price: "$4.99",
    period: "week",
    perDay: "$0.71/day",
    badge: null,
    desc: "Perfect for an active week",
    color: "rgba(255,26,108,0.12)",
    border: "rgba(255,26,108,0.3)",
    textColor: "#FF1A6C",
  },
  {
    id: "monthly",
    label: "Monthly",
    emoji: "👑",
    price: "$9.99",
    period: "month",
    perDay: "$0.33/day",
    badge: "BEST VALUE",
    desc: "Most popular · Save 67%",
    color: "rgba(255,212,0,0.1)",
    border: "rgba(255,212,0,0.45)",
    textColor: "#FF9F1C",
  },
];

export default function PremiumGate({ title, description }) {
  const [selectedPlan, setSelectedPlan] = useState("monthly");
  const [loading, setLoading] = useState(false);
  const btnRef = useRef();

  useEffect(() => {
    const cleanup = makeMagnetic(btnRef.current, 0.3);
    return cleanup;
  }, []);

  async function handleCheckout() {
    haptic("medium");
    premiumUnlockCelebration();
    setLoading(true);
    setTimeout(() => startCheckout(selectedPlan), 600);
  }

  const plan = PLANS.find((p) => p.id === selectedPlan);

  return (
    <div className="premium-gate" style={{ marginTop: 16, overflow: "hidden", position: "relative" }}>
      {/* Shimmer streak */}
      <div style={{
        position: "absolute", top: 0, left: "-100%",
        width: "60%", height: "100%",
        background: "linear-gradient(90deg, transparent, rgba(255,26,108,0.06), transparent)",
        animation: "shimmerStreak 3s ease-in-out infinite",
        pointerEvents: "none",
      }} />

      {/* Crown */}
      <div style={{
        fontSize: 40, marginBottom: 10,
        animation: "emojiFloat 3s ease-in-out infinite",
        display: "block", position: "relative", zIndex: 1,
      }}>👑</div>

      <h3 style={{ position: "relative", zIndex: 1 }}>{title || "Unlock Premium"}</h3>
      <p style={{ position: "relative", zIndex: 1, marginBottom: 18 }}>
        {description || "Get unlimited access to all AI wingman features."}
      </p>

      {/* Plan selector */}
      <div style={{
        display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
        gap: 8, marginBottom: 18, position: "relative", zIndex: 1,
      }}>
        {PLANS.map((p) => (
          <button
            key={p.id}
            onClick={() => { setSelectedPlan(p.id); haptic("light"); }}
            style={{
              position: "relative",
              padding: "14px 8px 12px",
              borderRadius: 14,
              border: `1.5px solid ${selectedPlan === p.id ? p.border : "rgba(255,255,255,0.08)"}`,
              background: selectedPlan === p.id ? p.color : "rgba(255,255,255,0.03)",
              cursor: "pointer",
              transition: "all 0.2s cubic-bezier(0.34,1.56,0.64,1)",
              transform: selectedPlan === p.id ? "scale(1.04)" : "scale(1)",
              boxShadow: selectedPlan === p.id ? `0 4px 20px ${p.color}` : "none",
              textAlign: "center",
            }}
          >
            {/* Best value badge */}
            {p.badge && (
              <div style={{
                position: "absolute", top: -10, left: "50%",
                transform: "translateX(-50%)",
                background: "linear-gradient(90deg, #FF9F1C, #FF1A6C)",
                color: "#000", fontSize: 8, fontWeight: 800,
                padding: "3px 8px", borderRadius: 20,
                letterSpacing: "0.5px", whiteSpace: "nowrap",
              }}>{p.badge}</div>
            )}
            <div style={{ fontSize: 22, marginBottom: 4 }}>{p.emoji}</div>
            <div style={{
              fontSize: 10, fontWeight: 700, color: selectedPlan === p.id ? p.textColor : "var(--text3)",
              textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 6,
            }}>{p.label}</div>
            <div style={{
              fontSize: 20, fontWeight: 900,
              color: selectedPlan === p.id ? "#fff" : "var(--text2)",
              lineHeight: 1, marginBottom: 2,
            }}>{p.price}</div>
            <div style={{ fontSize: 10, color: "var(--text3)" }}>/{p.period}</div>
            {selectedPlan === p.id && (
              <div style={{
                marginTop: 6, fontSize: 9, color: p.textColor,
                fontWeight: 600, letterSpacing: "0.3px",
              }}>{p.perDay}</div>
            )}
          </button>
        ))}
      </div>

      {/* Selected plan desc */}
      <p style={{
        textAlign: "center", fontSize: 12, color: "var(--text2)",
        marginBottom: 16, position: "relative", zIndex: 1,
        minHeight: 18,
      }}>{plan.desc}</p>

      {/* Comparison table */}
      <div style={{
        width: "100%", borderRadius: 12, overflow: "hidden",
        border: "1px solid rgba(157,78,221,0.2)",
        marginBottom: 18, position: "relative", zIndex: 1,
      }}>
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 80px 90px",
          padding: "8px 12px",
          background: "rgba(157,78,221,0.12)",
          borderBottom: "1px solid rgba(157,78,221,0.15)",
        }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Feature</span>
          <span style={{ fontSize: 10, fontWeight: 700, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.5px", textAlign: "center" }}>Free</span>
          <span style={{ fontSize: 10, fontWeight: 700, color: "#FF9F1C", textTransform: "uppercase", letterSpacing: "0.5px", textAlign: "center" }}>Pro ★</span>
        </div>
        {COMPARE.map((row, i) => (
          <div key={i} style={{
            display: "grid", gridTemplateColumns: "1fr 80px 90px",
            padding: "9px 12px",
            background: i % 2 === 0 ? "rgba(0,0,0,0.15)" : "rgba(0,0,0,0.05)",
            borderBottom: i < COMPARE.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
          }}>
            <span style={{ fontSize: 12, color: "var(--text2)", fontWeight: 500 }}>{row.label}</span>
            <span style={{ fontSize: 12, color: "var(--text3)", textAlign: "center" }}>{row.free}</span>
            <span style={{ fontSize: 12, color: "#4ADE80", fontWeight: 600, textAlign: "center" }}>{row.pro}</span>
          </div>
        ))}
      </div>

      <button
        ref={btnRef}
        className="premium-btn"
        onClick={handleCheckout}
        disabled={loading}
        style={{ position: "relative", zIndex: 1, willChange: "transform" }}
      >
        {loading ? "Redirecting…" : `Get ${plan.label} — ${plan.price} →`}
      </button>
      <p style={{
        marginTop: 10, fontSize: 11, color: "rgba(255,255,255,0.3)",
        position: "relative", zIndex: 1,
      }}>
        {selectedPlan === "3day" ? "One-time payment · Access for 3 days" : "Cancel anytime · Instant access"}
      </p>
    </div>
  );
}
