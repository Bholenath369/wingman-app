import { useState } from "react";
import AnalyzeScreen from "./screens/AnalyzeScreen";
import PersonalityScreen from "./screens/PersonalityScreen";
import CoachScreen from "./screens/CoachScreen";
import SimulateScreen from "./screens/SimulateScreen";
import "./index.css";

const TABS = [
  { id: "analyze",     emoji: "📸", label: "Analyze"  },
  { id: "personality", emoji: "🧠", label: "Profile"  },
  { id: "coach",       emoji: "💬", label: "Coach"    },
  { id: "simulate",    emoji: "🎭", label: "Simulate" },
];

export default function App() {
  const [tab, setTab] = useState("analyze");

  return (
    <div className="app-shell">
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
      </main>
    </div>
  );
}
