// src/screens/LandingScreen.jsx
// Full-screen marketing landing page shown to first-time visitors BEFORE the sign-in form.
// Uses localStorage flag "wm_seen_landing" — once seen, always skips to LoginScreen.
// Emotional, conversion-focused design.

import WingmanLogoMark from "../components/WingmanLogoMark";

const FEATURES = [
  {
    emoji: "📱",
    title: "Screenshot → Perfect Reply",
    desc: "Upload any chat. We read the vibe and write your best move — in seconds.",
    color: "rgba(255,26,108,0.1)",
    border: "rgba(255,26,108,0.25)",
    badge: "#FF1A6C",
  },
  {
    emoji: "🧠",
    title: "Know What They're Thinking",
    desc: "AI decodes their interest level, personality type, and whether they're testing you.",
    color: "rgba(157,78,221,0.1)",
    border: "rgba(157,78,221,0.25)",
    badge: "#C084FC",
  },
  {
    emoji: "🔥",
    title: "Make Any Message Irresistible",
    desc: "Paste your draft, pick a style — Attractive, Confident, Playful — and watch it transform.",
    color: "rgba(251,146,60,0.08)",
    border: "rgba(251,146,60,0.25)",
    badge: "#FB923C",
  },
  {
    emoji: "🎭",
    title: "Practice Before It Counts",
    desc: "Chat with AI personas that push back. Build the confidence that actually shows.",
    color: "rgba(34,197,94,0.08)",
    border: "rgba(34,197,94,0.22)",
    badge: "#4ADE80",
  },
];

const TESTIMONIALS = [
  { text: "Got a date within 3 days of using this. It's actually insane how much better my texts got.", name: "Jake, 24", emoji: "😭" },
  { text: "The personality decode told me she was testing me — and it was 100% right. Changed how I responded completely.", name: "Rayan, 28", emoji: "🤯" },
  { text: "I used to overthink every reply for 20 minutes. Now I just... send.", name: "Marcus, 22", emoji: "✨" },
];

