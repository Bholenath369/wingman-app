// src/lib/referral.js
// Lightweight referral system — no backend needed.
// Referrer: shares a link with their code (hash of Clerk user ID).
// New visitor: gets +5 bonus analyses added to localStorage on first visit.
// Simple — works entirely client-side.

const BONUS_KEY   = "wm_ref_bonus";     // how many bonus uses remaining
const CLAIMED_KEY = "wm_ref_claimed";   // has this device claimed a bonus?
const MY_REF_KEY  = "wm_my_ref_code";   // this user's own referral code

// Deterministic code from any string (user ID)
function hashCode(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h).toString(36).toUpperCase().slice(0, 6);
}

export function getMyReferralCode(userId) {
  if (!userId) return null;
  const stored = localStorage.getItem(MY_REF_KEY);
  if (stored) return stored;
  const code = hashCode(userId);
  localStorage.setItem(MY_REF_KEY, code);
  return code;
}

export function getReferralLink(userId) {
  const code = getMyReferralCode(userId);
  if (!code) return null;
  return `https://wingman-six-beta.vercel.app?ref=${code}`;
}

// Called on app load — checks URL for ?ref= param and adds bonus
export function claimReferralBonus() {
  if (localStorage.getItem(CLAIMED_KEY)) return false; // already claimed
  const params = new URLSearchParams(window.location.search);
  const ref = params.get("ref");
  if (!ref) return false;

  // Grant bonus
  localStorage.setItem(BONUS_KEY, "5");
  localStorage.setItem(CLAIMED_KEY, "1");
  // Clean URL
  window.history.replaceState({}, "", window.location.pathname);
  return true; // show welcome banner
}

export function getReferralBonus() {
  return parseInt(localStorage.getItem(BONUS_KEY) || "0", 10);
}

export function consumeReferralBonus() {
  const current = getReferralBonus();
  if (current <= 0) return 0;
  const next = current - 1;
  localStorage.setItem(BONUS_KEY, next.toString());
  return next;
}
