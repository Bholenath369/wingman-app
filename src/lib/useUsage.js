// src/lib/useUsage.js  — Clerk-aware version
// Sends the Clerk JWT as Authorization: Bearer on every API call.
// startCheckout() still works with no args from PremiumGate.jsx
// (getToken is stored at module level as soon as useUsage mounts).

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@clerk/clerk-react";

const API_URL = import.meta.env.VITE_API_URL || "";

// Module-level singleton so standalone helpers (startCheckout, redeemUpgrade)
// can attach the Clerk token without needing a prop.
let _getToken = null;
export function _setGetToken(fn) {
  _getToken = fn;
}

async function authHeaders() {
  if (!_getToken) return {};
  try {
    const token = await _getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch {
    return {};
  }
}

export function useUsage() {
  const { getToken, isSignedIn } = useAuth();

  const [state, setState] = useState({
    tier: "free",
    remaining: {},
    limits: {},
    counts: {},
    loading: true,
  });

  // Keep the singleton up to date
  useEffect(() => {
    _setGetToken(getToken);
  }, [getToken]);

  const refresh = useCallback(async () => {
    if (!isSignedIn) {
      setState((s) => ({ ...s, loading: false }));
      return;
    }
    try {
      const headers = await authHeaders();
      const res = await fetch(`${API_URL}/api/usage`, { headers });
      if (!res.ok) throw new Error("usage fetch failed");
      const data = await res.json();
      setState({
        tier: data.tier,
        remaining: data.remaining,
        limits: data.limits,
        counts: data.counts,
        loading: false,
      });
    } catch {
      setState((s) => ({ ...s, loading: false }));
    }
  }, [isSignedIn]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const consume = useCallback(async (feature) => {
    try {
      const headers = await authHeaders();
      const res = await fetch(`${API_URL}/api/usage`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...headers },
        body: JSON.stringify({ action: "consume", feature }),
      });
      const data = await res.json();
      if (res.ok) {
        setState((s) => ({
          ...s,
          tier: data.tier,
          counts: { ...s.counts, [feature]: (s.counts[feature] || 0) + 1 },
          remaining: { ...s.remaining, [feature]: data.remaining },
        }));
        return { allowed: true, remaining: data.remaining, tier: data.tier };
      }
      return { allowed: false, remaining: 0, tier: data.tier || "free" };
    } catch {
      return { allowed: false, remaining: 0, tier: "free" };
    }
  }, []);

  const isPremium = state.tier === "premium";

  return { ...state, isPremium, refresh, consume };
}

// Called from PremiumGate.jsx — pass plan: "3day" | "weekly" | "monthly"
export async function startCheckout(plan = "monthly") {
  try {
    const headers = await authHeaders();
    const res = await fetch(`${API_URL}/api/create-checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...headers },
      body: JSON.stringify({ plan }),
    });
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    } else {
      alert("Couldn't start checkout: " + (data.error || "unknown error"));
    }
  } catch (e) {
    alert("Checkout failed: " + e.message);
  }
}

// Called from App.jsx after Stripe redirect.
export async function redeemUpgrade(sessionId) {
  try {
    const headers = await authHeaders();
    const res = await fetch(`${API_URL}/api/upgrade-redeem`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...headers },
      body: JSON.stringify({ sessionId }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
