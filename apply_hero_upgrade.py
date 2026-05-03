#!/usr/bin/env python3
"""Apply hero upgrade from zip file."""

import os
import shutil
import zipfile
import sys
from pathlib import Path

os.chdir(r'C:\Users\amit1\OneDrive\Desktop\wingman-app\wingman')

ZIP_FILE = "hero update.zip"
TEMP_DIR = "hero-update-temp"
PROJECT_ROOT = Path.cwd()

print("=" * 50)
print("Hero Upgrade Installation")
print("=" * 50)

# Clean temp dir if it exists
if Path(TEMP_DIR).exists():
    shutil.rmtree(TEMP_DIR)
    print(f"✓ Cleaned old {TEMP_DIR}")

# Extract zip
print(f"\n→ Extracting {ZIP_FILE}...")
try:
    with zipfile.ZipFile(ZIP_FILE, 'r') as zip_ref:
        zip_ref.extractall(TEMP_DIR)
    print(f"✓ Extracted to {TEMP_DIR}")
except Exception as e:
    print(f"❌ Failed to extract: {e}")
    sys.exit(1)

# List extracted structure
print(f"\n→ Extracted structure:")
for root, dirs, files in os.walk(TEMP_DIR):
    level = root.replace(TEMP_DIR, '').count(os.sep)
    indent = ' ' * 2 * level
    print(f'{indent}{os.path.basename(root)}/')
    subindent = ' ' * 2 * (level + 1)
    for file in files[:5]:  # Show first 5 files
        print(f'{subindent}{file}')
    if len(files) > 5:
        print(f'{subindent}... and {len(files) - 5} more files')

# Find the actual extracted root (may be nested)
extracted_root = None
for item in Path(TEMP_DIR).iterdir():
    if item.is_dir():
        # Check if this dir has public/images or src/components
        if (item / 'public' / 'images').exists() or (item / 'src' / 'components').exists():
            extracted_root = item
            break

if not extracted_root:
    # Try one level deeper
    for item in Path(TEMP_DIR).rglob('*'):
        if item.is_dir() and item.name in ['public', 'src']:
            extracted_root = item.parent
            break

if not extracted_root:
    extracted_root = Path(TEMP_DIR)

print(f"\n✓ Using extracted root: {extracted_root}")

# Copy image files
print(f"\n→ Copying image files...")
images_src = extracted_root / 'public' / 'images'
images_dst = PROJECT_ROOT / 'public' / 'images'

if images_src.exists():
    images_dst.mkdir(parents=True, exist_ok=True)
    
    for img_file in images_src.glob('*'):
        if img_file.is_file() and img_file.suffix in ['.jpg', '.webp', '.jpeg']:
            dst_file = images_dst / img_file.name
            shutil.copy2(img_file, dst_file)
            print(f"  ✓ {img_file.name}")
else:
    print(f"  ⚠️  No images found at {images_src}")

# Copy Hero.jsx
print(f"\n→ Copying Hero.jsx...")
hero_src = extracted_root / 'src' / 'components' / 'Hero.jsx'
hero_dst = PROJECT_ROOT / 'src' / 'components' / 'Hero.jsx'

if hero_src.exists():
    hero_dst.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(hero_src, hero_dst)
    print(f"  ✓ src/components/Hero.jsx")
else:
    print(f"  ⚠️  Hero.jsx not found at {hero_src}")

# Append CSS
print(f"\n→ Appending CSS...")
css_src = extracted_root / 'src' / 'index-additions-hero.css'
css_dst = PROJECT_ROOT / 'src' / 'index.css'

if css_src.exists():
    # Check if already appended
    with open(css_dst, 'r', encoding='utf-8') as f:
        css_content = f.read()
    
    if "Brain Hero Image Polish" not in css_content:
        with open(css_src, 'r', encoding='utf-8') as f:
            css_additions = f.read()
        
        with open(css_dst, 'a', encoding='utf-8') as f:
            f.write('\n\n' + css_additions)
        print(f"  ✓ CSS appended to src/index.css")
    else:
        print(f"  ⚠️  Hero CSS already present — skipping")
else:
    print(f"  ⚠️  index-additions-hero.css not found at {css_src}")

# Delete old SVG files
print(f"\n→ Cleaning up old SVG heroes...")
svg_files = [
    'hero-analyze.svg',
    'hero-profile.svg',
    'hero-coach.svg',
    'hero-simulate.svg',
]

for svg_file in svg_files:
    svg_path = images_dst / svg_file
    if svg_path.exists():
        svg_path.unlink()
        print(f"  ✓ removed {svg_file}")

# Clean temp dir
print(f"\n→ Cleaning temp directory...")
shutil.rmtree(TEMP_DIR)
print(f"  ✓ Removed {TEMP_DIR}")

print("\n" + "=" * 50)
print("✓ Hero upgrade applied successfully!")
print("=" * 50)

# Show git status
print("\n→ Git status:")
os.system("git status --short")
