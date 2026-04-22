// src/components/SkeletonLoader.jsx
import { shimmerStyle } from "../lib/animations";

export function SkeletonReplyCards() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="card"
          style={{
            padding: 16,
            opacity: 1 - i * 0.12,
            animation: `slideUp 0.3s ease ${i * 60}ms both`,
          }}
        >
          <div style={{ display: "flex", gap: 8, marginBottom: 10, alignItems: "center" }}>
            <span style={shimmerStyle(28, 28, 28)} />
            <span style={shimmerStyle(70, 12, 6)} />
          </div>
          <span style={shimmerStyle("100%", 13, 6)} />
          <span style={{ ...shimmerStyle("78%", 13, 6), marginTop: 6 }} />
          <span style={{ ...shimmerStyle("42%", 11, 6), marginTop: 14 }} />
        </div>
      ))}
    </div>
  );
}

export function SkeletonPersonality() {
  return (
    <div>
      <div className="insight-box" style={{ marginBottom: 14 }}>
        <span style={shimmerStyle("40%", 10, 5)} />
        <span style={{ ...shimmerStyle("100%", 13, 6), marginTop: 8 }} />
        <span style={{ ...shimmerStyle("88%", 13, 6), marginTop: 6 }} />
      </div>
      {[90, 70, 60, 80].map((w, i) => (
        <div key={i} className="trait-row" style={{ marginBottom: 14 }}>
          <span style={shimmerStyle(100, 12, 6)} />
          <div style={{ flex: 1, height: 4, background: "var(--surface)", borderRadius: 4, overflow: "hidden" }}>
            <div
              style={{
                height: "100%",
                width: `${w}%`,
                background: "linear-gradient(90deg, var(--surface) 25%, rgba(255,255,255,0.06) 50%, var(--surface) 75%)",
                backgroundSize: "200% 100%",
                animation: `shimmerSlide 1.6s ease-in-out ${i * 100}ms infinite`,
                borderRadius: 4,
              }}
            />
          </div>
          <span style={shimmerStyle(34, 12, 6)} />
        </div>
      ))}
    </div>
  );
}
