// src/components/TopHeader.jsx
// Sticky top bar: logo wordmark + streak + usage counter + user avatar menu

import { useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import UserMenu from "./UserMenu";
import WingmanLogoMark from "./WingmanLogoMark";

function getStreak() {
  try {
    const data = localStorage.getItem("wingman_streak");
    if (data) return JSON.parse(data).count || 0;
  } catch {}
  return 0;
}

export default function TopHeader({ isPremium, remaining, usageLoading }) {
  const { user } = useUser();
  const firstName = user?.firstName || null;
  const usesLeft =
    !usageLoading && remaining?.analyze != null ? remaining.analyze : null;
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    setStreak(getStreak());
  }, []);

  return (
    <header className="top-header">
      <div className="top-header-logo">
        <WingmanLogoMark size={30} pulse />
        <div className="top-header-brand">
          <span className="top-header-wordmark">Wingman</span>
          {firstName && (
            <span className="top-header-greeting">Hey, {firstName} 👋</span>
          )}
        </div>
      </div>

      <div className="top-header-right">
        {streak > 0 && (
          <div className="streak-pill">
            🔥 {streak}
          </div>
        )}
        {!usageLoading && !isPremium && usesLeft != null && (
          <div className="usage-pill">
            <span className="usage-dot" />
            {usesLeft} left
          </div>
        )}
        {isPremium && (
          <div className="premium-pill-hdr">
            ★ Pro
          </div>
        )}
        <UserMenu isPremium={isPremium} />
      </div>
    </header>
  );
}
