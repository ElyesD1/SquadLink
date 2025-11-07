const fs = require('fs');
const path = require('path');

// Files that need to be fixed
const filesToFix = [
  'app/parties/create/page.tsx',
  'app/match-history/page.tsx'
];

function fixFile(filePath) {
  const fullPath = path.join(__dirname, filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`❌ File not found: ${filePath}`);
    return false;
  }
  
  let content = fs.readFileSync(fullPath, 'utf8');
  const originalContent = content;
  
  // Fix: fetch('${API_URL} to fetch(`${API_URL}
  content = content.replace(/fetch\('(\$\{API_URL\}[^']*?)'/g, 'fetch(`$1`');
  
  if (content !== originalContent) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`✅ Fixed: ${filePath}`);
    return true;
  } else {
    console.log(`⏭️  No changes needed: ${filePath}`);
    return false;
  }
}

console.log('🔍 Fixing template literal syntax issues...\n');

let fixedCount = 0;
filesToFix.forEach(file => {
  if (fixFile(file)) {
    fixedCount++;
  }
});

console.log(`\n✨ Done! Fixed ${fixedCount} file(s).`);