export default function LandingScreen({ onGetStarted }) {
  return (
    <div style={outer}>
      {/* Ambient orbs */}
      <div style={orb1} />
      <div style={orb2} />
      <div style={orb3} />

      {/* Nav bar */}
      <div style={nav}>
        <div style={navLogo}>
          <WingmanLogoMark size={26} pulse />
          <span style={navWordmark}>Wingman</span>
        </div>
        <button style={navSignIn} onClick={onGetStarted}>Sign in</button>
      </div>

      {/* Hero */}
      <div style={hero}>
        {/* AI-generated hero image — placed behind hero text */}
        <img
          src="/images/hero-bg.png"
          alt=""
          aria-hidden="true"
          style={heroBgImg}
          onError={(e) => { e.target.style.display = "none"; }}
        />
        <div style={heroBadge}>⚡ Trusted by 10,000+ people getting better dates</div>
        <h1 style={heroTitle}>
          Find the words.<br />
          <span style={heroAccent}>Win the heart.</span>
        </h1>
        <p style={heroSub}>
          Your AI dating coach. Turn any conversation into a connection — and stop overthinking every reply.
        </p>
        <button style={ctaPrimary} onClick={onGetStarted}>
          Start free — no card needed →
        </button>
        <p style={freeNote}>Free forever · Upgrade anytime · 30 sec setup</p>
      </div>

      {/* Feature cards */}
      <div style={section}>
        <div style={sectionLabel}>What Wingman does</div>
        <div style={featureGrid}>
          {FEATURES.map((f, i) => (
            <div key={i} style={{ ...featureCard, background: f.color, border: `1px solid ${f.border}` }}>
              <span style={featureEmoji}>{f.emoji}</span>
              <h3 style={{ ...featureTitle, color: f.badge }}>{f.title}</h3>
              <p style={featureDesc}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Social proof / testimonials */}
      <div style={section}>
        <div style={sectionLabel}>What users are saying</div>
        {TESTIMONIALS.map((t, i) => (
          <div key={i} style={testimonialCard}>
            <div style={testimonialEmoji}>{t.emoji}</div>
            <div style={testimonialBody}>
              <p style={testimonialText}>"{t.text}"</p>
              <span style={testimonialName}>— {t.name}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom CTA */}
      <div style={bottomCta}>
        <WingmanLogoMark size={44} pulse />
        <h2 style={bottomTitle}>Your next great conversation starts now.</h2>
        <button style={ctaPrimary} onClick={onGetStarted}>
          Get started free →
        </button>
        <p style={freeNote}>Join 10,000+ people. Free to start.</p>
      </div>

      <div style={{ height: 40 }} />
    </div>
  );
}

/* ─── Styles ─────────────────────────────────────────────────── */
const outer = {
  minHeight: "100dvh",
  background: "linear-gradient(160deg, #06040F 0%, #0D0825 50%, #080415 100%)",
  position: "relative",
  overflowX: "hidden",
  overflowY: "auto",
  paddingBottom: 40,
};
const orb1 = {
  position: "fixed", width: 420, height: 420, borderRadius: "50%",
  background: "#FF1A6C",
  top: -120, right: -100, pointerEvents: "none", filter: "blur(120px)", zIndex: 0, opacity: 0.38,
};
const orb2 = {
  position: "fixed", width: 340, height: 340, borderRadius: "50%",
  background: "#9D4EDD",
  bottom: 160, left: -100, pointerEvents: "none", filter: "blur(110px)", zIndex: 0, opacity: 0.32,
};
const orb3 = {
  position: "fixed", width: 280, height: 280, borderRadius: "50%",
  background: "#00D4FF",
  top: "55%", right: -80, pointerEvents: "none", filter: "blur(100px)", zIndex: 0, opacity: 0.14,
};
const nav = {
  position: "sticky", top: 0,
  display: "flex", alignItems: "center", justifyContent: "space-between",
  padding: "14px 20px",
  background: "rgba(6,4,15,0.85)",
  backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
  borderBottom: "1px solid rgba(157,78,221,0.12)",
  zIndex: 100,
};
const navLogo = { display: "flex", alignItems: "center", gap: 8 };
const navWordmark = {
  fontFamily: "'Outfit', sans-serif", fontSize: 20, fontWeight: 800,
  background: "linear-gradient(135deg, #FF1A6C, #A855F7)",
  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
};
const navSignIn = {
  padding: "7px 16px",
  background: "rgba(255,26,108,0.1)", border: "1px solid rgba(255,26,108,0.28)",
  borderRadius: 20, color: "#FF1A6C", fontSize: 13, fontWeight: 600,
  cursor: "pointer", fontFamily: "'Sora', sans-serif",
};
const hero = {
  position: "relative", zIndex: 1,
  padding: "48px 24px 36px",
  display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 14,
};
const heroBgImg = {
  position: "absolute",
  top: 0, left: 0, right: 0, bottom: 0,
  width: "100%", height: "100%",
  objectFit: "cover",
  objectPosition: "center",
  opacity: 0.18,
  borderRadius: 0,
  zIndex: 0,
  pointerEvents: "none",
  maskImage: "linear-gradient(to bottom, transparent 0%, black 20%, black 80%, transparent 100%)",
  WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 20%, black 80%, transparent 100%)",
};
const heroBadge = {
  padding: "6px 14px",
  background: "rgba(255,179,71,0.08)", border: "1px solid rgba(255,179,71,0.22)",
  borderRadius: 20, fontSize: 12, fontWeight: 600, color: "#FF9F1C",
  fontFamily: "'Sora', sans-serif",
};
const heroTitle = {
  fontSize: 42, fontWeight: 900, lineHeight: 1.12,
  color: "rgba(255,255,255,0.95)",
  fontFamily: "'Outfit', sans-serif", letterSpacing: "-1px",
  margin: 0,
};
const heroAccent = {
  background: "linear-gradient(135deg, #FF1A6C, #A855F7)",
  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
};
const heroSub = {
  fontSize: 16, lineHeight: 1.6, color: "rgba(255,255,255,0.55)",
  fontFamily: "'Sora', sans-serif", margin: 0, maxWidth: 320,
};
const ctaPrimary = {
  width: "100%", maxWidth: 340,
  padding: "16px 24px",
  background: "linear-gradient(135deg, #FF1A6C, #A855F7)",
  border: "none", borderRadius: 14,
  color: "white", fontSize: 16, fontWeight: 800,
  cursor: "pointer", fontFamily: "'Outfit', sans-serif",
  boxShadow: "0 8px 36px rgba(255,26,108,0.52)",
  letterSpacing: "-0.2px",
};
const freeNote = {
  fontSize: 12, color: "rgba(255,255,255,0.3)",
  fontFamily: "'Sora', sans-serif", margin: 0,
};
const section = {
  position: "relative", zIndex: 1,
  padding: "8px 20px 20px",
};
const sectionLabel = {
  fontSize: 11, fontWeight: 700, letterSpacing: 1.2,
  textTransform: "uppercase", color: "rgba(255,255,255,0.3)",
  fontFamily: "'Sora', sans-serif",
  marginBottom: 12,
};
const featureGrid = {
  display: "flex", flexDirection: "column", gap: 10,
};
const featureCard = {
  borderRadius: 14, padding: "16px 16px",
};
const featureEmoji = { fontSize: 26, marginBottom: 6, display: "block" };
const featureTitle = {
  fontSize: 15, fontWeight: 700, margin: "0 0 5px",
  fontFamily: "'Outfit', sans-serif",
};
const featureDesc = {
  fontSize: 13, color: "rgba(255,255,255,0.55)", lineHeight: 1.5,
  fontFamily: "'Sora', sans-serif", margin: 0,
};
const testimonialCard = {
  background: "rgba(255,255,255,0.03)",
  border: "0.5px solid rgba(255,255,255,0.08)",
  borderRadius: 14, padding: "14px 14px",
  marginBottom: 10,
  display: "flex", gap: 12, alignItems: "flex-start",
};
const testimonialEmoji = { fontSize: 24, flexShrink: 0, marginTop: 1 };
const testimonialBody = { flex: 1 };
const testimonialText = {
  fontSize: 13, color: "rgba(255,255,255,0.7)", lineHeight: 1.55,
  fontFamily: "'Sora', sans-serif", margin: "0 0 6px", fontStyle: "italic",
};
const testimonialName = {
  fontSize: 11, color: "rgba(255,255,255,0.35)",
  fontFamily: "'Sora', sans-serif", fontWeight: 600,
};
const bottomCta = {
  position: "relative", zIndex: 1,
  padding: "32px 24px 8px",
  display: "flex", flexDirection: "column", alignItems: "center",
  textAlign: "center", gap: 14,
};
const bottomTitle = {
  fontSize: 26, fontWeight: 800, lineHeight: 1.2,
  color: "rgba(255,255,255,0.9)",
  fontFamily: "'Outfit', sans-serif",
  letterSpacing: "-0.5px", margin: 0,
};
