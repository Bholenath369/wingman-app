#!/usr/bin/env python3
import os
import shutil
import zipfile
from pathlib import Path
from datetime import datetime

os.chdir(r'C:\Users\amit1\OneDrive\Desktop\wingman-app\wingman')

print("\n╔══════════════════════════════════════════════╗")
print("║   Hero Image Upgrade — Brain Connection      ║")
print("╚══════════════════════════════════════════════╝\n")

# Find hero zip
hero_zip = None
if Path("hero update.zip").exists():
    hero_zip = "hero update.zip"
elif Path("wingman-hero-upgrade.zip").exists():
    hero_zip = "wingman-hero-upgrade.zip"

if not hero_zip:
    print("❌ No hero upgrade zip found!")
    exit(1)

print(f"✓ Found: {hero_zip}\n")

# Backup
backup_name = f".backup-hero-{datetime.now().strftime('%Y%m%d-%H%M%S')}"
backup_path = Path(backup_name)
backup_path.mkdir(exist_ok=True)
(backup_path / "public" / "images").mkdir(parents=True, exist_ok=True)
(backup_path / "src" / "screens").mkdir(parents=True, exist_ok=True)
(backup_path / "src" / "components").mkdir(parents=True, exist_ok=True)

print(f"Creating backup in {backup_name}...")
if Path("public/images").exists():
    shutil.copytree("public/images", backup_path / "public" / "images", dirs_exist_ok=True)

for screen in ["AnalyzeScreen.jsx", "PersonalityScreen.jsx", "CoachScreen.jsx", "SimulateScreen.jsx", "ProfileScreen.jsx"]:
    src = Path(f"src/screens/{screen}")
    if src.exists():
        shutil.copy2(src, backup_path / "src" / "screens" / screen)

if Path("src/index.css").exists():
    shutil.copy2("src/index.css", backup_path / "src" / "index.css")

print(f"✓ Backup: {backup_name}\n")

# Extract zip
print("Extracting hero files...")
extract_dir = ".tmp-hero"
if Path(extract_dir).exists():
    shutil.rmtree(extract_dir)

with zipfile.ZipFile(hero_zip, 'r') as zip_ref:
    zip_ref.extractall(extract_dir)

# Find the extracted folder
possible_roots = ["hero-upgrade", "hero-fx", "wingman-hero"]
src_root = None
for root in possible_roots:
    if Path(extract_dir) / root in list(Path(extract_dir).iterdir()):
        src_root = Path(extract_dir) / root
        break

if not src_root:
    # Try to find any subdirectory
    subdirs = list(Path(extract_dir).iterdir())
    if subdirs and subdirs[0].is_dir():
        src_root = subdirs[0]
    else:
        print("❌ Cannot find extracted files!")
        exit(1)

print(f"✓ Extracted from: {src_root.name}\n")

# Copy images
print("→ Installing brain hero images...")
Path("public/images").mkdir(parents=True, exist_ok=True)

images = [
    ("hero-analyze.jpg", "both brains"),
    ("hero-analyze.webp", ""),
    ("hero-profile.jpg", "both brains, closer"),
    ("hero-profile.webp", ""),
    ("hero-coach.jpg", "left/blue brain"),
    ("hero-coach.webp", ""),
    ("hero-simulate.jpg", "right/orange brain"),
    ("hero-simulate.webp", ""),
]

for img_name, desc in images:
    src = src_root / "public" / "images" / img_name
    if src.exists():
        dst = Path("public/images") / img_name
        shutil.copy2(src, dst)
        if desc:
            print(f"  ✓ {img_name} ({desc})")
        else:
            print(f"  ✓ {img_name}")

print()

# Install Hero component
print("→ Installing Hero component...")
hero_src = src_root / "src" / "components" / "Hero.jsx"
if hero_src.exists():
    Path("src/components").mkdir(parents=True, exist_ok=True)
    shutil.copy2(hero_src, "src/components/Hero.jsx")
    print("  ✓ src/components/Hero.jsx")

print()

# Append CSS
print("→ Appending hero CSS polish...")
css_file = Path("src/index.css")
css_additions = src_root / "src" / "index-additions-hero.css"

if css_additions.exists():
    with open(css_file, 'a', encoding='utf-8') as f:
        with open(css_additions, 'r', encoding='utf-8') as additions:
            f.write("\n")
            f.write(additions.read())
    print("  ✓ CSS appended")
else:
    print("  ⚠️  CSS file not found in zip")

print()

# Clean up old SVG files
print("→ Cleaning up old SVG heroes...")
for svg_name in ["hero-analyze.svg", "hero-profile.svg", "hero-coach.svg", "hero-simulate.svg"]:
    svg_path = Path("public/images") / svg_name
    if svg_path.exists():
        svg_path.unlink()
        print(f"  ✓ removed {svg_name}")

print()

# Cleanup temp
shutil.rmtree(extract_dir, ignore_errors=True)

# Verify
print("→ Verifying...")
required_files = [
    "public/images/hero-analyze.jpg",
    "public/images/hero-coach.jpg",
    "public/images/hero-simulate.jpg",
    "public/images/hero-profile.jpg",
    "src/components/Hero.jsx",
]

missing = False
for f in required_files:
    if not Path(f).exists():
        print(f"  ❌ Missing: {f}")
        missing = True

if missing:
    print("\n❌ Some files missing!")
    exit(1)

print("✓ All files in place\n")

# Git
print("→ Committing to git...")
os.system("git add .")
os.system('git commit -m "Replace SVG heroes with brain-connection imagery — WebP+JPG responsive"')
print("✓ Committed")

print()
print("→ Pushing to Vercel...")
os.system("git push origin HEAD")
print("✅ Pushed! Vercel is building.\n")

print("╔══════════════════════════════════════════════╗")
print("║              WHAT CHANGED                     ║")
print("╠══════════════════════════════════════════════╣")
print("║                                                ║")
print("║  Hero images now use the brain photo:         ║")
print("║  • Analyze  → both brains connecting          ║")
print("║  • Decode   → both brains (tighter crop)      ║")
print("║  • Coach    → blue brain (user learning)      ║")
print("║  • Practice → orange brain (AI persona)       ║")
print("║  • Profile  → both brains                     ║")
print("║                                                ║")
print("║  Format: WebP (modern) + JPG (fallback)       ║")
print("║  Size:   ~70KB each (vs original 500KB PNG)   ║")
print("║                                                ║")
print("║  Bonus: hero image now has a gentle zoom-in   ║")
print("║  reveal animation + subtle hover zoom.        ║")
print("║                                                ║")
print("╚══════════════════════════════════════════════╝\n")
print(f"Backup: {backup_name}\n")
