// src/lib/useUsage.js
import { useEffect, useState, useCallback } from "react";

const API_URL = import.meta.env.VITE_API_URL || "";

export function useUsage() {
  const [state, setState] = useState({
    tier: "free",
    remaining: {},
    limits: {},
    counts: {},
    loading: true,
  });

  const refresh = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/usage`, { credentials: "include" });
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
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  // Consume one use of a feature. Returns { allowed, remaining, tier }.
  const consume = useCallback(async (feature) => {
    try {
      const res = await fetch(`${API_URL}/api/usage`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
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

// Helper to kick off Stripe checkout
export async function startCheckout() {
  try {
    const res = await fetch(`${API_URL}/api/create-checkout`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: "{}",
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

// Called on app load if URL has ?upgrade=success&session_id=...
export async function redeemUpgrade(sessionId) {
  try {
    const res = await fetch(`${API_URL}/api/upgrade-redeem`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
