import WingmanLogoMark from "../components/WingmanLogoMark";

const palette = {
  bg1: "#05030D",
  bg2: "#0A0617",
  bg3: "#13051F",
  surface1: "#0E0A1D",
  surface2: "#140C26",
  pink1: "#FF2E93",
  pink2: "#FF4FC3",
  purple1: "#7C3AED",
  purple2: "#A855F7",
  blue1: "#3B82F6",
  blue2: "#4CC9FF",
  text1: "#F8F4FF",
  text2: "#D3C8E8",
  text3: "#A89BC2",
};

export default function LandingScreen({ onGetStarted }) {
  return (
    <main style={page}>
      <img src="/images/wingman-neon-heart.svg" alt="" aria-hidden="true" style={bgImage} />
      <div style={orbPink} />
      <div style={orbPurple} />
      <div style={orbBlue} />

      <section style={phone}>
        <div style={island} />
        <div style={status}><span>9:41</span><span>LTE WIFI</span></div>

        <div style={floatingLeft}>...</div>
        <div style={floatingRight}>...</div>

        <div style={brand}>
          <WingmanLogoMark size={40} pulse />
          <strong style={brandText}>Wingman</strong>
        </div>

        <header style={hero}>
          <div style={trustBadge}>Used by 12,000+ users</div>
          <h1 style={headline}>Turn texts<br />into <span style={accent}>attraction</span></h1>
          <p style={subhead}>Know exactly what to say — every time.</p>
        </header>

        <section style={visualCard}>
          <img src="/images/wingman-chat-bubbles.svg" alt="Glowing chat bubbles" style={visualImage} />
          <div style={visualOverlay}>
            <span style={visualPill}>AI Dating Assistant</span>
          </div>
        </section>

        <section style={chatBox}>
          <div style={leftRow}>
            <div style={avatarA} />
            <div style={bubbleDark}>
              <small style={label}>Her</small>
              <p style={message}>hey</p>
            </div>
          </div>

          <div style={rightRow}>
            <div style={bubbleBlue}>
              <small style={label}>You</small>
              <p style={message}>hey wanna hang out?</p>
            </div>
            <div style={avatarB} />
          </div>

          <div style={aiRow}>
            <div style={mark}>W</div>
            <div style={aiBubble}>
              <small style={aiLabel}>AI improved reply</small>
              <p style={aiText}>Careful... you might start liking me</p>
            </div>
          </div>
        </section>

        <button style={cta} onClick={onGetStarted}>Get Perfect Reply</button>

        <section style={actions}>
          <button style={action} onClick={onGetStarted}><span style={icon}>◌</span><span>Analyze</span><span>personality</span></button>
          <button style={action} onClick={onGetStarted}><span style={icon}>○</span><span>Practice</span><span>chat</span></button>
          <button style={action} onClick={onGetStarted}><span style={icon}>✎</span><span>Improve</span><span>message</span></button>
        </section>
      </section>
    </main>
  );
}

