// src/components/FloatingChats.jsx
// Decorative animated chat bubbles floating in the background.
// Creates the "people texting" visual atmosphere on LandingScreen + LoginScreen.
// Pure CSS animation — no images, no external deps, no performance hit.

const BUBBLES = [
  // Received (gray, left-leaning)
  { text: "hey 😊",                  side: "them", top: "8%",  left: "4%",  delay: 0,    dur: 14 },
  { text: "okay fine you win 🙈",    side: "them", top: "22%", left: "2%",  delay: 2.5,  dur: 18 },
  { text: "lol stop…",               side: "them", top: "55%", left: "3%",  delay: 1,    dur: 16 },
  { text: "you're kind of amazing",  side: "them", top: "70%", left: "5%",  delay: 4,    dur: 20 },
  { text: "when are we doing this?", side: "them", top: "38%", left: "1%",  delay: 6,    dur: 15 },
  { text: "I haven't stopped thinking about it 🥺", side: "them", top: "85%", left: "3%", delay: 3, dur: 22 },
  // Sent (pink/purple, right-leaning)
  { text: "wait really? 👀",         side: "me",   top: "12%", right: "3%", delay: 1.5,  dur: 17 },
  { text: "so are you 😏",           side: "me",   top: "30%", right: "4%", delay: 3.5,  dur: 13 },
  { text: "I'd like that",           side: "me",   top: "48%", right: "2%", delay: 0.5,  dur: 19 },
  { text: "okay I'm intrigued",      side: "me",   top: "62%", right: "5%", delay: 5,    dur: 16 },
  { text: "tell me more 😄",         side: "me",   top: "78%", right: "2%", delay: 2,    dur: 21 },
  { text: "just saw this ❤️",        side: "me",   top: "92%", right: "4%", delay: 7,    dur: 18 },
];

export default function FloatingChats() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 0,
        overflow: "hidden",
      }}
      aria-hidden="true"
    >
      {BUBBLES.map((b, i) => (
        <div
          key={i}
          className={`floating-bubble floating-bubble--${b.side}`}
          style={{
            top: b.top,
            left: b.left,
            right: b.right,
            animationDelay: `${b.delay}s`,
            animationDuration: `${b.dur}s`,
          }}
        >
          {b.text}
        </div>
      ))}
    </div>
  );
}
