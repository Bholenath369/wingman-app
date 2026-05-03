#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Using Extract-zip library if available, otherwise use a simple approach
const AdmZip = require('adm-zip');

const projectRoot = process.cwd();
const zipFile = path.join(projectRoot, 'hero update.zip');
const tempDir = path.join(projectRoot, '.tmp-hero-upgrade');

console.log('='.repeat(50));
console.log('      Hero Upgrade Installation');
console.log('='.repeat(50));

try {
  // Clean temp dir
  if (fs.existsSync(tempDir)) {
    fs.rmSync(tempDir, { recursive: true, force: true });
    console.log(`✓ Cleaned old temp directory`);
  }

  // Extract zip
  console.log(`\n→ Extracting ${path.basename(zipFile)}...`);
  const zip = new AdmZip(zipFile);
  zip.extractAllTo(tempDir, true);
  console.log(`✓ Extracted to ${tempDir}`);

  // Find the actual extracted root
  let extractedRoot = tempDir;
  
  // Check for nested structure
  const items = fs.readdirSync(tempDir);
  for (const item of items) {
    const itemPath = path.join(tempDir, item);
    if (fs.statSync(itemPath).isDirectory()) {
      const publicPath = path.join(itemPath, 'public', 'images');
      const srcPath = path.join(itemPath, 'src', 'components');
      if (fs.existsSync(publicPath) || fs.existsSync(srcPath)) {
        extractedRoot = itemPath;
        break;
      }
    }
  }

  console.log(`✓ Using extracted root: ${path.relative(projectRoot, extractedRoot)}`);

  // Copy image files
  console.log(`\n→ Copying image files...`);
  const imagesSrc = path.join(extractedRoot, 'public', 'images');
  const imagesDst = path.join(projectRoot, 'public', 'images');

  if (fs.existsSync(imagesSrc)) {
    fs.mkdirSync(imagesDst, { recursive: true });
    
    const files = fs.readdirSync(imagesSrc);
    for (const file of files) {
      if (/\.(jpg|webp|jpeg)$/i.test(file)) {
        const src = path.join(imagesSrc, file);
        const dst = path.join(imagesDst, file);
        fs.copyFileSync(src, dst);
        console.log(`  ✓ ${file}`);
      }
    }
  } else {
    console.log(`  ⚠️  No images found at ${imagesSrc}`);
  }

  // Copy Hero.jsx
  console.log(`\n→ Copying Hero.jsx...`);
  const heroSrc = path.join(extractedRoot, 'src', 'components', 'Hero.jsx');
  const heroDst = path.join(projectRoot, 'src', 'components', 'Hero.jsx');

  if (fs.existsSync(heroSrc)) {
    fs.mkdirSync(path.dirname(heroDst), { recursive: true });
    fs.copyFileSync(heroSrc, heroDst);
    console.log(`  ✓ src/components/Hero.jsx`);
  } else {
    console.log(`  ⚠️  Hero.jsx not found at ${heroSrc}`);
  }

  // Append CSS
  console.log(`\n→ Appending CSS...`);
  const cssSrc = path.join(extractedRoot, 'src', 'index-additions-hero.css');
  const cssDst = path.join(projectRoot, 'src', 'index.css');

  if (fs.existsSync(cssSrc)) {
    const cssContent = fs.readFileSync(cssDst, 'utf8');
    
    if (!cssContent.includes('Brain Hero Image Polish')) {
      const cssAdditions = fs.readFileSync(cssSrc, 'utf8');
      fs.appendFileSync(cssDst, '\n\n' + cssAdditions);
      console.log(`  ✓ CSS appended to src/index.css`);
    } else {
      console.log(`  ⚠️  Hero CSS already present — skipping`);
    }
  } else {
    console.log(`  ⚠️  index-additions-hero.css not found at ${cssSrc}`);
  }

  // Delete old SVG files
  console.log(`\n→ Cleaning up old SVG heroes...`);
  const svgFiles = [
    'hero-analyze.svg',
    'hero-profile.svg',
    'hero-coach.svg',
    'hero-simulate.svg',
  ];

  for (const svgFile of svgFiles) {
    const svgPath = path.join(imagesDst, svgFile);
    if (fs.existsSync(svgPath)) {
      fs.unlinkSync(svgPath);
      console.log(`  ✓ removed ${svgFile}`);
    }
  }

  // Clean temp
  console.log(`\n→ Cleaning temp directory...`);
  fs.rmSync(tempDir, { recursive: true, force: true });
  console.log(`  ✓ Removed ${path.relative(projectRoot, tempDir)}`);

  console.log('\n' + '='.repeat(50));
  console.log('✓ Hero upgrade files copied successfully!');
  console.log('='.repeat(50));

  // Show git status
  console.log(`\n→ Current git status:`);
  try {
    const status = execSync('git status --short', { encoding: 'utf8' });
    console.log(status);
  } catch (e) {
    console.log('  (git not available)');
  }

  console.log(`\nReady for git commit and push.`);
  console.log(`Next steps:`);
  console.log(`  git add .`);
  console.log(`  git commit -m "Replace SVG heroes with brain-connection imagery — WebP+JPG responsive"`);
  console.log(`  git push origin HEAD`);

} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
