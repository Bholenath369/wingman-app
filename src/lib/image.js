// src/lib/image.js
// Frontend API layer for image generation

const API_URL = import.meta.env.VITE_API_URL || "";

export async function generateImage(prompt, category) {
  const res = await fetch(`${API_URL}/api/generate-image`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, category }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error || `API error ${res.status}`);
  }
  const data = await res.json();
  return data.image ?? "";
}
