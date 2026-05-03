// src/components/Hero.jsx
// Living hero card: brain image + animated canvas overlay + scan reveal + Ken Burns drift.
// The canvas renders synaptic sparks, floating particles, breathing glow — making the
// image feel alive, not static.

import HeroCanvas from "./HeroCanvas";

export default function Hero({ image, eyebrow, title, description, variant }) {
  // variant determines canvas behavior:
  //   "both"  → sparks arc between two brains (Analyze, Personality, Profile)
  //   "left"  → drift particles around blue brain (Coach)
  //   "right" → drift particles around orange brain (Simulate)
  const canvasVariant = variant || inferVariant(image);

  return (
    <div className="hero hero-with-image hero-living">
      <div className="hero-img-wrap">
        <picture>
          <source srcSet={`/images/${image}.webp`} type="image/webp" />
          <img
            className="hero-img"
            src={`/images/${image}.jpg`}
            alt=""
            aria-hidden="true"
            loading="eager"
          />
        </picture>

        {/* Canvas overlay for sparks + particles */}
        <HeroCanvas variant={canvasVariant} />

        {/* Scan line — one-time reveal animation on mount */}
        <div className="hero-scan" aria-hidden="true" />

        {/* Corner vignette for depth */}
        <div className="hero-vignette" aria-hidden="true" />
      </div>

      <div className="hero-content">
        {eyebrow && <div className="hero-eyebrow">{eyebrow}</div>}
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </div>
    </div>
  );
}

function inferVariant(image) {
  if (image === "hero-coach")    return "left";
  if (image === "hero-simulate") return "right";
  return "both";
}
