const fs = require('fs');
const path = require('path');

// Files that need to be updated
const filesToUpdate = [
  'app/parties/page.tsx',
  'app/match-history/page.tsx',
  'app/parties/create/page.tsx',
  'app/parties/[id]/edit/page.tsx',
  'components/ui/JoinPartyModal.tsx',
  'components/ui/DiscordIntegration.tsx'
];

function updateFile(filePath) {
  const fullPath = path.join(__dirname, filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`❌ File not found: ${filePath}`);
    return false;
  }
  
  let content = fs.readFileSync(fullPath, 'utf8');
  
  // Check if API_URL is already imported
  const hasApiImport = content.includes("import { API_URL } from '@/lib/constants'") ||
                       content.includes('import { API_URL }');
  
  // Replace all localhost:3001 with ${API_URL}
  const originalContent = content;
  content = content.replace(/http:\/\/localhost:3001/g, '${API_URL}');
  
  // Add import if needed and file was changed
  if (!hasApiImport && content !== originalContent) {
    // Find the last import statement
    const imports = content.match(/^import .*?;$/gm);
    if (imports && imports.length > 0) {
      const lastImport = imports[imports.length - 1];
      const lastImportIndex = content.lastIndexOf(lastImport);
      const insertPosition = lastImportIndex + lastImport.length;
      
      content = content.slice(0, insertPosition) + 
                "\nimport { API_URL } from '@/lib/constants';" +
                content.slice(insertPosition);
    }
  }
  
  if (content !== originalContent) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`✅ Updated: ${filePath}`);
    return true;
  } else {
    console.log(`⏭️  No changes needed: ${filePath}`);
    return false;
  }
}

console.log('🚀 Starting API URL updates...\n');

let updatedCount = 0;
filesToUpdate.forEach(file => {
  if (updateFile(file)) {
    updatedCount++;
  }
});

console.log(`\n✨ Done! Updated ${updatedCount} file(s).`);
