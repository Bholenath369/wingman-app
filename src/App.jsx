import { useState, useEffect, useRef } from "react";
import { useAuth } from "@clerk/clerk-react";
import AnalyzeScreen      from "./screens/AnalyzeScreen";
import PersonalityScreen  from "./screens/PersonalityScreen";
import CoachScreen        from "./screens/CoachScreen";
import SimulateScreen     from "./screens/SimulateScreen";
import ProfileScreen      from "./screens/ProfileScreen";
import LoginScreen        from "./screens/LoginScreen";
import SSOCallback        from "./screens/SSOCallback";
import ParticleBackground from "./components/ParticleBackground";
import TabTransition      from "./components/TabTransition";
import OnboardingModal    from "./components/OnboardingModal";
import UserMenu           from "./components/UserMenu";
import { redeemUpgrade, useUsage } from "./lib/useUsage";
import { getUserVibe }    from "./lib/claude";
import { addRipple, premiumUnlockCelebration, haptic } from "./lib/animations";
import "./index.css";

const TABS = [
  { id: "analyze",     emoji: "📸", label: "Analyze"  },
  { id: "personality", emoji: "🧠", label: "Decode"   },
  { id: "coach",       emoji: "💬", label: "Coach"    },
  { id: "simulate",    emoji: "🎭", label: "Practice" },
  { id: "profile",     emoji: "👤", label: "Profile"  },
];

export default function App() {
  const { isSignedIn, isLoaded } = useAuth();

  // Show SSO callback screen when Clerk redirects back from OAuth
  if (isLoaded && window.location.hash.startsWith("#/sso-callback")) {
    return <SSOCallback />;
  }

  // While Clerk loads, show nothing (avoids flash of login screen)
  if (!isLoaded) return null;

  // Not signed in → full-screen login wall
  if (!isSignedIn) return <LoginScreen />;

  return <AppInner />;
}

function AppInner() {
  const { isPremium } = useUsage();
  const [tab, setTab]           = useState("analyze");
  const [upgradeStatus, setUpgradeStatus] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const navBtnRefs = useRef([]);

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

      {showOnboarding && (
        <OnboardingModal onComplete={() => setShowOnboarding(false)} />
      )}

      {upgradeStatus === "success" && (
        <div style={successToast}>✓ Welcome to Premium! Reloading…</div>
      )}
      {upgradeStatus === "cancelled" && (
        <div style={cancelToast}>Upgrade cancelled — no charge</div>
      )}

      <nav className="bottom-nav">
        {/* User avatar sits at the far left of the nav bar */}
        <div style={{ display: "flex", alignItems: "center", paddingLeft: 8 }}>
          <UserMenu isPremium={isPremium} />
        </div>

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

      <main className="screen-area" style={{ position: "relative", zIndex: 1 }}>
        <TabTransition activeTab={tab}>
          {(displayTab) => (
            <>
              <div style={{ display: displayTab === "analyze"     ? "block" : "none" }}><AnalyzeScreen /></div>
              <div style={{ display: displayTab === "personality" ? "block" : "none" }}><PersonalityScreen /></div>
              <div style={{ display: displayTab === "coach"       ? "block" : "none" }}><CoachScreen /></div>
              <div style={{ display: displayTab === "simulate"    ? "block" : "none" }}><SimulateScreen /></div>
              <div style={{ display: displayTab === "profile"     ? "block" : "none" }}><ProfileScreen /></div>
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
