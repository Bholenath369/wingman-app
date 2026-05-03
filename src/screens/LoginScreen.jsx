// src/screens/LoginScreen.jsx
// Full-screen Clerk sign-in / sign-up wall shown to unauthenticated visitors.

import { SignIn } from "@clerk/clerk-react";
import WingmanLogoMark from "../components/WingmanLogoMark";

const FEATURES = [
  { icon: "📸", label: "Read the Room", desc: "AI decodes any chat screenshot" },
  { icon: "💬", label: "Best Reply, Fast", desc: "4 options tailored to the vibe" },
  { icon: "🧠", label: "Know Them First", desc: "Personality insights in seconds" },
];

export default function LoginScreen() {
  return (
    <div style={container}>
      {/* Ambient orbs */}
      <div style={orb1} />
      <div style={orb2} />

      {/* AI-generated mood background */}
      <img
        src="/images/login-bg.png"
        alt=""
        aria-hidden="true"
        style={loginBgImg}
        onError={(e) => { e.target.style.display = "none"; }}
      />

      {/* Logo + branding */}
      <div style={header}>
        <div style={logoWrap}>
          <WingmanLogoMark size={52} pulse />
        </div>
        <h1 style={title}>Wingman</h1>
        <p style={tagline}>Find the words. Win the heart.</p>
        <p style={socialProof}>⚡ Trusted by 10,000+ people getting better dates</p>
      </div>

      {/* Feature highlights */}
      <div style={featuresRow}>
        {FEATURES.map((f, i) => (
          <div key={i} style={featureCard}>
            <span style={{ fontSize: 22, marginBottom: 5, display: "block" }}>{f.icon}</span>
            <span style={featureLabel}>{f.label}</span>
            <span style={featureDesc}>{f.desc}</span>
          </div>
        ))}
      </div>

      {/* Clerk auth */}
      <div style={card}>
        <SignIn
          routing="hash"
          afterSignInUrl="/"
          afterSignUpUrl="/"
          appearance={{
            variables: {
              colorPrimary: "#FF1A6C",
              colorBackground: "transparent",
              colorInputBackground: "rgba(255,255,255,0.12)",
              colorText: "#FFFFFF",
              colorTextSecondary: "#C5B4E8",
              borderRadius: "14px",
              fontFamily: "'Sora', sans-serif",
            },
            elements: {
              card: {
                background: "rgba(255,255,255,0.0)",
                border: "none",
                boxShadow: "none",
              },
              rootBox: { width: "100%" },
              socialButtonsBlockButton: {
                background: "#ffffff",
                border: "1px solid rgba(255,255,255,0.25)",
                color: "#111111",
              },
              socialButtonsBlockButtonText: {
                color: "#111111",
                fontWeight: 600,
              },
            },
          }}
        />
      </div>

      <p style={terms}>Free to try · No credit card needed</p>
    </div>
  );
}

const container = {
  minHeight: "100dvh",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: "28px 20px 24px",
  gap: 18,
  background: "linear-gradient(160deg, #1a0533 0%, #2d0b55 45%, #3d0f6b 100%)",
  position: "relative",
  overflow: "hidden",
};
const loginBgImg = {
  position: "absolute",
  top: "50%", left: "50%",
  transform: "translate(-50%, -50%)",
  width: "100%", height: "100%",
  objectFit: "cover",
  opacity: 0.12,
  pointerEvents: "none",
  zIndex: 0,
  maskImage: "radial-gradient(ellipse at center, black 30%, transparent 75%)",
  WebkitMaskImage: "radial-gradient(ellipse at center, black 30%, transparent 75%)",
};
const orb1 = {
  position: "absolute",
  width: 350, height: 350,
  borderRadius: "50%",
  background: "#FF1A6C",
  top: -90, right: -90,
  pointerEvents: "none",
  filter: "blur(120px)",
  opacity: 0.55,
};
const orb2 = {
  position: "absolute",
  width: 300, height: 300,
  borderRadius: "50%",
  background: "#9D4EDD",
  bottom: 40, left: -80,
  pointerEvents: "none",
  filter: "blur(110px)",
  opacity: 0.45,
};
const header = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 7,
  position: "relative",
  zIndex: 1,
};
const logoWrap = {
  width: 76, height: 76,
  borderRadius: "50%",
  background: "linear-gradient(135deg, rgba(255,26,108,0.22), rgba(157,78,221,0.18))",
  border: "1.5px solid rgba(255,26,108,0.35)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  marginBottom: 2,
  boxShadow: "0 0 32px rgba(255,26,108,0.25)",
};
const title = {
  margin: 0,
  fontFamily: "'Outfit', sans-serif",
  fontSize: 38,
  fontWeight: 800,
  background: "linear-gradient(135deg,#FF1A6C,#9D4EDD)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  letterSpacing: "-0.5px",
};
const tagline = {
  margin: 0,
  fontSize: 15,
  color: "rgba(255,255,255,0.55)",
  fontFamily: "'Sora', sans-serif",
  fontWeight: 400,
};
const socialProof = {
  margin: 0,
  fontSize: 12,
  color: "rgba(255,179,71,0.85)",
  fontFamily: "'Sora', sans-serif",
  fontWeight: 600,
  letterSpacing: "0.2px",
};
const featuresRow = {
  display: "flex",
  gap: 10,
  width: "100%",
  maxWidth: 390,
  position: "relative",
  zIndex: 1,
};
const featureCard = {
  flex: 1,
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(157,78,221,0.22)",
  borderRadius: 14,
  padding: "14px 8px 12px",
  textAlign: "center",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 3,
  backdropFilter: "blur(12px)",
};
const featureLabel = {
  fontSize: 11,
  fontWeight: 700,
  color: "#fff",
  letterSpacing: "0.3px",
  fontFamily: "'Sora', sans-serif",
};
const featureDesc = {
  fontSize: 10,
  color: "rgba(255,255,255,0.42)",
  lineHeight: 1.4,
  fontFamily: "'Sora', sans-serif",
};
const card = {
  width: "100%",
  maxWidth: 390,
  position: "relative",
  zIndex: 1,
};
const terms = {
  margin: 0,
  fontSize: 11,
  color: "rgba(255,255,255,0.28)",
  fontFamily: "'Sora', sans-serif",
  position: "relative",
  zIndex: 1,
};
