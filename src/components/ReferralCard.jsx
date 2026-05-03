// src/components/ReferralCard.jsx
// Share card shown in StatsScreen — lets users share their referral link.
// Also shows a "You were invited!" welcome banner if they arrived via a ref link.

import { useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { getReferralLink, getReferralBonus } from "../lib/referral";

export default function ReferralCard() {
  const { user } = useUser();
  const [copied, setCopied] = useState(false);
  const bonus = getReferralBonus();
  const link = getReferralLink(user?.id);

  async function share() {
    const text = `I've been using Wingman to get better at texting and it's honestly changed my dating life.\n\nTry it free (you'll get +5 bonus analyses):\n${link}`;
    if (navigator.share) {
      try { await navigator.share({ text, url: link }); } catch {}
    } else {
      try {
        await navigator.clipboard.writeText(link);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      } catch {}
    }
  }

  if (!link) return null;

  return (
    <div className="referral-card">
      <div className="referral-card-header">
        <span className="referral-icon">🤝</span>
        <div>
          <div className="referral-title">Invite a friend</div>
          <div className="referral-sub">They get +5 free analyses. You help a friend win.</div>
        </div>
      </div>

      {bonus > 0 && (
        <div className="referral-bonus-badge">
          🎁 You have <strong>{bonus} bonus</strong> {bonus === 1 ? "analysis" : "analyses"} from a referral
        </div>
      )}

      <div className="referral-link-row">
        <span className="referral-link-text">{link.replace("https://", "")}</span>
      </div>

      <button className="share-result-btn" onClick={share}
        style={{ marginTop: 8 }}>
        {copied ? "✓ Link copied!" : "Share your link 🔗"}
      </button>
    </div>
  );
}