const page = { minHeight: "100dvh", display: "grid", placeItems: "center", padding: 14, position: "relative", overflowX: "hidden", overflowY: "auto", color: palette.text1, background: "radial-gradient(circle at 20% 10%, rgba(255,46,147,.16), transparent 28%), radial-gradient(circle at 80% 15%, rgba(168,85,247,.14), transparent 30%), radial-gradient(circle at 70% 65%, rgba(76,201,255,.08), transparent 28%), linear-gradient(180deg,#05030D 0%,#0A0617 40%,#13051F 100%)", fontFamily: "Inter, system-ui, -apple-system, Segoe UI, sans-serif" };
const bgImage = { position: "fixed", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: .14, filter: "blur(1px) saturate(1.15)", pointerEvents: "none" };
const orbPink = { position: "fixed", width: 420, height: 420, borderRadius: "50%", background: "rgba(255,46,147,.36)", filter: "blur(124px)", top: -120, right: -120, pointerEvents: "none" };
const orbPurple = { position: "fixed", width: 360, height: 360, borderRadius: "50%", background: "rgba(168,85,247,.24)", filter: "blur(116px)", top: "34%", left: -110, pointerEvents: "none" };
const orbBlue = { position: "fixed", width: 380, height: 380, borderRadius: "50%", background: "rgba(76,201,255,.14)", filter: "blur(118px)", bottom: -120, right: -130, pointerEvents: "none" };
const phone = { width: "min(100%,430px)", minHeight: "min(900px, calc(100dvh - 28px))", position: "relative", zIndex: 1, overflow: "hidden", borderRadius: 46, padding: "24px 22px 28px", background: "radial-gradient(circle at 78% 12%,rgba(168,85,247,.22),transparent 28%), radial-gradient(circle at 20% 88%,rgba(255,46,147,.18),transparent 30%), linear-gradient(180deg,rgba(5,3,13,.98),rgba(10,6,23,.98) 44%,rgba(19,5,31,.98))", border: "1px solid rgba(255,79,195,.22)", boxShadow: "0 28px 90px rgba(0,0,0,.72),0 0 58px rgba(255,46,147,.18),0 0 76px rgba(168,85,247,.20),inset 0 0 34px rgba(255,255,255,.035)" };
const island = { position: "absolute", top: 14, left: "50%", transform: "translateX(-50%)", width: 118, height: 34, borderRadius: 999, background: "#000", zIndex: 3 };
const status = { position: "relative", zIndex: 4, display: "flex", justifyContent: "space-between", fontSize: 14, fontWeight: 800, marginBottom: 26, color: "rgba(248,244,255,.92)" };
const floatingLeft = { position: "absolute", top: 94, left: 32, width: 58, height: 40, borderRadius: "18px 18px 18px 6px", display: "grid", placeItems: "center", color: "rgba(248,244,255,.42)", background: "rgba(255,79,195,.12)", border: "1px solid rgba(255,79,195,.22)", boxShadow: "0 0 28px rgba(255,46,147,.24)" };
const floatingRight = { ...floatingLeft, left: "auto", right: 30, top: 134, borderRadius: "18px 18px 6px 18px", background: "rgba(168,85,247,.13)", border: "1px solid rgba(168,85,247,.28)", boxShadow: "0 0 28px rgba(168,85,247,.26)" };
const brand = { position: "relative", zIndex: 2, display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginTop: 16 };
const brandText = { fontSize: 24, letterSpacing: "-.5px", color: palette.text1 };
const hero = { position: "relative", zIndex: 2, textAlign: "center", marginTop: 30 };
const trustBadge = { width: "fit-content", margin: "0 auto 14px", padding: "7px 13px", borderRadius: 999, background: "rgba(255,255,255,.045)", border: "1px solid rgba(255,79,195,.35)", color: palette.text2, fontSize: 12, fontWeight: 700, boxShadow: "0 0 22px rgba(255,46,147,.16)" };
const headline = { margin: 0, fontSize: "clamp(42px,12vw,60px)", lineHeight: 1.05, letterSpacing: "-2.7px", fontWeight: 950, color: palette.text1 };
const accent = { background: "linear-gradient(90deg,#FFFFFF 0%,#FF4FC3 58%,#FF2E93 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" };
const subhead = { margin: "16px auto 0", maxWidth: 330, fontSize: 18, lineHeight: 1.45, color: "rgba(211,200,232,.82)", fontWeight: 500 };
const visualCard = { position: "relative", zIndex: 2, height: 170, marginTop: 26, borderRadius: 28, overflow: "hidden", background: "rgba(14,10,29,.72)", border: "1px solid rgba(255,79,195,.25)", boxShadow: "0 0 32px rgba(255,46,147,.18),0 0 44px rgba(168,85,247,.16),inset 0 1px 0 rgba(255,255,255,.05)" };
const visualImage = { width: "100%", height: "100%", objectFit: "cover", opacity: .95, filter: "saturate(1.12) contrast(1.04)" };
const visualOverlay = { position: "absolute", inset: 0, display: "flex", alignItems: "flex-end", justifyContent: "center", paddingBottom: 14, background: "linear-gradient(to bottom, transparent, rgba(5,3,13,.52))" };
const visualPill = { padding: "8px 14px", borderRadius: 999, background: "rgba(5,3,13,.62)", border: "1px solid rgba(255,79,195,.28)", color: palette.text1, fontSize: 13, fontWeight: 800, backdropFilter: "blur(14px)", boxShadow: "0 0 18px rgba(255,46,147,.16)" };
const chatBox = { position: "relative", zIndex: 2, marginTop: 22, padding: "22px 18px", borderRadius: 30, background: "linear-gradient(180deg,rgba(20,12,38,.78),rgba(14,10,29,.58))", border: "1px solid rgba(255,79,195,.30)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)", boxShadow: "0 0 30px rgba(168,85,247,.16), inset 0 1px 0 rgba(255,255,255,.05)" };
const leftRow = { display: "flex", alignItems: "center", gap: 12, marginBottom: 20 };
const rightRow = { display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 12, marginBottom: 20 };
const avatarBase = { width: 48, height: 48, borderRadius: "50%", flexShrink: 0, border: "2px solid rgba(255,79,195,.28)", boxShadow: "0 0 18px rgba(255,46,147,.20)" };
const avatarA = { ...avatarBase, background: "linear-gradient(135deg,#FF2E93,#A855F7)" };
const avatarB = { ...avatarBase, background: "linear-gradient(135deg,#3B82F6,#4CC9FF)" };
const label = { display: "block", marginBottom: 5, color: palette.text3, fontSize: 14 };
const message = { margin: 0, color: palette.text1, fontSize: "clamp(19px,5vw,24px)", lineHeight: 1.18, fontWeight: 650 };
const bubbleDark = { padding: "13px 20px", minWidth: 106, borderRadius: 23, background: "rgba(255,255,255,.055)", border: "1px solid rgba(255,255,255,.08)" };
const bubbleBlue = { padding: "13px 18px", maxWidth: "72%", borderRadius: "23px 23px 6px 23px", background: "linear-gradient(135deg,rgba(59,130,246,.95),rgba(39,74,188,.95))", border: "1px solid rgba(76,201,255,.26)", boxShadow: "0 0 22px rgba(76,201,255,.18)" };
const aiRow = { display: "flex", alignItems: "center", gap: 14 };
const mark = { width: 58, height: 58, borderRadius: "50%", display: "grid", placeItems: "center", flexShrink: 0, fontSize: 28, fontWeight: 950, background: "rgba(5,3,13,.92)", border: "1px solid rgba(255,79,195,.45)", color: palette.pink2, boxShadow: "0 0 26px rgba(255,46,147,.32)" };
const aiBubble = { flex: 1, padding: 18, borderRadius: "24px 24px 24px 8px", background: "linear-gradient(135deg,rgba(255,46,147,.18),rgba(168,85,247,.16))", border: "1px solid rgba(255,79,195,.38)", boxShadow: "0 0 28px rgba(255,46,147,.28), inset 0 1px 0 rgba(255,255,255,.10)" };
const aiLabel = { display: "block", marginBottom: 8, color: palette.pink2, fontSize: 14, fontWeight: 750 };
const aiText = { margin: 0, fontSize: "clamp(22px,6vw,29px)", lineHeight: 1.22, fontWeight: 700, color: palette.text1, letterSpacing: "-.6px" };
const cta = { position: "relative", zIndex: 2, width: "100%", marginTop: 24, minHeight: 72, border: "none", borderRadius: 27, cursor: "pointer", color: "#fff", fontSize: "clamp(22px,6vw,29px)", fontWeight: 900, letterSpacing: "-.8px", background: "linear-gradient(90deg,#FF2E93 0%,#FF4FC3 38%,#C84DFF 72%,#8B5CF6 100%)", boxShadow: "0 0 24px rgba(255,46,147,.35),0 0 48px rgba(168,85,247,.22),inset 0 1px 0 rgba(255,255,255,.35)" };
const actions = { position: "relative", zIndex: 2, display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginTop: 22 };
const action = { minHeight: 116, padding: "14px 8px", borderRadius: 22, border: "1px solid rgba(255,255,255,.08)", background: "rgba(15,10,31,.72)", color: palette.text1, cursor: "pointer", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", fontSize: "clamp(15px,4.4vw,20px)", fontWeight: 720, backdropFilter: "blur(18px)", WebkitBackdropFilter: "blur(18px)", boxShadow: "0 0 30px rgba(168,85,247,.14), inset 0 1px 0 rgba(255,255,255,.05)" };
const icon = { fontSize: 29, color: palette.pink2, textShadow: "0 0 20px rgba(255,79,195,.70)", marginBottom: 8, lineHeight: 1 };
