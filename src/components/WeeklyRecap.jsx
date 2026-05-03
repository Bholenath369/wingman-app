// src/components/WeeklyRecap.jsx
// Bottom sheet shown once per week with the user's activity summary.
// Motivational, visually rich — encourages continued use and sharing.

import { useState, useEffect } from "react";
import { getFullStats } from "../lib/stats";

const RECAP_KEY = "wm_recap_shown";
const MIN_ACTIONS = 2; // only show if user has done something

function getMotivation(stats) {
  if (stats.streak >= 7) return `That ${stats.streak}-day streak is unreal. You're unstoppable. 🔥`;
  if (stats.streak >= 3)  return `${stats.streak} days in a row. Consistency is what separates good from great. 💪`;
  if (stats.analyses >= 20) return `${stats.analyses} chats analyzed. You read people better than most. 🎯`;
  if (stats.level >= 3)   return `Level ${stats.level} already? You're learning faster than anyone. ⚡`;
  return "Every great conversation starts with the right words. You're getting there. 💙";
}

export default function WeeklyRecap({ onClose }) {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const s = getFullStats();
    const total = (s.analyses || 0) + (s.rewrites || 0) + (s.simulations || 0);
    if (total >= MIN_ACTIONS) {
      setStats(s);
      localStorage.setItem(RECAP_KEY, Date.now().toString());
    } else {
      onClose();
    }
  }, []);

  if (!stats) return null;

  const motivation = getMotivation(stats);
  const total = (stats.analyses || 0) + (stats.rewrites || 0);

  async function shareRecap() {
    const text = `📊 My Wingman stats:\n\n🔍 ${stats.analyses} chats analyzed\n✍️ ${stats.rewrites} messages rewritten\n🔥 ${stats.streak}-day streak\n⚡ Level ${stats.level}\n\nFind the words. Win the heart.\nwingman-six-beta.vercel.app`;
    if (navigator.share) {
      try { await navigator.share({ text, url: "https://wingman-six-beta.vercel.app" }); } catch {}
    } else {
      try { await navigator.clipboard.writeText(text); } catch {}
    }
  }

  return (
    <div className="recap-overlay" onClick={onClose}>
      <div className="recap-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="recap-handle" />

        <div className="recap-header">
          <span className="recap-emoji">{stats.streak >= 3 ? "🔥" : "📊"}</span>
          <div className="recap-title">
            {stats.streak >= 3 ? `${stats.streak}-Day Streak!` : "Your Progress"}
          </div>
          <div className="recap-subtitle">Here's what you've been up to</div>
        </div>

        <div className="recap-stats-grid">
          <div className="recap-stat">
            <span className="recap-stat-value">{stats.analyses}</span>
            <span className="recap-stat-label">Analyzed</span>
          </div>
          <div className="recap-stat">
            <span className="recap-stat-value">{stats.rewrites}</span>
            <span className="recap-stat-label">Rewrites</span>
          </div>
          <div className="recap-stat">
            <span className="recap-stat-value" style={{ background: "linear-gradient(135deg,#FF1A6C,#9D4EDD)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              {stats.level}
            </span>
            <span className="recap-stat-label">Level</span>
          </div>
        </div>

        <div className="recap-message">"{motivation}"</div>

        <button className="recap-share-btn" onClick={shareRecap}>
          Share my stats 🔗
        </button>
        <button className="recap-close-btn" onClick={onClose}>
          Keep going →
        </button>
      </div>
    </div>
  );
}
