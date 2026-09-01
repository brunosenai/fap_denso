const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

const findFiles = (dir, fileList = []) => {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      findFiles(fullPath, fileList);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      fileList.push(fullPath);
    }
  }
  return fileList;
};

const allFiles = findFiles(srcDir);

allFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  // Replace logo-denso-branco.png or denso_logo.png in <Image ... /> for web components
  // Note: Pdf components might need special handling
  if (file.includes('RelatorioFap') || file.includes('RelatorioFap_v2')) {
    // For react-pdf, we can try to use the SVG file path since Image src supports it? 
    // Or just use the denso_logo.png
    content = content.replace(/logo-denso-branco\.png/g, 'denso_logo.svg');
    content = content.replace(/#243783/g, '#E3000F');
  } else {
    // Web components
    if (content.includes('logo-denso-branco.png') || content.includes('denso_logo.png')) {
      
      // Import DensoLogo if not present
      if (!content.includes('DensoLogo')) {
        // Find last import
        const imports = content.match(/^import .*$/gm) || [];
        if (imports.length > 0) {
          const lastImport = imports[imports.length - 1];
          content = content.replace(lastImport, lastImport + "\nimport { DensoLogo } from \"@/components/DensoLogo\";");
        } else {
          content = "import { DensoLogo } from \"@/components/DensoLogo\";\n" + content;
        }
      }

      // We need to figure out fillColor. If it's Topo component or login, background is usually red, so white logo.
      // If it's TelaDashboard, maybe it's on white? Let's default to white for most top bars, and red for white bg.
      // Let's use regex to replace Image tags containing the logo.
      
      const imageRegex = /<Image[^>]*src=\{?['"`](?:[^'"`]*\/)?(?:logo-denso-branco\.png|denso_logo\.png)['"`]\}?[^>]*\/>/g;
      
      content = content.replace(imageRegex, (match) => {
        let classNameMatch = match.match(/className=\{([^}]+)\}/);
        let classNameProp = classNameMatch ? ` className={${classNameMatch[1]}}` : '';
        
        if (!classNameMatch) {
            let classStringMatch = match.match(/className=(['"][^'"]+['"])/);
            if (classStringMatch) classNameProp = ` className=${classStringMatch[1]}`;
        }
        
        let widthMatch = match.match(/width=\{([^}]+)\}/) || match.match(/width=(['"][^'"]+['"])/);
        let widthProp = widthMatch ? ` width={${widthMatch[1]}}` : ' width={200}';
        
        // Check if we are in Dashboard (usually white background) or Topo (red background)
        let fillColor = 'white';
        if (file.includes('TelaDashboard')) {
           fillColor = 'var(--vermelhoDenso)';
        }
        
        return `<DensoLogo fillColor="${fillColor}"${classNameProp}${widthProp} />`;
      });
    }
  }

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated ${file}`);
  }
});

console.log('Update complete.');
