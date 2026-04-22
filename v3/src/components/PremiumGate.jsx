// src/components/PremiumGate.jsx
import { useEffect, useRef } from "react";
import { startCheckout } from "../lib/useUsage";
import { makeMagnetic, premiumUnlockCelebration, haptic } from "../lib/animations";

export default function PremiumGate({ title, description, features }) {
  const btnRef = useRef();

  useEffect(() => {
    const cleanup = makeMagnetic(btnRef.current, 0.3);
    return cleanup;
  }, []);

  function handleClick() {
    haptic("medium");
    premiumUnlockCelebration();
    setTimeout(() => startCheckout(), 600);
  }

  return (
    <div className="premium-gate" style={{ marginTop: 16, overflow: "hidden", position: "relative" }}>
      {/* Animated shimmer streak */}
      <div style={{
        position: "absolute",
        top: 0, left: "-100%",
        width: "60%", height: "100%",
        background: "linear-gradient(90deg, transparent, rgba(232,84,122,0.06), transparent)",
        animation: "shimmerStreak 3s ease-in-out infinite",
        pointerEvents: "none",
      }} />

      {/* Crown icon with pulse */}
      <div style={{
        fontSize: 38,
        marginBottom: 12,
        animation: "emojiFloat 3s ease-in-out infinite",
        display: "block",
        position: "relative",
        zIndex: 1,
      }}>
        👑
      </div>

      <h3 style={{ position: "relative", zIndex: 1 }}>{title || "Unlock Premium"}</h3>
      <p style={{ position: "relative", zIndex: 1 }}>
        {description || "Get unlimited access to all AI wingman features."}
      </p>

      {features && (
        <ul style={{
          listStyle: "none", padding: 0,
          margin: "0 0 20px",
          textAlign: "left",
          position: "relative", zIndex: 1,
        }}>
          {features.map((f, i) => (
            <li key={i} style={{
              fontSize: 13,
              color: "rgba(255,255,255,0.75)",
              padding: "5px 0",
              display: "flex", gap: 8, alignItems: "flex-start",
              animation: `slideUp 0.35s ease ${i * 60}ms both`,
            }}>
              <span style={{ color: "var(--accent)", flexShrink: 0 }}>✓</span>
              {f}
            </li>
          ))}
        </ul>
      )}

      <button
        ref={btnRef}
        className="premium-btn"
        onClick={handleClick}
        style={{ position: "relative", zIndex: 1, willChange: "transform" }}
      >
        Go Premium — $9.99/mo
      </button>
      <p style={{
        marginTop: 10,
        fontSize: 11,
        color: "rgba(255,255,255,0.3)",
        position: "relative", zIndex: 1,
      }}>
        Cancel anytime · First 7 days free
      </p>
    </div>
  );
}
