import WingmanLogoMark from "../components/WingmanLogoMark";

export default function LandingScreen({ onGetStarted }) {
  return (
    <main style={page}>
      <section style={card}>
        <WingmanLogoMark size={44} pulse />
        <h1 style={title}>Wingman</h1>
        <p style={text}>Premium mobile chat assistant UI.</p>
        <button style={button} onClick={onGetStarted}>Get Started</button>
      </section>
    </main>
  );
}

const page = { minHeight: "100dvh", display: "grid", placeItems: "center", background: "linear-gradient(135deg,#03030A,#13051F)", color: "white", padding: 24 };
const card = { width: "min(100%,420px)", padding: 32, borderRadius: 32, background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.14)", textAlign: "center" };
const title = { fontSize: 48, margin: "18px 0 8px" };
const text = { color: "rgba(255,255,255,.7)", fontSize: 18 };
const button = { width: "100%", padding: 18, borderRadius: 18, border: 0, color: "white", fontSize: 18, fontWeight: 800, background: "linear-gradient(90deg,#FF006E,#A855F7)" };
