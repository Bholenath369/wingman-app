import { useState, useEffect, useRef } from "react";
import { useAuth } from "@clerk/clerk-react";
import AnalyzeScreen      from "./screens/AnalyzeScreen";
import PersonalityScreen  from "./screens/PersonalityScreen";
import CoachScreen        from "./screens/CoachScreen";
import SimulateScreen     from "./screens/SimulateScreen";
import ProfileScreen      from "./screens/ProfileScreen";
import StatsScreen        from "./screens/StatsScreen";
import LoginScreen        from "./screens/LoginScreen";
import LandingScreen      from "./screens/LandingScreen";
import SSOCallback        from "./screens/SSOCallback";
import ParticleBackground from "./components/ParticleBackground";
import TabTransition      from "./components/TabTransition";
import OnboardingModal    from "./components/OnboardingModal";
import UserMenu           from "./components/UserMenu";
import TopHeader          from "./components/TopHeader";
import WeeklyRecap        from "./components/WeeklyRecap";
import PWAInstallBanner   from "./components/PWAInstallBanner";
import { redeemUpgrade, useUsage } from "./lib/useUsage";
import { getUserVibe }    from "./lib/claude";
import { addRipple, premiumUnlockCelebration, haptic } from "./lib/animations";
import { claimReferralBonus } from "./lib/referral";
import "./index.css";

const TABS = [
  { id: "analyze",     emoji: "📸", label: "Analyze"  },
  { id: "personality", emoji: "🧠", label: "Decode"   },
  { id: "coach",       emoji: "💬", label: "Coach"    },
  { id: "simulate",    emoji: "🎭", label: "Practice" },
  { id: "stats",       emoji: "📊", label: "Stats"    },
];

export default function App() {
  const { isSignedIn, isLoaded } = useAuth();
  const [showLanding, setShowLanding] = useState(
    () => !localStorage.getItem("wm_seen_landing")
  );

  // Show SSO callback screen when Clerk redirects back from OAuth
  if (isLoaded && window.location.hash.startsWith("#/sso-callback")) {
    return <SSOCallback />;
  }

  // While Clerk loads, show nothing (avoids flash of login screen)
  if (!isLoaded) return null;

  // Not signed in → landing (first visit) or login (returning visitor)
  if (!isSignedIn) {
    if (showLanding) {
      return (
        <LandingScreen
          onGetStarted={() => {
            localStorage.setItem("wm_seen_landing", "1");
            setShowLanding(false);
          }}
        />
      );
    }
    return <LoginScreen />;
  }

  return <AppInner />;
}

