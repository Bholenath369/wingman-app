// src/components/MatchScore.jsx
import { useEffect, useRef } from "react";
import { animateNumber, heartbeatPulse } from "../lib/animations";

export default function MatchScore({ value, label, color, delay = 0 }) {
  const numRef = useRef();
  const pulseRef = useRef();

  useEffect(() => {
    const timer = setTimeout(() => {
      animateNumber(numRef.current, 0, value, 1400);
      // Start heartbeat after counter finishes
      setTimeout(() => {
        if (pulseRef.current) {
          const cancel = heartbeatPulse(pulseRef.current);
          // Stop after 4 seconds — don't want it forever
          setTimeout(cancel, 4000);
        }
      }, 1500);
    }, delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return (
    <div style={{
      textAlign: "center",
      padding: "8px 0",
      animation: `fadeScale 0.5s ease ${delay}ms both`,
    }}>
      <div
        ref={pulseRef}
        style={{
          display: "inline-block",
          willChange: "transform",
        }}
      >
        <div
          ref={numRef}
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 38,
            lineHeight: 1,
            color: color || "var(--accent)",
            textShadow: `0 0 20px ${color || "var(--accent)"}55`,
          }}
        >
          0
        </div>
      </div>
      <div style={{ fontSize: 10, color: "var(--text3)", marginTop: 4, textTransform: "uppercase", letterSpacing: "0.6px" }}>
        {label}
      </div>
    </div>
  );
}
