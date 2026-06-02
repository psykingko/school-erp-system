import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const seedFile = path.join(__dirname, 'src', 'mockDB', 'seed', 'questionPapersSeed.js');

let content = fs.readFileSync(seedFile, 'utf8');

// Replace "Draft Test" with "Submitted Test"
content = content.replace(/- Draft Test/g, '- Submitted Test');

// Replace "status": "Draft" with "status": "Submitted"
content = content.replace(/"status": "Draft"/g, '"status": "Submitted"');

fs.writeFileSync(seedFile, content, 'utf8');
console.log('Seed data updated successfully!');
