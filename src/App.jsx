import { useState, useEffect } from "react";
import AnalyzeScreen from "./screens/AnalyzeScreen";
import PersonalityScreen from "./screens/PersonalityScreen";
import CoachScreen from "./screens/CoachScreen";
import SimulateScreen from "./screens/SimulateScreen";
import ProfileScreen from "./screens/ProfileScreen";
import { redeemUpgrade } from "./lib/useUsage";
import "./index.css";

const TABS = [
  { id: "analyze",     emoji: "📸", label: "Analyze"  },
  { id: "personality", emoji: "🧠", label: "Decode"   },
  { id: "coach",       emoji: "💬", label: "Coach"    },
  { id: "simulate",    emoji: "🎭", label: "Practice" },
  { id: "profile",     emoji: "👤", label: "Profile"  },
];

export default function App() {
  const [tab, setTab] = useState("analyze");
  const [upgradeStatus, setUpgradeStatus] = useState(null);

  // On load: handle Stripe checkout redirect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const upgrade = params.get("upgrade");
    const sessionId = params.get("session_id");

    if (upgrade === "success" && sessionId) {
      redeemUpgrade(sessionId).then((ok) => {
        setUpgradeStatus(ok ? "success" : "failed");
        // Clean URL
        window.history.replaceState({}, "", window.location.pathname);
        // Refresh after 2s to pick up premium state everywhere
        if (ok) setTimeout(() => window.location.reload(), 2000);
      });
    } else if (upgrade === "cancel") {
      setUpgradeStatus("cancelled");
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  return (
    <div className="app-shell">
      {upgradeStatus === "success" && (
        <div style={{
          position: "fixed",
          top: 20,
          left: "50%",
          transform: "translateX(-50%)",
          background: "linear-gradient(135deg,#22C55E,#16A34A)",
          color: "#fff",
          padding: "12px 24px",
          borderRadius: 12,
          fontSize: 13,
          fontWeight: 600,
          zIndex: 1000,
          boxShadow: "0 4px 20px rgba(34,197,94,0.3)",
        }}>
          ✓ Welcome to Premium! Refreshing...
        </div>
      )}

      {upgradeStatus === "cancelled" && (
        <div style={{
          position: "fixed",
          top: 20,
          left: "50%",
          transform: "translateX(-50%)",
          background: "rgba(239,68,68,0.15)",
          border: "0.5px solid rgba(239,68,68,0.3)",
          color: "#FCA5A5",
          padding: "10px 20px",
          borderRadius: 12,
          fontSize: 13,
          zIndex: 1000,
        }}>
          Upgrade cancelled — no charge
        </div>
      )}

      <nav className="bottom-nav">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={`nav-btn ${tab === t.id ? "active" : ""}`}
            onClick={() => setTab(t.id)}
          >
            <span className="nav-emoji">{t.emoji}</span>
            <span className="nav-label">{t.label}</span>
          </button>
        ))}
      </nav>

      <main className="screen-area">
        <div style={{ display: tab === "analyze"     ? "block" : "none" }}><AnalyzeScreen /></div>
        <div style={{ display: tab === "personality" ? "block" : "none" }}><PersonalityScreen /></div>
        <div style={{ display: tab === "coach"       ? "block" : "none" }}><CoachScreen /></div>
        <div style={{ display: tab === "simulate"    ? "block" : "none" }}><SimulateScreen /></div>
        <div style={{ display: tab === "profile"     ? "block" : "none" }}><ProfileScreen /></div>
      </main>
    </div>
  );
}
