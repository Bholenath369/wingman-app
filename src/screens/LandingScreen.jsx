import WingmanLogoMark from "../components/WingmanLogoMark";

export default function LandingScreen({ onGetStarted }) {
  return (
    <main style={page}>
      <img src="/images/wingman-neon-heart.svg" alt="" aria-hidden="true" style={bgImage} />
      <div style={orbPink} />
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

const page = { minHeight: "100dvh", display: "grid", placeItems: "center", padding: 14, position: "relative", overflowX: "hidden", overflowY: "auto", color: "white", background: "radial-gradient(circle at 20% 10%, rgba(255,0,110,.18), transparent 30%), radial-gradient(circle at 82% 18%, rgba(0,194,255,.13), transparent 34%), linear-gradient(135deg,#03030A,#090316 45%,#13051F)", fontFamily: "Inter, system-ui, -apple-system, Segoe UI, sans-serif" };
const bgImage = { position: "fixed", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: .18, filter: "blur(1px)", pointerEvents: "none" };
const orbPink = { position: "fixed", width: 420, height: 420, borderRadius: "50%", background: "rgba(255,0,110,.26)", filter: "blur(120px)", top: -120, right: -120, pointerEvents: "none" };
const orbBlue = { position: "fixed", width: 380, height: 380, borderRadius: "50%", background: "rgba(0,194,255,.14)", filter: "blur(110px)", bottom: -120, left: -120, pointerEvents: "none" };
const phone = { width: "min(100%,430px)", minHeight: "min(900px, calc(100dvh - 28px))", position: "relative", zIndex: 1, overflow: "hidden", borderRadius: 46, padding: "24px 22px 28px", background: "radial-gradient(circle at 78% 12%,rgba(124,58,237,.28),transparent 26%), radial-gradient(circle at 20% 88%,rgba(255,0,110,.2),transparent 30%), linear-gradient(180deg,rgba(7,7,19,.96),rgba(8,4,20,.96) 55%,rgba(3,3,10,.98))", border: "1px solid rgba(255,255,255,.16)", boxShadow: "0 28px 90px rgba(0,0,0,.65),0 0 70px rgba(168,85,247,.28),inset 0 0 35px rgba(255,255,255,.04)" };
const island = { position: "absolute", top: 14, left: "50%", transform: "translateX(-50%)", width: 118, height: 34, borderRadius: 999, background: "#000", zIndex: 3 };
const status = { position: "relative", zIndex: 4, display: "flex", justifyContent: "space-between", fontSize: 14, fontWeight: 800, marginBottom: 26, color: "rgba(255,255,255,.9)" };
const floatingLeft = { position: "absolute", top: 94, left: 32, width: 58, height: 40, borderRadius: "18px 18px 18px 6px", display: "grid", placeItems: "center", color: "rgba(255,255,255,.38)", background: "rgba(168,85,247,.1)", border: "1px solid rgba(255,255,255,.08)", boxShadow: "0 0 28px rgba(168,85,247,.25)" };
const floatingRight = { ...floatingLeft, left: "auto", right: 30, top: 134, borderRadius: "18px 18px 6px 18px" };
const brand = { position: "relative", zIndex: 2, display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginTop: 16 };
const brandText = { fontSize: 24, letterSpacing: "-.5px" };
const hero = { position: "relative", zIndex: 2, textAlign: "center", marginTop: 30 };
const trustBadge = { width: "fit-content", margin: "0 auto 14px", padding: "7px 13px", borderRadius: 999, background: "rgba(255,255,255,.07)", border: "1px solid rgba(255,78,205,.22)", color: "rgba(255,255,255,.78)", fontSize: 12, fontWeight: 700 };
const headline = { margin: 0, fontSize: "clamp(42px,12vw,60px)", lineHeight: 1.05, letterSpacing: "-2.7px", fontWeight: 950 };
const accent = { background: "linear-gradient(90deg,#FF4ECD,#A855F7 58%,#00C2FF)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" };
const subhead = { margin: "16px auto 0", maxWidth: 330, fontSize: 18, lineHeight: 1.45, color: "rgba(255,255,255,.68)", fontWeight: 500 };
const visualCard = { position: "relative", zIndex: 2, height: 170, marginTop: 26, borderRadius: 28, overflow: "hidden", background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.12)", boxShadow: "0 0 36px rgba(168,85,247,.25)" };
const visualImage = { width: "100%", height: "100%", objectFit: "cover", opacity: .95 };
const visualOverlay = { position: "absolute", inset: 0, display: "flex", alignItems: "flex-end", justifyContent: "center", paddingBottom: 14, background: "linear-gradient(to bottom, transparent, rgba(3,3,10,.42))" };
const visualPill = { padding: "8px 14px", borderRadius: 999, background: "rgba(0,0,0,.45)", border: "1px solid rgba(255,255,255,.16)", color: "#fff", fontSize: 13, fontWeight: 800, backdropFilter: "blur(14px)" };
const chatBox = { position: "relative", zIndex: 2, marginTop: 22, padding: "22px 18px", borderRadius: 30, background: "linear-gradient(180deg,rgba(255,255,255,.075),rgba(255,255,255,.035))", border: "1px solid rgba(255,78,205,.35)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)", boxShadow: "0 0 42px rgba(168,85,247,.22), inset 0 0 35px rgba(255,255,255,.035)" };
const leftRow = { display: "flex", alignItems: "center", gap: 12, marginBottom: 20 };
const rightRow = { display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 12, marginBottom: 20 };
const avatarBase = { width: 48, height: 48, borderRadius: "50%", flexShrink: 0, border: "2px solid rgba(255,255,255,.24)", boxShadow: "0 0 20px rgba(255,255,255,.08)" };
const avatarA = { ...avatarBase, background: "linear-gradient(135deg,#4F2D2D,#C084FC)" };
const avatarB = { ...avatarBase, background: "linear-gradient(135deg,#1E3A8A,#38BDF8)" };
const label = { display: "block", marginBottom: 5, color: "rgba(255,255,255,.48)", fontSize: 14 };
const message = { margin: 0, color: "#fff", fontSize: "clamp(19px,5vw,24px)", lineHeight: 1.18, fontWeight: 650 };
const bubbleDark = { padding: "13px 20px", minWidth: 106, borderRadius: 23, background: "rgba(255,255,255,.08)", border: "1px solid rgba(255,255,255,.1)" };
const bubbleBlue = { padding: "13px 18px", maxWidth: "72%", borderRadius: "23px 23px 6px 23px", background: "linear-gradient(135deg,rgba(108,92,231,.38),rgba(30,41,122,.78))", border: "1px solid rgba(124,58,237,.62)", boxShadow: "0 0 20px rgba(124,58,237,.2)" };
const aiRow = { display: "flex", alignItems: "center", gap: 14 };
const mark = { width: 58, height: 58, borderRadius: "50%", display: "grid", placeItems: "center", flexShrink: 0, fontSize: 28, fontWeight: 950, background: "rgba(10,5,21,.92)", border: "1px solid rgba(255,78,205,.78)", color: "#B38CFF", boxShadow: "0 0 28px rgba(255,78,205,.56)" };
const aiBubble = { flex: 1, padding: 18, borderRadius: "24px 24px 24px 8px", background: "linear-gradient(135deg,rgba(255,0,110,.34),rgba(168,85,247,.54))", border: "1px solid rgba(255,78,205,.82)", boxShadow: "0 0 38px rgba(255,0,110,.48), inset 0 1px 0 rgba(255,255,255,.15)" };
const aiLabel = { display: "block", marginBottom: 8, color: "#FF7BE7", fontSize: 14, fontWeight: 750 };
const aiText = { margin: 0, fontSize: "clamp(22px,6vw,29px)", lineHeight: 1.22, fontWeight: 700, color: "#fff", letterSpacing: "-.6px" };
const cta = { position: "relative", zIndex: 2, width: "100%", marginTop: 24, minHeight: 72, border: "none", borderRadius: 27, cursor: "pointer", color: "#fff", fontSize: "clamp(22px,6vw,29px)", fontWeight: 900, letterSpacing: "-.8px", background: "linear-gradient(90deg,#FF006E,#FF4ECD 38%,#A855F7 74%,#7C3AED)", boxShadow: "0 0 34px rgba(255,0,110,.58),0 0 54px rgba(168,85,247,.45),inset 0 1px 0 rgba(255,255,255,.35)" };
const actions = { position: "relative", zIndex: 2, display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginTop: 22 };
const action = { minHeight: 116, padding: "14px 8px", borderRadius: 22, border: "1px solid rgba(255,255,255,.12)", background: "linear-gradient(180deg,rgba(255,255,255,.065),rgba(255,255,255,.025))", color: "#fff", cursor: "pointer", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", fontSize: "clamp(15px,4.4vw,20px)", fontWeight: 720, backdropFilter: "blur(18px)", WebkitBackdropFilter: "blur(18px)" };
const icon = { fontSize: 29, color: "#FF4ECD", textShadow: "0 0 20px rgba(255,78,205,.76)", marginBottom: 8, lineHeight: 1 };
