#!/usr/bin/env python3
import os
import shutil
import zipfile
from pathlib import Path

os.chdir(r'C:\Users\amit1\OneDrive\Desktop\wingman-app\wingman')

ZIP_FILE = "hero update.zip"
TEMP_DIR = ".tmp-hero-upgrade"

print("Hero Upgrade Installation")
print("=" * 50)

# Clean temp
if Path(TEMP_DIR).exists():
    shutil.rmtree(TEMP_DIR)

# Extract
print(f"\nExtracting {ZIP_FILE}...")
with zipfile.ZipFile(ZIP_FILE, 'r') as z:
    z.extractall(TEMP_DIR)

print(f"✓ Extracted")

# Find root
root = Path(TEMP_DIR)
for item in root.iterdir():
    if item.is_dir():
        if (item / 'public' / 'images').exists():
            root = item
            break

print(f"✓ Using: {root.name}")

# Copy images
print(f"\nCopying images...")
img_src = root / 'public' / 'images'
img_dst = Path('public/images')
img_dst.mkdir(parents=True, exist_ok=True)

for f in img_src.glob('*.jpg'):
    shutil.copy2(f, img_dst / f.name)
    print(f"  ✓ {f.name}")

for f in img_src.glob('*.webp'):
    shutil.copy2(f, img_dst / f.name)
    print(f"  ✓ {f.name}")

# Copy Hero.jsx
print(f"\nCopying Hero.jsx...")
hero_src = root / 'src' / 'components' / 'Hero.jsx'
hero_dst = Path('src/components/Hero.jsx')
if hero_src.exists():
    hero_dst.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(hero_src, hero_dst)
    print(f"  ✓ {hero_dst}")

# Append CSS
print(f"\nAppending CSS...")
css_src = root / 'src' / 'index-additions-hero.css'
css_dst = Path('src/index.css')
if css_src.exists():
    with open(css_dst) as f:
        css = f.read()
    if 'Brain Hero Image Polish' not in css:
        with open(css_src) as f:
            additions = f.read()
        with open(css_dst, 'a') as f:
            f.write('\n\n' + additions)
        print(f"  ✓ CSS appended")

# Delete SVGs
print(f"\nRemoving SVG files...")
for svg in ['hero-analyze.svg', 'hero-profile.svg', 'hero-coach.svg', 'hero-simulate.svg']:
    p = img_dst / svg
    if p.exists():
        p.unlink()
        print(f"  ✓ {svg}")

# Cleanup
print(f"\nCleaning temp...")
shutil.rmtree(TEMP_DIR)

print("\n" + "=" * 50)
print("Installation complete!")
print("\nNext: git add . && git commit && git push")
