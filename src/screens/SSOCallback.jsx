// src/screens/SSOCallback.jsx
// Handles the OAuth redirect from Google / Apple back into the app.
// Clerk resolves the callback automatically; this component just
// shows a brief spinner while that happens.

import { AuthenticateWithRedirectCallback } from "@clerk/clerk-react";

export default function SSOCallback() {
  return (
    <div style={wrap}>
      <AuthenticateWithRedirectCallback />
      <div style={spinner} />
      <p style={msg}>Signing you in…</p>
    </div>
  );
}

const wrap = {
  minHeight: "100dvh",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: 16,
  background: "linear-gradient(135deg, #0A0515 0%, #1A0A2E 50%, #0D0720 100%)",
};
const spinner = {
  width: 36,
  height: 36,
  borderRadius: "50%",
  border: "3px solid rgba(255,0,110,0.2)",
  borderTopColor: "#FF006E",
  animation: "spin 0.8s linear infinite",
};
const msg = {
  fontSize: 14,
  color: "rgba(255,255,255,0.5)",
  margin: 0,
};
