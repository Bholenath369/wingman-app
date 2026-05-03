// src/screens/ProfileScreen.jsx
// Premium feature: analyze profile photos and rewrite dating bios.
import { useState, useRef } from "react";
import { analyzeProfilePhoto, rewriteBio } from "../lib/claude";
import { useUsage } from "../lib/useUsage";
import PremiumGate from "../components/PremiumGate";

const BIO_VIBES = [
  { key: "confident", label: "Confident" },
  { key: "playful",   label: "Playful"   },
  { key: "mysterious",label: "Mysterious"},
  { key: "warm",      label: "Warm"      },
];

export default function ProfileScreen() {
  const [mode, setMode] = useState("photo"); // photo | bio
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoResult, setPhotoResult] = useState(null);
  const [photoLoading, setPhotoLoading] = useState(false);

  const [bio, setBio] = useState("");
  const [vibe, setVibe] = useState("confident");
  const [bioResult, setBioResult] = useState("");
  const [bioLoading, setBioLoading] = useState(false);

  const [error, setError] = useState("");
  const fileRef = useRef();
  const { consume, isPremium, loading: usageLoading } = useUsage();

  async function handlePhotoUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError("Image too large. Max 5MB.");
      return;
    }

    const check = await consume("photo");
    if (!check.allowed) {
      setError("Daily limit reached. Upgrade for more.");
      return;
    }

    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
    setPhotoLoading(true);
    setPhotoResult(null);
    setError("");

    try {
      const result = await analyzeProfilePhoto(file);
      setPhotoResult(result);
    } catch (e) {
      setError("Couldn't analyze that photo. Try a different one.");
    } finally {
      setPhotoLoading(false);
    }
  }

  async function handleBioRewrite() {
    if (!bio.trim()) return;
    const check = await consume("rewrite");
    if (!check.allowed) {
      setError("Daily limit reached.");
      return;
    }
    setBioLoading(true);
    setBioResult("");
    setError("");
    try {
      const result = await rewriteBio(bio, vibe);
      setBioResult(result.trim());
    } catch {
      setError("Couldn't rewrite that.");
    } finally {
      setBioLoading(false);
    }
  }

  function resetPhoto() {
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoFile(null);
    setPhotoPreview(null);
    setPhotoResult(null);
  }

  if (!usageLoading && !isPremium) {
    return (
      <div>
        <div className="hero hero-gradient" style={{ marginBottom: 16 }}>
          <div className="hero-illustration">🤵</div>
          <div className="hero-content">
            <div className="hero-eyebrow">👤 Profile Lab</div>
            <h2>Optimize your profile</h2>
            <p>AI analyzes your photos and rewrites your bio to attract more matches.</p>
          </div>
        </div>
        <PremiumGate
          title="Premium feature"
          description="Profile analysis and bio rewriting are part of Premium."
          features={[
            "Upload any profile photo — get detailed AI feedback",
            "Rate every photo on lighting, composition, expression",
            "Rewrite your Tinder/Hinge/Bumble bio in 4 different vibes",
            "Plus: unlimited rewrites, all personas, conversation scoring",
          ]}
        />
      </div>
    );
  }

  return (
    <div>
      <div className="hero hero-gradient" style={{ marginBottom: 16 }}>
        <div className="hero-illustration">🤵</div>
        <div className="hero-content">
          <div className="hero-eyebrow">👤 Profile Lab</div>
          <h2>Optimize your profile</h2>
          <p>AI feedback on photos and bios — know what actually gets matches.</p>
        </div>
      </div>

      {error && (
        <div style={{
          background: "rgba(239,68,68,0.1)",
          border: "0.5px solid rgba(239,68,68,0.3)",
          borderRadius: 10,
          padding: "10px 14px",
          marginBottom: 14,
          fontSize: 13,
          color: "#FCA5A5",
        }}>
          {error}
        </div>
      )}

      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        <button
          className={`rewrite-btn ${mode === "photo" ? "active" : ""}`}
          onClick={() => setMode("photo")}
          style={{ flex: 1 }}
        >
          📸 Photo analyzer
        </button>
        <button
          className={`rewrite-btn ${mode === "bio" ? "active" : ""}`}
          onClick={() => setMode("bio")}
          style={{ flex: 1 }}
        >
          ✍️ Bio rewriter
        </button>
      </div>

      {mode === "photo" && (
        <>
          {!photoPreview && (
            <>
              <button className="upload-area" onClick={() => fileRef.current.click()}>
                <div className="upload-icon">📸</div>
                <h3>Upload profile photo</h3>
                <p>We'll rate it and tell you exactly what to fix</p>
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                style={{ display: "none" }}
                onChange={handlePhotoUpload}
              />
            </>
          )}

          {photoPreview && (
            <div style={{
              marginBottom: 14,
              borderRadius: 12,
              overflow: "hidden",
              border: "0.5px solid var(--border)",
            }}>
              <img src={photoPreview} alt="Your photo" style={{ width: "100%", display: "block" }} />
            </div>
          )}

          {photoLoading && (
            <div className="typing-wrap">
              <div className="typing-indicator">
                <div className="dot" /><div className="dot" /><div className="dot" />
              </div>
              <span style={{ fontSize: 12, color: "var(--text2)" }}>Analyzing your photo...</span>
            </div>
          )}

          {photoResult && (
            <>
              <div className="card">
                <div className="card-title">Overall score</div>
                <div style={{ textAlign: "center", margin: "10px 0 16px" }}>
                  <div style={{
                    fontFamily: "var(--font-display)",
                    fontSize: 44,
                    color: "var(--accent)",
                    lineHeight: 1,
                  }}>{photoResult.overall}</div>
                  <div style={{
                    fontSize: 11,
                    color: "var(--text3)",
                    marginTop: 4,
                    textTransform: "uppercase",
                  }}>
                    Use as: {photoResult.suggestedUse}
                  </div>
                </div>

                {Object.entries(photoResult.scores || {}).map(([k, v]) => (
                  <div className="trait-row" key={k}>
                    <div className="trait-label" style={{ textTransform: "capitalize" }}>
                      {k.replace(/([A-Z])/g, " $1").trim()}
                    </div>
                    <div className="trait-bar">
                      <div
                        className="trait-fill"
                        style={{
                          width: `${v}%`,
                          background: "linear-gradient(90deg,#E8547A,#7C5CFC)",
                        }}
                      />
                    </div>
                    <div className="trait-value">{v}%</div>
                  </div>
                ))}
              </div>

              {photoResult.strengths?.length > 0 && (
                <div className="card">
                  <div className="card-title">What works</div>
                  {photoResult.strengths.map((s, i) => (
                    <div key={i} className="feedback-row good">
                      <span style={{ fontSize: 14, flexShrink: 0 }}>✓</span>
                      <span>{s}</span>
                    </div>
                  ))}
                </div>
              )}

              {photoResult.improvements?.length > 0 && (
                <div className="card">
                  <div className="card-title">Try this next</div>
                  {photoResult.improvements.map((s, i) => (
                    <div key={i} className="feedback-row warn">
                      <span style={{ fontSize: 14, flexShrink: 0 }}>→</span>
                      <span>{s}</span>
                    </div>
                  ))}
                </div>
              )}

              <button className="reset-btn" onClick={resetPhoto}>← Analyze another photo</button>
            </>
          )}
        </>
      )}

      {mode === "bio" && (
        <>
          <div className="section-label">Your current bio</div>
          <textarea
            className="coach-textarea"
            placeholder="Paste your Tinder/Hinge/Bumble bio..."
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            style={{ height: 110, marginBottom: 12 }}
          />

          <div className="section-label">Choose a vibe</div>
          <div className="rewrite-row">
            {BIO_VIBES.map((v) => (
              <button
                key={v.key}
                className={`rewrite-btn ${vibe === v.key ? "active" : ""}`}
                onClick={() => setVibe(v.key)}
              >
                {v.label}
              </button>
            ))}
          </div>

          <button
            className="btn-primary"
            style={{
              width: "100%",
              padding: 13,
              borderRadius: 10,
              opacity: bio.trim().length < 5 || bioLoading ? .5 : 1,
            }}
            disabled={bio.trim().length < 5 || bioLoading}
            onClick={handleBioRewrite}
          >
            {bioLoading ? "Rewriting..." : "Rewrite my bio →"}
          </button>

          {bioResult && (
            <>
              <div className="section-label">New bio</div>
              <div className="rewritten-msg">{bioResult}</div>
              <button
                className="btn-primary"
                onClick={() => navigator.clipboard.writeText(bioResult).catch(() => {})}
                style={{ marginTop: 10, width: "100%" }}
              >
                Copy new bio
              </button>
            </>
          )}
        </>
      )}
    </div>
  );
}
