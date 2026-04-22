import { useState, useEffect } from "react";
import { getChallengeDetails, incrementChallenge, DAILY_CHALLENGES } from "../lib/stats";

export default function ChallengeScreen() {
  const [challenge, setChallenge] = useState(null);
  const [showCompleted, setShowCompleted] = useState(false);

  useEffect(() => {
    const chalData = getChallengeDetails();
    setChallenge(chalData);
    setShowCompleted(chalData.completed);
  }, []);

  const handleProgress = () => {
    const updated = incrementChallenge(1);
    setChallenge(updated);
    
    if (updated.completed && !showCompleted) {
      setShowCompleted(true);
      // Play celebration animation
      setTimeout(() => setShowCompleted(false), 3000);
    }
  };

  if (!challenge) return null;

  const remaining = challenge.target - challenge.progress;
  const progressPercent = (challenge.progress / challenge.target) * 100;

  return (
    <div>
      {/* Completion Celebration */}
      {showCompleted && (
        <div className="completion-celebration">
          <div className="confetti" />
          <div className="completion-popup">
            <div style={{ fontSize: 48, marginBottom: 12, animation: "bounce 0.6s ease" }}>
              🎉
            </div>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: "var(--accent)", marginBottom: 8 }}>
              Challenge Complete!
            </h2>
            <p style={{ fontSize: 14, color: "var(--text2)", marginBottom: 16 }}>
              +{challenge.reward} XP earned
            </p>
            <p style={{ fontSize: 13, color: "var(--text3)" }}>
              Come back tomorrow for a new challenge
            </p>
          </div>
        </div>
      )}

      <div className="hero">
        <div className="hero-content">
          <div className="hero-eyebrow">🎯 Daily Challenge</div>
          <h2>Complete Today's Quest</h2>
          <p>Finish the challenge to earn bonus XP and keep your streak alive.</p>
        </div>
      </div>

      {/* Challenge Card */}
      <div className="challenge-card large">
        <div style={{ display: "flex", gap: 16, marginBottom: 20 }}>
          <div style={{ fontSize: 48 }}>{challenge.emoji}</div>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: "var(--text)", marginBottom: 6 }}>
              {challenge.title}
            </h2>
            <p style={{ fontSize: 13, color: "var(--text2)", lineHeight: 1.6 }}>
              {challenge.desc}
            </p>
          </div>
        </div>

        {/* Progress */}
        <div className="progress-section">
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
            <span style={{ fontSize: 12, color: "var(--text2)", fontWeight: 600 }}>PROGRESS</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: "var(--accent)" }}>
              {challenge.progress} / {challenge.target}
            </span>
          </div>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Reward */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px", background: "rgba(0,217,255,0.1)", borderRadius: "var(--r-sm)", border: "1px solid var(--border2)", marginTop: 16 }}>
          <span style={{ fontSize: 24 }}>⚡</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>XP Reward</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "var(--accent2)" }}>+{challenge.reward} XP</div>
          </div>
        </div>

        {/* Tips based on challenge type */}
        {challenge.type === 'persona' && (
          <div style={{ marginTop: 20 }}>
            <div className="section-label">How to complete</div>
            <div className="insight-box">
              <div className="insight-label">Pro Tip</div>
              <p>Navigate to the "Simulate" tab, choose the {challenge.label} persona, and keep the conversation going naturally. Each reply counts toward your progress!</p>
            </div>
          </div>
        )}

        {challenge.type === 'coach' && (
          <div style={{ marginTop: 20 }}>
            <div className="section-label">How to complete</div>
            <div className="insight-box">
              <div className="insight-label">Pro Tip</div>
              <p>Go to the "Coach" tab, type out your messages, and rewrite them using different styles. Each successful rewrite counts!</p>
            </div>
          </div>
        )}

        {challenge.type === 'analyze' && (
          <div style={{ marginTop: 20 }}>
            <div className="section-label">How to complete</div>
            <div className="insight-box">
              <div className="insight-label">Pro Tip</div>
              <p>Visit the "Analyze" tab and upload screenshots or paste conversations. You can paste the demo conversation or your own messages!</p>
            </div>
          </div>
        )}

        {challenge.type === 'personality' && (
          <div style={{ marginTop: 20 }}>
            <div className="section-label">How to complete</div>
            <div className="insight-box">
              <div className="insight-label">Pro Tip</div>
              <p>Go to the "Profile" tab and paste different conversations to analyze. Each analysis counts toward your challenge!</p>
            </div>
          </div>
        )}
      </div>

      {/* Status */}
      {challenge.completed ? (
        <div style={{ marginTop: 20, textAlign: "center", padding: 20 }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>✨</div>
          <p style={{ fontSize: 14, color: "var(--accent2)", fontWeight: 600 }}>Challenge Complete!</p>
          <p style={{ fontSize: 12, color: "var(--text2)", marginTop: 8 }}>
            A new challenge will be available tomorrow
          </p>
        </div>
      ) : (
        <div style={{ marginTop: 20, textAlign: "center" }}>
          <p style={{ fontSize: 13, color: "var(--text2)", marginBottom: 14 }}>
            {remaining} more {remaining === 1 ? "action" : "actions"} to complete!
          </p>
        </div>
      )}
    </div>
  );
}
