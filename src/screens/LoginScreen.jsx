// src/screens/LoginScreen.jsx
// Full-screen Clerk sign-in / sign-up wall shown to unauthenticated visitors.

import { SignIn } from "@clerk/clerk-react";

export default function LoginScreen() {
  return (
    <div style={container}>
      <div style={header}>
        <div style={logoWrap}>💬</div>
        <h1 style={title}>Wingman</h1>
        <p style={sub}>Your AI dating coach — sign in to start</p>
      </div>

      <div style={card}>
        <SignIn
          routing="hash"
          afterSignInUrl="/"
          afterSignUpUrl="/"
          appearance={{
            variables: {
              colorPrimary: "#FF006E",
              colorBackground: "#1A0A2E",
              colorInputBackground: "#2D1B4E",
              colorText: "#FFFFFF",
              colorTextSecondary: "#B8A7D8",
              borderRadius: "14px",
              fontFamily: "'Sora', sans-serif",
            },
            elements: {
              card: {
                background: "rgba(26,10,46,0.0)",
                border: "none",
                boxShadow: "none",
              },
              rootBox: { width: "100%" },
            },
          }}
        />
      </div>
    </div>
  );
}

const container = {
  minHeight: "100dvh",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: "24px 16px",
  gap: 24,
  background: "linear-gradient(135deg, #0A0515 0%, #1A0A2E 50%, #0D0720 100%)",
};
const header = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 8,
};
const logoWrap = {
  fontSize: 48,
  lineHeight: 1,
  filter: "drop-shadow(0 0 18px rgba(255,0,110,0.6))",
};
const title = {
  margin: 0,
  fontFamily: "'Outfit', sans-serif",
  fontSize: 32,
  fontWeight: 800,
  background: "linear-gradient(135deg,#FF006E,#A855F7)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
};
const sub = {
  margin: 0,
  fontSize: 14,
  color: "rgba(255,255,255,0.55)",
};
const card = {
  width: "100%",
  maxWidth: 400,
};
