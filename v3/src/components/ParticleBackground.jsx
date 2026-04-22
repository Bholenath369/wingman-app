// src/components/ParticleBackground.jsx
import { useEffect, useRef } from "react";
import { initParticleBackground } from "../lib/animations";

export default function ParticleBackground() {
  const canvasRef = useRef();

  useEffect(() => {
    const cleanup = initParticleBackground(canvasRef.current);
    return cleanup;
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        zIndex: 0,
        pointerEvents: "none",
        opacity: 0.65,
      }}
    />
  );
}
