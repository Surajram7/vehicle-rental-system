const fs = require('fs');
const path = require('path');

const files = [
    'src/context/AuthContext.jsx',
    'src/pages/Admin/BookingManager.jsx',
    'src/pages/Admin/Dashboard.jsx',
    'src/pages/Admin/UserManager.jsx',
    'src/pages/Admin/VehicleManager.jsx',
    'src/pages/Customer/BookingsList.jsx',
    'src/pages/Customer/VehicleGrid.jsx'
];

files.forEach(file => {
    const fullPath = path.join(__dirname, file);
    let content = fs.readFileSync(fullPath, 'utf8');
    
    const depth = file.split('/').length - 2;
    const importPath = depth === 0 ? './api' : '../'.repeat(depth) + 'api';

    if (!content.includes(`import { api }`)) {
        const importStatement = `import { api } from '${importPath}';\n`;
        const lastImportIndex = content.lastIndexOf('import ');
        if (lastImportIndex !== -1) {
            const nextLineAfterLastImportBlock = lastImportIndex + content.substring(lastImportIndex).indexOf('\n') + 1;
            content = content.substring(0, nextLineAfterLastImportBlock) + importStatement + content.substring(nextLineAfterLastImportBlock);
        } else {
            content = importStatement + content;
        }
    }

    content = content.replace(/window\.api/g, 'api');
    fs.writeFileSync(fullPath, content);
});
console.log('Update Complete');