function AppInner() {
  const { isPremium, remaining, loading: usageLoading } = useUsage();
  const [tab, setTab]           = useState("analyze");
  const [upgradeStatus, setUpgradeStatus] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showRecap, setShowRecap] = useState(false);
  const [showRefBonus, setShowRefBonus] = useState(false);
  const navBtnRefs = useRef([]);

  // Claim referral bonus on first load
  useEffect(() => {
    const claimed = claimReferralBonus();
    if (claimed) setShowRefBonus(true);
  }, []);

  // Dynamic page title per tab
  useEffect(() => {
    const titles = {
      analyze:     "Analyze Chat — Wingman",
      personality: "Decode Personality — Wingman",
      coach:       "Message Coach — Wingman",
      simulate:    "Practice Mode — Wingman",
      stats:       "Your Stats — Wingman",
    };
    document.title = titles[tab] || "Wingman — Find the words. Win the heart.";
  }, [tab]);

  // Weekly recap — show once a week, 5s after load
  useEffect(() => {
    const last = localStorage.getItem("wm_recap_shown");
    const daysSince = last ? (Date.now() - parseInt(last)) / (1000 * 60 * 60 * 24) : 999;
    if (daysSince >= 7) {
      const t = setTimeout(() => setShowRecap(true), 5000);
      return () => clearTimeout(t);
    }
  }, []);

  useEffect(() => {
    navBtnRefs.current.forEach((el) => addRipple(el));
  }, []);

  useEffect(() => {
    if (!getUserVibe()) {
      const t = setTimeout(() => setShowOnboarding(true), 900);
      return () => clearTimeout(t);
    }
  }, []);

  // Stripe redirect handling
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const upgrade = params.get("upgrade");
    const sessionId = params.get("session_id");
    if (upgrade === "success" && sessionId) {
      redeemUpgrade(sessionId).then((ok) => {
        if (ok) {
          setUpgradeStatus("success");
          premiumUnlockCelebration();
          setTimeout(() => window.location.reload(), 2400);
        } else {
          setUpgradeStatus("failed");
        }
        window.history.replaceState({}, "", window.location.pathname);
      });
    } else if (upgrade === "cancel") {
      setUpgradeStatus("cancelled");
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  function handleTabChange(id) {
    if (id === tab) return;
    haptic("light");
    setTab(id);
  }

  return (
    <div className="app-shell">
      <ParticleBackground />

      {showRecap && <WeeklyRecap onClose={() => setShowRecap(false)} />}
      <PWAInstallBanner />

      {showOnboarding && (
        <OnboardingModal onComplete={() => setShowOnboarding(false)} />
      )}

      {upgradeStatus === "success" && (
        <div style={successToast}>✓ Welcome to Premium! Reloading…</div>
      )}
      {upgradeStatus === "cancelled" && (
        <div style={cancelToast}>Upgrade cancelled — no charge</div>
      )}
      {showRefBonus && (
        <div style={refBonusToast}>
          🎁 +5 bonus analyses added! Welcome to Wingman.
          <button
            style={{ background: "none", border: "none", color: "inherit", marginLeft: 8, cursor: "pointer", fontWeight: 700, fontSize: 16, lineHeight: 1 }}
            onClick={() => setShowRefBonus(false)}
          >×</button>
        </div>
      )}

      <nav className="bottom-nav">
        {TABS.map((t, i) => (
          <button
            key={t.id}
            ref={(el) => { navBtnRefs.current[i] = el; }}
            className={`nav-btn ${tab === t.id ? "active" : ""}`}
            onClick={() => handleTabChange(t.id)}
            style={{ position: "relative", overflow: "hidden" }}
          >
            <span
              className="nav-emoji"
              style={{
                display: "inline-block",
                transition: "transform 0.3s cubic-bezier(0.34,1.56,0.64,1)",
                transform: tab === t.id ? "scale(1.2)" : "scale(1)",
              }}
            >
              {t.emoji}
            </span>
            <span className="nav-label">{t.label}</span>
          </button>
        ))}
      </nav>

      <TopHeader isPremium={isPremium} remaining={remaining} usageLoading={usageLoading} />

      <main className="screen-area" style={{ position: "relative", zIndex: 1 }}>
        <TabTransition activeTab={tab}>
          {(displayTab) => (
            <>
              <div style={{ display: displayTab === "analyze"     ? "block" : "none" }}><AnalyzeScreen /></div>
              <div style={{ display: displayTab === "personality" ? "block" : "none" }}><PersonalityScreen /></div>
              <div style={{ display: displayTab === "coach"       ? "block" : "none" }}><CoachScreen /></div>
              <div style={{ display: displayTab === "simulate"    ? "block" : "none" }}><SimulateScreen /></div>
              <div style={{ display: displayTab === "stats"       ? "block" : "none" }}><StatsScreen /></div>
            </>
          )}
        </TabTransition>
      </main>
    </div>
  );
}

const successToast = {
  position: "fixed", top: 20, left: "50%", transform: "translateX(-50%)",
  background: "linear-gradient(135deg,#22C55E,#16A34A)",
  color: "#fff", padding: "12px 24px", borderRadius: 12,
  fontSize: 13, fontWeight: 600, zIndex: 10000,
  boxShadow: "0 4px 20px rgba(34,197,94,0.35)",
  animation: "slideUp 0.35s ease",
};
const cancelToast = {
  position: "fixed", top: 20, left: "50%", transform: "translateX(-50%)",
  background: "rgba(239,68,68,0.15)", border: "0.5px solid rgba(239,68,68,0.3)",
  color: "#FCA5A5", padding: "10px 20px", borderRadius: 12,
  fontSize: 13, zIndex: 10000,
  animation: "slideUp 0.35s ease",
};
const refBonusToast = {
  position: "fixed", top: 20, left: "50%", transform: "translateX(-50%)",
  background: "linear-gradient(135deg, rgba(157,78,221,0.25), rgba(255,26,108,0.15))",
  border: "1px solid rgba(157,78,221,0.4)",
  color: "#E9D5FF", padding: "12px 20px", borderRadius: 14,
  fontSize: 13, fontWeight: 600, zIndex: 10000,
  animation: "slideUp 0.4s cubic-bezier(0.34,1.56,0.64,1)",
  display: "flex", alignItems: "center", gap: 4,
  boxShadow: "0 8px 32px rgba(157,78,221,0.25)",
  whiteSpace: "nowrap",
  fontFamily: "'Sora', sans-serif",
};
