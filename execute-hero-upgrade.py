#!/usr/bin/env python3
import os
import shutil
import zipfile
from pathlib import Path

# Set working directory
os.chdir('C:\\Users\\amit1\\OneDrive\\Desktop\\wingman-app\\wingman')

print('=== Step 1: Extract hero update.zip ===')
zip_file = 'hero update.zip'
temp_dir = '.tmp-hero-upgrade'

if not os.path.exists(zip_file):
    print(f'ERROR: {zip_file} not found in {os.getcwd()}')
    exit(1)

# Remove temp dir if exists
if os.path.exists(temp_dir):
    shutil.rmtree(temp_dir)

os.makedirs(temp_dir)
with zipfile.ZipFile(zip_file, 'r') as zip_ref:
    zip_ref.extractall(temp_dir)
print(f'✓ Extracted to {temp_dir}')

# Find the extracted folder
extracted_items = os.listdir(temp_dir)
print(f'  Contents: {extracted_items}')
source_base = os.path.join(temp_dir, extracted_items[0]) if len(extracted_items) == 1 else temp_dir

print('\n=== Step 2: Copy image files (.jpg, .webp) ===')
source_images = os.path.join(source_base, 'public', 'images')
dest_images = os.path.join('public', 'images')

copied_images = []
if os.path.exists(source_images):
    os.makedirs(dest_images, exist_ok=True)
    for file in os.listdir(source_images):
        if file.endswith(('.jpg', '.webp', '.jpeg')):
            src = os.path.join(source_images, file)
            dst = os.path.join(dest_images, file)
            shutil.copy2(src, dst)
            print(f'  ✓ {file}')
            copied_images.append(file)
    print(f'✓ Copied {len(copied_images)} image files')
else:
    print(f'✗ Source images folder not found: {source_images}')

print('\n=== Step 3: Copy Hero.jsx ===')
source_hero = os.path.join(source_base, 'src', 'components', 'Hero.jsx')
dest_hero = os.path.join('src', 'components', 'Hero.jsx')

if os.path.exists(source_hero):
    os.makedirs(os.path.dirname(dest_hero), exist_ok=True)
    shutil.copy2(source_hero, dest_hero)
    print(f'✓ Copied Hero.jsx')
else:
    print(f'✗ Source Hero.jsx not found: {source_hero}')

print('\n=== Step 4: Append CSS content ===')
source_css = os.path.join(source_base, 'src', 'index-additions-hero.css')
dest_css = os.path.join('src', 'index.css')

if os.path.exists(source_css):
    with open(source_css, 'r') as f:
        new_css_content = f.read()
    
    if os.path.exists(dest_css):
        with open(dest_css, 'r') as f:
            existing_css = f.read()
        
        if 'Brain Hero Image Polish' not in existing_css:
            with open(dest_css, 'a') as f:
                f.write('\n\n/* Appended from hero upgrade */\n')
                f.write(new_css_content)
            print('✓ CSS content appended to index.css')
        else:
            print('⊘ CSS content already present - skipping')
    else:
        with open(dest_css, 'w') as f:
            f.write(new_css_content)
        print('✓ Created index.css with new content')
else:
    print(f'✗ Source CSS not found: {source_css}')

print('\n=== Step 5: Delete old SVG hero files ===')
old_svgs = [
    'hero-analyze.svg',
    'hero-profile.svg',
    'hero-coach.svg',
    'hero-simulate.svg'
]

deleted_count = 0
for svg_file in old_svgs:
    svg_path = os.path.join('public', 'images', svg_file)
    if os.path.exists(svg_path):
        os.remove(svg_path)
        print(f'  ✓ {svg_file}')
        deleted_count += 1
    else:
        print(f'  ⊘ {svg_file} (not found)')
print(f'✓ Deleted {deleted_count} SVG files')

print('\n=== Step 6: Clean up temporary folder ===')
shutil.rmtree(temp_dir)
print(f'✓ Removed {temp_dir}')

print('\n✅ All file operations completed successfully!')
