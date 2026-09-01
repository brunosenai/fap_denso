const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'src');

const replacements = [
  { regex: /azulStellantis/g, replacement: 'vermelhoDenso' },
  { regex: /Stellantis/g, replacement: 'Denso' },
  { regex: /stellantis/g, replacement: 'denso' },
  { regex: /logo-stellantis-branco\.png/g, replacement: 'denso_logo.png' }
];

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let newContent = content;
  
  replacements.forEach(({ regex, replacement }) => {
    newContent = newContent.replace(regex, replacement);
  });

  if (content !== newContent) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`Updated ${filePath}`);
  }
}

function traverseDirectory(dir) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      traverseDirectory(fullPath);
    } else if (stat.isFile() && (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts') || fullPath.endsWith('.css'))) {
      replaceInFile(fullPath);
    }
  });
}

traverseDirectory(directoryPath);
console.log('Done replacing.');
