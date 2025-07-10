/**
 * Launch Check Script
 * Verifies that all required files are present for the app to launch
 */

const fs = require('fs');
const path = require('path');

const requiredFiles = [
  // Main files
  'main.js',
  'preload.js',
  'package.json',
  
  // HTML
  'src/index.html',
  
  // Main CSS
  'src/styles/main.css',
  
  // Component CSS
  'src/styles/components/canvas.css',
  'src/styles/components/menus.css',
  'src/styles/components/timeline.css',
  'src/styles/components/tools.css',
  
  // Theme CSS
  'src/styles/themes/lain-dive.css',
  'src/styles/themes/monolith.css',
  'src/styles/themes/morrowind-glyph.css',
  
  // JavaScript files
  'src/scripts/app.js',
  'src/scripts/canvas/PixelCanvas.js',
  'src/scripts/animation/Timeline.js',
  'src/scripts/animation/Frame.js',
  'src/scripts/animation/GifExporter.js',
  'src/scripts/tools/BrushEngine.js',
  'src/scripts/tools/SymmetryTools.js',
  'src/scripts/tools/PaletteTool.js',
  'src/scripts/tools/GlitchTool.js',
  'src/scripts/ui/UIManager.js',
  'src/scripts/ui/ThemeManager.js',
  'src/scripts/ui/MenuSystem.js',
  'src/scripts/lib/gif.js',
  'src/scripts/lib/gif.worker.js'
];

console.log('🔍 Checking required files for Conjuration...\n');

let allFilesPresent = true;
let missingFiles = [];

requiredFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - MISSING`);
    allFilesPresent = false;
    missingFiles.push(file);
  }
});

console.log('\n' + '='.repeat(50));

if (allFilesPresent) {
  console.log('🎉 All required files are present!');
  console.log('🚀 App is ready to launch!');
  console.log('\nTo start the app, run:');
  console.log('npm start');
} else {
  console.log('⚠️  Missing files detected:');
  missingFiles.forEach(file => {
    console.log(`   - ${file}`);
  });
  console.log('\n❌ App is NOT ready to launch!');
}

console.log('\n' + '='.repeat(50));