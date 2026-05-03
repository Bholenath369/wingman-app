import { useState, useEffect } from "react";
import { getFullStats, BADGES, checkAndUnlockBadges, DAILY_CHALLENGES } from "../lib/stats";
import ReferralCard from "../components/ReferralCard";

export default function StatsScreen() {
  const [stats, setStats] = useState(null);
  const [newBadges, setNewBadges] = useState([]);

  useEffect(() => {
    const freshStats = getFullStats();
    setStats(freshStats);

    const badges = checkAndUnlockBadges();
    if (badges.length > 0) {
      setNewBadges(badges);
      setTimeout(() => setNewBadges([]), 4000);
    }
  }, []);

  if (!stats) return null;

  const challengeData = DAILY_CHALLENGES.find(c => c.id === stats.challenge.challengeId);
  const progressPercent = (stats.challenge.progress / stats.challenge.target) * 100;

  return (
    <div>
      {/* Header */}
      <div className="hero" style={{ background: "linear-gradient(135deg, rgba(0,217,255,0.15), rgba(123,47,190,0.15))" }}>
        <div className="hero-content">
          <div className="hero-eyebrow">📊 Your Stats</div>
          <h2>Level {stats.level}</h2>
          <p>Keep grinding. You're getting better every day.</p>
        </div>
      </div>

      {/* New Badges Celebration */}
      {newBadges.length > 0 && (
        <div className="badge-celebration">
          <div className="badge-popup">
            <div style={{ fontSize: 40, marginBottom: 10 }}>🎉</div>
            <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>New Badge Unlocked!</p>
            <p style={{ fontSize: 12, color: "var(--text2)", marginTop: 4 }}>
              {BADGES[newBadges[0]]?.name}
            </p>
          </div>
        </div>
      )}

      {/* XP Progress Bar */}
      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <span className="card-title">Experience</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: "var(--accent2)" }}>
            {stats.xp.toLocaleString()} XP
          </span>
        </div>
        <div className="xp-bar">
          <div className="xp-fill" style={{ width: `${(stats.xpThisLevel / stats.xpPerLevel) * 100}%` }} />
        </div>
        <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 8, textAlign: "center" }}>
          {stats.xpThisLevel} / {stats.xpPerLevel} XP to Level {stats.level + 1}
        </div>
      </div>

      {/* Streak */}
      <div className="stat-card-grid">
        <div className="stat-card">
          <div className="stat-icon">🔥</div>
          <div className="stat-value">{stats.streak}</div>
          <div className="stat-label">Day Streak</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⚡</div>
          <div className="stat-value">{stats.analyses}</div>
          <div className="stat-label">Analyzed</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💬</div>
          <div className="stat-value">{stats.rewrites}</div>
          <div className="stat-label">Rewrites</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🎭</div>
          <div className="stat-value">{stats.simulations}</div>
          <div className="stat-label">Simulations</div>
        </div>
      </div>

      {/* Daily Challenge */}
      <div className="section-label">Today's Challenge</div>
      <div className="challenge-card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 20, marginBottom: 6 }}>{challengeData.emoji}</div>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", marginBottom: 3 }}>
              {challengeData.title}
            </h3>
            <p style={{ fontSize: 12, color: "var(--text2)" }}>
              {challengeData.desc}
            </p>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: "var(--accent)" }}>
              +{challengeData.reward} XP
            </div>
            {stats.challenge.completed && (
              <div style={{ fontSize: 11, color: "var(--accent2)", marginTop: 4, fontWeight: 600 }}>
                ✓ Completed!
              </div>
            )}
          </div>
        </div>

        <div className="progress-bar-container">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${progressPercent}%`, background: stats.challenge.completed ? "linear-gradient(90deg, #4ADE80, #22C55E)" : "linear-gradient(90deg, #FF1A6C, #FF5595)" }}
            />
          </div>
          <div style={{ fontSize: 11, color: "var(--text2)", marginTop: 8, textAlign: "center" }}>
            {stats.challenge.progress} / {stats.challenge.target} completed
          </div>
        </div>
      </div>

      {/* Badges */}
      <div className="section-label" style={{ marginTop: 20 }}>Badges Earned</div>
      <div className="badge-grid">
        {Object.values(BADGES).map((badge) => (
          <div
            key={badge.id}
            className={`badge-item ${stats.badges.includes(badge.id) ? "unlocked" : "locked"}`}
            title={badge.desc}
          >
            <div className="badge-emoji">{badge.emoji}</div>
            <div className="badge-name">{badge.name}</div>
          </div>
        ))}
      </div>

      {stats.badges.length === 0 && (
        <div style={{ textAlign: "center", padding: "20px", color: "var(--text2)", fontSize: 13 }}>
          Complete actions to unlock badges 🎯
        </div>
      )}

      {/* Stats */}
      <div className="section-label" style={{ marginTop: 20 }}>Stats</div>
      <div className="card">
        <div className="stat-row">
          <span style={{ color: "var(--text2)" }}>Member Since</span>
          <span style={{ color: "var(--text)" }}>
            {new Date(stats.createdAt).toLocaleDateString()}
          </span>
        </div>
        <div className="stat-row">
          <span style={{ color: "var(--text2)" }}>Last Active</span>
          <span style={{ color: "var(--text)" }}>
            {new Date(stats.lastActive).toLocaleDateString()}
          </span>
        </div>
        <div className="stat-row">
          <span style={{ color: "var(--text2)" }}>Total Shares</span>
          <span style={{ color: "var(--text)" }}>{stats.shares}</span>
        </div>
      </div>
      {/* Referral */}
      <div className="section-label" style={{ marginTop: 20 }}>Invite friends</div>
      <ReferralCard />

    </div>
  );
}
