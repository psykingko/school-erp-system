const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else {
            if (file.endsWith('.js') || file.endsWith('.jsx')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walk(path.join(__dirname, 'src'));
let totalReplacements = 0;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;
    
    // Replace "Class XI" with "Class 11"
    content = content.replace(/Class XI\b/g, 'Class 11');
    content = content.replace(/Class XII\b/g, 'Class 12');
    
    // Replace "XI-" with "11-"
    content = content.replace(/\bXI-/g, '11-');
    content = content.replace(/\bXII-/g, '12-');

    // For feeStructures.js etc: "XI — " -> "11 — "
    content = content.replace(/\bXI —/g, '11 —');
    content = content.replace(/\bXII —/g, '12 —');
    
    if (content !== original) {
        fs.writeFileSync(file, content);
        console.log(`Updated ${file}`);
        totalReplacements++;
    }
});

console.log(`Updated ${totalReplacements} files.`);
