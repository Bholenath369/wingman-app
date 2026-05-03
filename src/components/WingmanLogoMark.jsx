// src/components/WingmanLogoMark.jsx
// Custom SVG brand mark — speech bubble + heart — used in header and login screen.
// Renders a gradient speech bubble (pink→purple) with a white heart cutout inside.
// Pass `size` for width/height (square). Pass `pulse` to add the heartbeat glow animation.

import { useId } from "react";

export default function WingmanLogoMark({ size = 32, pulse = false, style }) {
  const uid = useId().replace(/:/g, "");
  const gId = `wm-g-${uid}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={pulse ? "wm-logo-pulse" : undefined}
      style={{ flexShrink: 0, ...style }}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gId} x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FF6B9D" />
          <stop offset="100%" stopColor="#C97BFF" />
        </linearGradient>
      </defs>

      {/* Speech bubble body with bottom-left tail */}
      <path
        d="M8 2H32Q38 2 38 8V22Q38 28 32 28H22L16 36L16 28H8Q2 28 2 22V8Q2 2 8 2Z"
        fill={`url(#${gId})`}
      />

      {/* White heart inside the bubble */}
      <path
        d="M20 20C20 20 12 15 12 10.5C12 7.8 14 6 16.5 7C18 7.7 19.2 9 20 10.2C20.8 9 22 7.7 23.5 7C26 6 28 7.8 28 10.5C28 15 20 20 20 20Z"
        fill="white"
        opacity="0.95"
      />
    </svg>
  );
}
