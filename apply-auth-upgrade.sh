#!/bin/bash
# Wingman Auth Upgrade — Adds Clerk login (Google + Apple + Email)
# Run from project root:  bash apply-auth-upgrade.sh

set -e

echo ""
echo "╔═══════════════════════════════════════════════════╗"
echo "║   Auth Upgrade — Google + Apple + Email Login     ║"
echo "╚═══════════════════════════════════════════════════╝"
echo ""

[ ! -f "package.json" ] && echo "❌ Run from project root." && exit 1
[ ! -f "wingman-auth.zip" ] && echo "❌ wingman-auth.zip not found." && exit 1

# Backup
BACKUP=".backup-auth-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP/src/components" "$BACKUP/src/screens" "$BACKUP/src/lib" "$BACKUP/api"
cp src/App.jsx                       "$BACKUP/src/" 2>/dev/null || true
cp src/main.jsx                      "$BACKUP/src/" 2>/dev/null || true
cp src/lib/useUsage.js               "$BACKUP/src/lib/" 2>/dev/null || true
cp api/usage.js                      "$BACKUP/api/" 2>/dev/null || true
cp api/create-checkout.js            "$BACKUP/api/" 2>/dev/null || true
cp api/upgrade-redeem.js             "$BACKUP/api/" 2>/dev/null || true
echo "✓ Backup: $BACKUP"
echo ""

# Extract
rm -rf .tmp-auth
unzip -q -o wingman-auth.zip -d .tmp-auth
SRC=".tmp-auth/auth-upgrade"
[ ! -d "$SRC" ] && echo "❌ Zip structure wrong." && exit 1
echo "✓ Extracted"
echo ""

# Install Clerk package
echo "→ Installing @clerk/clerk-react..."
if ! grep -q '"@clerk/clerk-react"' package.json; then
  npm install @clerk/clerk-react --save 2>&1 | tail -3
  echo "  ✓ Clerk added to package.json"
else
  echo "  ⚠️  Already installed"
fi
echo ""

# Install API files
echo "→ Installing API endpoints..."
cp "$SRC/api/usage.js"            api/usage.js            && echo "  ✓ api/usage.js (Clerk JWT verification)"
cp "$SRC/api/create-checkout.js"  api/create-checkout.js  && echo "  ✓ api/create-checkout.js (links to Clerk user)"
cp "$SRC/api/upgrade-redeem.js"   api/upgrade-redeem.js   && echo "  ✓ api/upgrade-redeem.js (per-user upgrade)"
echo ""

# Install frontend
echo "→ Installing frontend files..."
mkdir -p src/components src/screens src/lib
cp "$SRC/src/main.jsx"                    src/main.jsx                    && echo "  ✓ src/main.jsx (ClerkProvider wrapper)"
cp "$SRC/src/App.jsx"                     src/App.jsx                     && echo "  ✓ src/App.jsx (auth gating + UserMenu)"
cp "$SRC/src/lib/useUsage.js"             src/lib/useUsage.js             && echo "  ✓ src/lib/useUsage.js (auth-aware hook)"
cp "$SRC/src/components/UserMenu.jsx"     src/components/UserMenu.jsx     && echo "  ✓ src/components/UserMenu.jsx (new)"
cp "$SRC/src/screens/LoginScreen.jsx"     src/screens/LoginScreen.jsx     && echo "  ✓ src/screens/LoginScreen.jsx (new)"
cp "$SRC/src/screens/SSOCallback.jsx"     src/screens/SSOCallback.jsx     && echo "  ✓ src/screens/SSOCallback.jsx (new)"
echo ""

# Copy setup guide
cp "$SRC/AUTH-SETUP.md" AUTH-SETUP.md
echo "→ Setup guide saved as AUTH-SETUP.md"
echo ""

# Cleanup
rm -rf .tmp-auth

# Verify
MISSING=0
for f in \
  "api/usage.js" \
  "src/main.jsx" \
  "src/App.jsx" \
  "src/screens/LoginScreen.jsx" \
  "src/screens/SSOCallback.jsx" \
  "src/components/UserMenu.jsx" \
  "src/lib/useUsage.js"; do
  [ ! -f "$f" ] && echo "  ❌ Missing: $f" && MISSING=1
done
[ $MISSING -eq 1 ] && exit 1
echo "✓ All files in place"
echo ""

echo "╔═══════════════════════════════════════════════════╗"
echo "║              IMPORTANT — DO THIS NEXT             ║"
echo "╠═══════════════════════════════════════════════════╣"
echo "║                                                     ║"
echo "║  1. Sign up at https://clerk.com (free)            ║"
echo "║                                                     ║"
echo "║  2. Create an application named 'Wingman'          ║"
echo "║                                                     ║"
echo "║  3. Enable: Email + Google + Apple                 ║"
echo "║                                                     ║"
echo "║  4. Copy your Publishable Key + JWKS URL           ║"
echo "║                                                     ║"
echo "║  5. Add to Vercel env vars (Settings):             ║"
echo "║     VITE_CLERK_PUBLISHABLE_KEY=pk_test_...         ║"
echo "║     CLERK_ISSUER=https://your-app.clerk.accounts.dev║"
echo "║                                                     ║"
echo "║  6. Also add to .env.local for local dev           ║"
echo "║                                                     ║"
echo "║  7. Read AUTH-SETUP.md for full instructions       ║"
echo "║                                                     ║"
echo "╚═══════════════════════════════════════════════════╝"
echo ""

# Git
if [ -d ".git" ]; then
  git status --short
  echo ""
  read -p "Commit and push? (y/n): " -n 1 -r
  echo ""
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    git add .
    git commit -m "Add Clerk auth: Google + Apple + Email login, per-user usage tracking"
    git push origin "$(git branch --show-current)"
    echo ""
    echo "✅ Pushed!"
    echo "⚠️  IMPORTANT: Vercel build will fail until you add the env vars above."
    echo "   Add them at vercel.com → your project → Settings → Environment Variables"
    echo "   then redeploy."
  fi
fi

echo ""
echo "Backup: $BACKUP"
echo ""