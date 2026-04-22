// src/components/PremiumGate.jsx
import { startCheckout } from "../lib/useUsage";

export default function PremiumGate({ title, description, features }) {
  return (
    <div className="premium-gate" style={{ marginTop: 16 }}>
      <h3>{title || "Unlock Premium"}</h3>
      <p>{description || "Get unlimited access to all AI wingman features."}</p>

      {features && (
        <ul style={{
          listStyle: "none",
          padding: 0,
          margin: "0 0 18px",
          textAlign: "left",
          position: "relative",
          zIndex: 1,
        }}>
          {features.map((f, i) => (
            <li key={i} style={{
              fontSize: 13,
              color: "rgba(255,255,255,0.75)",
              padding: "6px 0",
              display: "flex",
              gap: 8,
              alignItems: "flex-start",
            }}>
              <span style={{ color: "var(--accent)", flexShrink: 0 }}>✓</span>
              <span>{f}</span>
            </li>
          ))}
        </ul>
      )}

      <button className="premium-btn" onClick={startCheckout}>
        Go Premium — $9.99/mo
      </button>
      <p style={{ marginTop: 10, fontSize: 11, color: "rgba(255,255,255,0.35)" }}>
        Cancel anytime. First 7 days free.
      </p>
    </div>
  );
}
