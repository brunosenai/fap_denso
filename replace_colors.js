const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

const findFiles = (dir, fileList = []) => {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      findFiles(fullPath, fileList);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts') || fullPath.endsWith('.css')) {
      fileList.push(fullPath);
    }
  }
  return fileList;
};

const allFiles = findFiles(srcDir);

allFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  // Replace Hex Colors
  content = content.replace(/#243783/gi, '#E3000F'); // Primary blue -> Primary Red
  content = content.replace(/#253059/gi, '#99000A'); // Dark blue -> Dark Red
  content = content.replace(/#7CF2FF/gi, '#FF9999'); // Light blue highlight -> Light red highlight
  content = content.replace(/#E0F5FF/gi, '#FFE5E5'); // Very light blue -> Very light red
  
  // Replace Variable Names
  content = content.replace(/--azulDestaque/g, '--vermelhoDestaque');
  content = content.replace(/--azulFap/g, '--vermelhoFap');
  
  // Replace 'azul' text if it's used as a class or something? 
  // Wait, let's just stick to the variables and hex codes we found.
  
  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated colors in ${file}`);
  }
});

console.log('Color replacement complete.');
