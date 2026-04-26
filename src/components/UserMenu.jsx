// src/components/UserMenu.jsx
// Avatar + sign-out dropdown. Drop into any nav bar.
// Props: isPremium (bool)

import { useState } from "react";
import { useUser, useClerk } from "@clerk/clerk-react";

export default function UserMenu({ isPremium }) {
  const { user } = useUser();
  const { signOut } = useClerk();
  const [open, setOpen] = useState(false);

  if (!user) return null;

  const displayName = user.fullName || user.primaryEmailAddress?.emailAddress || "You";
  const initial = (user.firstName?.[0] ?? user.primaryEmailAddress?.emailAddress?.[0] ?? "?").toUpperCase();

  return (
    <div style={wrapper}>
      <button
        style={avatarBtn}
        onClick={() => setOpen((o) => !o)}
        aria-label="Account menu"
        aria-expanded={open}
      >
        {user.imageUrl ? (
          <img src={user.imageUrl} alt="" style={avatarImg} referrerPolicy="no-referrer" />
        ) : (
          <span style={avatarInitial}>{initial}</span>
        )}
        {isPremium && <span style={premBadge} aria-label="Premium">★</span>}
      </button>

      {open && (
        <>
          <div style={backdrop} onClick={() => setOpen(false)} />
          <div style={menu} role="menu">
            <p style={menuName}>{displayName}</p>
            {isPremium
              ? <p style={menuTier}>⭐ Premium member</p>
              : <p style={menuTierFree}>Free plan</p>
            }
            <hr style={divider} />
            <button
              style={menuBtn}
              role="menuitem"
              onClick={() => { setOpen(false); signOut(); }}
            >
              Sign out
            </button>
          </div>
        </>
      )}
    </div>
  );
}

const wrapper   = { position: "relative", zIndex: 200 };
const avatarBtn = {
  background: "none", border: "none", cursor: "pointer",
  padding: 0, position: "relative", display: "flex",
};
const avatarImg = {
  width: 32, height: 32, borderRadius: "50%",
  border: "1.5px solid rgba(255,255,255,0.25)",
  objectFit: "cover",
};
const avatarInitial = {
  display: "flex", alignItems: "center", justifyContent: "center",
  width: 32, height: 32, borderRadius: "50%",
  background: "linear-gradient(135deg,#a78bfa,#818cf8)",
  color: "#fff", fontSize: 13, fontWeight: 700,
};
const premBadge = {
  position: "absolute", bottom: -2, right: -2,
  background: "#FBBF24", borderRadius: "50%",
  fontSize: 9, width: 14, height: 14,
  display: "flex", alignItems: "center", justifyContent: "center",
  color: "#000",
};
const backdrop = { position: "fixed", inset: 0, zIndex: 100 };
const menu = {
  position: "absolute", top: 40, right: 0,
  background: "rgba(20,18,36,0.97)",
  border: "0.5px solid rgba(255,255,255,0.1)",
  borderRadius: 12, padding: "14px 16px",
  minWidth: 190, zIndex: 200,
  boxShadow: "0 8px 32px rgba(0,0,0,0.55)",
};
const menuName    = { margin: "0 0 2px", fontSize: 13, color: "#E2E8F0", fontWeight: 500, wordBreak: "break-all" };
const menuTier    = { margin: "0 0 8px", fontSize: 11, color: "#FBBF24" };
const menuTierFree = { margin: "0 0 8px", fontSize: 11, color: "rgba(255,255,255,0.4)" };
const divider     = { border: "none", borderTop: "0.5px solid rgba(255,255,255,0.08)", margin: "8px 0" };
const menuBtn = {
  width: "100%", padding: "8px 0",
  background: "rgba(239,68,68,0.08)",
  border: "0.5px solid rgba(239,68,68,0.2)",
  color: "#FCA5A5", borderRadius: 8, cursor: "pointer",
  fontSize: 12, fontWeight: 500,
};
