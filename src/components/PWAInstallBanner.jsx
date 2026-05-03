// src/components/PWAInstallBanner.jsx
// Subtle "Add to Home Screen" prompt that slides up above the bottom nav.
// Uses the native beforeinstallprompt event (Android Chrome / Edge).
// iOS users see a custom tip sheet instead.

import { useState, useEffect } from "react";
import WingmanLogoMark from "./WingmanLogoMark";

const DISMISSED_KEY = "wm_pwa_dismissed";
const IOS_TIP_KEY   = "wm_ios_tip_shown";

function isIOS() {
  return /ipad|iphone|ipod/i.test(navigator.userAgent) && !window.MSStream;
}
function isInStandalone() {
  return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone;
}

export default function PWAInstallBanner() {
  const [prompt, setPrompt]       = useState(null);
  const [showIOS, setShowIOS]     = useState(false);
  const [dismissed, setDismissed] = useState(
    () => localStorage.getItem(DISMISSED_KEY) === "1"
  );

  useEffect(() => {
    if (dismissed || isInStandalone()) return;

    // Android / Chrome install prompt
    const handler = (e) => {
      e.preventDefault();
      setPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);

    // iOS — show tip once
    if (isIOS() && !localStorage.getItem(IOS_TIP_KEY)) {
      const t = setTimeout(() => setShowIOS(true), 8000); // delay 8s so it doesn't interrupt
      return () => { clearTimeout(t); window.removeEventListener("beforeinstallprompt", handler); };
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, [dismissed]);

  function dismiss() {
    setDismissed(true);
    setPrompt(null);
    setShowIOS(false);
    localStorage.setItem(DISMISSED_KEY, "1");
    localStorage.setItem(IOS_TIP_KEY, "1");
  }

  async function install() {
    if (!prompt) return;
    prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === "accepted") setPrompt(null);
    else dismiss();
  }

  // Android prompt
  if (prompt && !dismissed) {
    return (
      <div className="pwa-banner">
        <WingmanLogoMark size={26} />
        <div className="pwa-banner-text">
          <span className="pwa-banner-title">Add to Home Screen</span>
          <span className="pwa-banner-desc">Use Wingman like a native app</span>
        </div>
        <button className="pwa-install-btn" onClick={install}>Install</button>
        <button className="pwa-dismiss-btn" onClick={dismiss} aria-label="Dismiss">×</button>
      </div>
    );
  }

  // iOS tip
  if (showIOS && !dismissed) {
    return (
      <div className="pwa-banner">
        <span style={{ fontSize: 22, flexShrink: 0 }}>📲</span>
        <div className="pwa-banner-text">
          <span className="pwa-banner-title">Add Wingman to Home Screen</span>
          <span className="pwa-banner-desc">Tap Share → "Add to Home Screen"</span>
        </div>
        <button className="pwa-dismiss-btn" onClick={dismiss} aria-label="Dismiss">×</button>
      </div>
    );
  }

  return null;
}
