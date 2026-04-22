// src/components/SendToApp.jsx
// Sends a reply to external apps (SMS, email, etc.)

import { floatEmoji } from "../lib/animations";

export default function SendToApp({ reply }) {
  function handleSend(platform) {
    const text = encodeURIComponent(reply.text);
    
    switch (platform) {
      case "sms":
        window.open(`sms:?body=${text}`, "_blank");
        break;
      case "email":
        window.open(`mailto:?body=${text}`, "_blank");
        break;
      case "copy":
        navigator.clipboard.writeText(reply.text);
        floatEmoji("✓", window.innerWidth / 2, window.innerHeight / 2);
        break;
      default:
        break;
    }
  }

  return (
    <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
      <button
        onClick={() => handleSend("sms")}
        style={{
          fontSize: "12px",
          padding: "4px 8px",
          borderRadius: "4px",
          border: "1px solid rgba(255,255,255,0.2)",
          background: "transparent",
          color: "rgba(255,255,255,0.7)",
          cursor: "pointer",
        }}
      >
        SMS
      </button>
      <button
        onClick={() => handleSend("email")}
        style={{
          fontSize: "12px",
          padding: "4px 8px",
          borderRadius: "4px",
          border: "1px solid rgba(255,255,255,0.2)",
          background: "transparent",
          color: "rgba(255,255,255,0.7)",
          cursor: "pointer",
        }}
      >
        Email
      </button>
    </div>
  );
}
