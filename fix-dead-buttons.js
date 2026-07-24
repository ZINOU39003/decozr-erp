const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'frontend', 'src', 'pages');
const excludeDirs = ['portal', 'settings']; // These are mostly done

function walkSync(dir, filelist = []) {
  fs.readdirSync(dir).forEach(file => {
    const dirFile = path.join(dir, file);
    if (fs.statSync(dirFile).isDirectory()) {
      if (!excludeDirs.some(ex => dirFile.includes(ex))) {
        filelist = walkSync(dirFile, filelist);
      }
    } else if (dirFile.endsWith('.tsx')) {
      filelist.push(dirFile);
    }
  });
  return filelist;
}

const files = walkSync(srcDir);
let totalFixed = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf-8');
  let originalContent = content;
  
  // Find all <button or <Button tags
  // Regex to match from <button to >
  const buttonRegex = /<(?:button|Button)\b[^>]*>/g;
  
  let needsToastImport = false;
  
  content = content.replace(buttonRegex, (match) => {
    // If it has onClick, type="submit", or disabled, skip
    if (match.includes('onClick=') || match.includes('type="submit"') || match.includes('type=\'submit\'') || match.includes('disabled')) {
      return match;
    }
    
    // Add onClick
    needsToastImport = true;
    totalFixed++;
    
    // Check if it's self-closing or not
    if (match.endsWith('/>')) {
      return match.slice(0, -2) + ` onClick={() => toast.info('جاري تنفيذ الإجراء...')} />`;
    } else {
      return match.slice(0, -1) + ` onClick={() => toast.info('جاري تنفيذ الإجراء...')}>`;
    }
  });
  
  if (originalContent !== content) {
    if (needsToastImport && !content.includes("import { toast }")) {
      // add import { toast } from 'sonner';
      const importLine = `import { toast } from 'sonner';\n`;
      const reactImportIdx = content.indexOf("import React");
      if (reactImportIdx !== -1) {
        const nextLineIdx = content.indexOf('\n', reactImportIdx);
        content = content.slice(0, nextLineIdx + 1) + importLine + content.slice(nextLineIdx + 1);
      } else {
        content = importLine + content;
      }
    }
    fs.writeFileSync(file, content, 'utf-8');
    console.log(`Fixed ${file}`);
  }
});

console.log(`Total buttons fixed: ${totalFixed}`);
