// src/components/MatchScore.jsx
import { useEffect, useRef, useState } from "react";
import { heartbeatPulse } from "../lib/animations";

const SIZE = 72;
const STROKE = 6;
const R = (SIZE - STROKE) / 2;
const CIRC = 2 * Math.PI * R;

export default function MatchScore({ value, label, color, delay = 0 }) {
  const [displayValue, setDisplayValue] = useState(0);
  const [dashOffset, setDashOffset] = useState(CIRC);
  const pulseRef = useRef();

  useEffect(() => {
    const timer = setTimeout(() => {
      // Animate number
      const duration = 1400;
      const start = performance.now();
      const tick = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        // Ease-out
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(eased * value);
        setDisplayValue(current);
        setDashOffset(CIRC - (eased * value / 100) * CIRC);
        if (progress < 1) requestAnimationFrame(tick);
        else {
          // Heartbeat after counter
          setTimeout(() => {
            if (pulseRef.current) {
              const cancel = heartbeatPulse(pulseRef.current);
              setTimeout(cancel, 4000);
            }
          }, 100);
        }
      };
      requestAnimationFrame(tick);
    }, delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  const ringColor = color || "var(--accent)";

  return (
    <div style={{
      textAlign: "center",
      padding: "8px 0",
      animation: `fadeScale 0.5s ease ${delay}ms both`,
    }}>
      <div ref={pulseRef} style={{ display: "inline-block", willChange: "transform", position: "relative" }}>
        {/* SVG ring */}
        <svg width={SIZE} height={SIZE} style={{ display: "block" }}>
          {/* Track */}
          <circle
            cx={SIZE / 2} cy={SIZE / 2} r={R}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={STROKE}
          />
          {/* Fill */}
          <circle
            cx={SIZE / 2} cy={SIZE / 2} r={R}
            fill="none"
            stroke={ringColor}
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={CIRC}
            strokeDashoffset={dashOffset}
            transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
            style={{
              transition: "stroke-dashoffset 0.05s linear",
              filter: `drop-shadow(0 0 6px ${ringColor}88)`,
            }}
          />
        </svg>
        {/* Number centered inside ring */}
        <div style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "var(--font-display)",
          fontSize: 17,
          fontWeight: 800,
          lineHeight: 1,
          color: ringColor,
          textShadow: `0 0 14px ${ringColor}55`,
        }}>
          {displayValue}
          <span style={{ fontSize: 8, fontWeight: 600, opacity: 0.7, marginTop: 1 }}>%</span>
        </div>
      </div>
      <div style={{ fontSize: 10, color: "var(--text3)", marginTop: 6, textTransform: "uppercase", letterSpacing: "0.6px", fontWeight: 600 }}>
        {label}
      </div>
    </div>
  );
}
