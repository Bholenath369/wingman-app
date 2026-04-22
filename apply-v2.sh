#!/bin/bash
# ──────────────────────────────────────────────────────────────
# Wingman v2 — Effectiveness Upgrade Apply Script
#
# HOW TO USE:
# 1. Save as `apply-v2.sh` in your project root (same folder as package.json)
# 2. Put `wingman-v2-upgrade.zip` in the same folder
# 3. Open VS Code terminal → run:  bash apply-v2.sh
# ──────────────────────────────────────────────────────────────

set -e

echo ""
echo "╔══════════════════════════════════════════════╗"
echo "║   Wingman v2 — Effectiveness Upgrade         ║"
echo "╚══════════════════════════════════════════════╝"
echo ""

# ── Safety checks ──────────────────────────────────────────
if [ ! -f "package.json" ]; then
  echo "❌ No package.json found. Run this from your project root."
  exit 1
fi

if [ ! -f "wingman-v2-upgrade.zip" ]; then
  echo "❌ wingman-v2-upgrade.zip not found in this folder."
  exit 1
fi

if [ ! -f "src/index.css" ]; then
  echo "❌ src/index.css not found. Did v1 install correctly?"
  exit 1
fi

echo "✓ Project structure looks good"
echo ""

# ── Backup ─────────────────────────────────────────────────
BACKUP_DIR=".backup-v2-$(date +%Y%m%d-%H%M%S)"
echo "→ Creating backup in $BACKUP_DIR ..."
mkdir -p "$BACKUP_DIR/src" "$BACKUP_DIR/api"
[ -f "api/claude.js" ] && cp api/claude.js "$BACKUP_DIR/api/"
[ -f "src/App.jsx" ] && cp src/App.jsx "$BACKUP_DIR/src/"
[ -f "src/index.css" ] && cp src/index.css "$BACKUP_DIR/src/"
[ -d "src/lib" ] && cp -r src/lib "$BACKUP_DIR/src/"
[ -d "src/screens" ] && cp -r src/screens "$BACKUP_DIR/src/"
[ -d "src/components" ] && cp -r src/components "$BACKUP_DIR/src/"
echo "✓ Backup saved"
echo ""

# ── Extract ────────────────────────────────────────────────
rm -rf .tmp-v2
unzip -q -o wingman-v2-upgrade.zip -d .tmp-v2
SRC=".tmp-v2/wingman-v2-upgrade"

if [ ! -d "$SRC" ]; then
  echo "❌ Zip structure unexpected."
  exit 1
fi
echo "✓ Extracted"
echo ""

# ── Replace files ──────────────────────────────────────────
echo "→ Installing API upgrade..."
cp "$SRC/api/claude.js" api/claude.js && echo "  ✓ api/claude.js (streaming + retry)"

echo ""
echo "→ Installing frontend upgrades..."
cp "$SRC/src/App.jsx"                        src/App.jsx                        && echo "  ✓ src/App.jsx (onboarding hook)"
cp "$SRC/src/lib/claude.js"                  src/lib/claude.js                  && echo "  ✓ src/lib/claude.js (two-step, streaming, vibe)"
cp "$SRC/src/lib/deepLinks.js"               src/lib/deepLinks.js               && echo "  ✓ src/lib/deepLinks.js (new)"
cp "$SRC/src/components/SendToApp.jsx"       src/components/SendToApp.jsx       && echo "  ✓ src/components/SendToApp.jsx (new)"
cp "$SRC/src/components/OnboardingModal.jsx" src/components/OnboardingModal.jsx && echo "  ✓ src/components/OnboardingModal.jsx (new)"
cp "$SRC/src/screens/AnalyzeScreen.jsx"      src/screens/AnalyzeScreen.jsx      && echo "  ✓ src/screens/AnalyzeScreen.jsx (smart analysis)"
cp "$SRC/src/screens/SimulateScreen.jsx"     src/screens/SimulateScreen.jsx     && echo "  ✓ src/screens/SimulateScreen.jsx (streaming)"

# ── Append CSS (instead of replacing) ──────────────────────
echo ""
echo "→ Appending CSS additions to src/index.css..."
if grep -q "Blinking cursor for streaming text" src/index.css; then
  echo "  ⚠️  CSS already contains v2 additions — skipping append"
else
  echo "" >> src/index.css
  cat "$SRC/src/index-additions.css" >> src/index.css
  echo "  ✓ CSS additions appended"
fi

# ── Cleanup ────────────────────────────────────────────────
rm -rf .tmp-v2
echo ""
echo "✓ All files installed"
echo ""

# ── Verify ─────────────────────────────────────────────────
MISSING=0
for f in \
  "api/claude.js" \
  "src/App.jsx" \
  "src/lib/claude.js" \
  "src/lib/deepLinks.js" \
  "src/components/SendToApp.jsx" \
  "src/components/OnboardingModal.jsx" \
  "src/screens/AnalyzeScreen.jsx" \
  "src/screens/SimulateScreen.jsx"; do
  if [ ! -f "$f" ]; then
    echo "  ❌ Missing: $f"
    MISSING=1
  fi
done

if [ $MISSING -eq 1 ]; then
  echo "Some files missing — check errors above."
  exit 1
fi
echo "✓ All 8 files verified"
echo ""

# ── Git ────────────────────────────────────────────────────
if [ -d ".git" ]; then
  echo "→ Git status:"
  git status --short
  echo ""

  read -p "Commit and push to trigger Vercel deploy? (y/n): " -n 1 -r
  echo ""

  if [[ $REPLY =~ ^[Yy]$ ]]; then
    git add .
    git commit -m "v2: smart two-step analysis, streaming, vibe onboarding, send-to-app, thumbs feedback"

    CURRENT_BRANCH=$(git branch --show-current)
    echo ""
    echo "→ Pushing to origin/$CURRENT_BRANCH..."
    git push origin "$CURRENT_BRANCH"
    echo ""
    echo "✅ Pushed! Vercel is building. Check: https://vercel.com/dashboard"
  else
    echo "Skipped. When ready:  git add . && git commit && git push"
  fi
fi

echo ""
echo "╔══════════════════════════════════════════════╗"
echo "║              WHAT TO TEST                     ║"
echo "╠══════════════════════════════════════════════╣"
echo "║                                                ║"
echo "║  1. Open your app in incognito → onboarding   ║"
echo "║     modal should appear                        ║"
echo "║                                                ║"
echo "║  2. Analyze → you should see:                  ║"
echo "║     • Context chips (stage, vibe, feeling)    ║"
echo "║     • 4 replies with thumbs + send buttons    ║"
echo "║     • Thumbs down regenerates                  ║"
echo "║                                                ║"
echo "║  3. Simulate → AI replies stream word-by-word ║"
echo "║                                                ║"
echo "║  4. No env vars changed — no Vercel config   ║"
echo "║     needed. Pure code deploy.                  ║"
echo "║                                                ║"
echo "╚══════════════════════════════════════════════╝"
echo ""
echo "Backup: $BACKUP_DIR (delete after confirming working)"
echo ""
