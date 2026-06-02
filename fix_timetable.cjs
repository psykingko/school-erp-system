const fs = require('fs');
let content = fs.readFileSync('src/mockDB/seed/timetable.js', 'utf8');

content = content.replace(/s:"sub-hin", t:"teach-00[12]"/g, 's:"sub-hin", t:"teach-009"');
content = content.replace(/s:"sub-bio", t:"teach-006"/g, 's:"sub-bio", t:"teach-010"');
content = content.replace(/s:"sub-eco", t:"teach-007"/g, 's:"sub-eco", t:"teach-011"');
content = content.replace(/s:"sub-cs", t:"teach-005"/g, 's:"sub-cs", t:"teach-012"');
content = content.replace(/s:"sub-ip", t:"teach-007"/g, 's:"sub-ip", t:"teach-012"');
content = content.replace(/s:"sub-his", t:"teach-004"/g, 's:"sub-his", t:"teach-013"');
content = content.replace(/s:"sub-pol", t:"teach-004"/g, 's:"sub-pol", t:"teach-014"');
content = content.replace(/s:"sub-geo", t:"teach-004"/g, 's:"sub-geo", t:"teach-015"');
content = content.replace(/s:"sub-bst", t:"teach-007"/g, 's:"sub-bst", t:"teach-016"');
content = content.replace(/s:"act-games", t:"teach-008"/g, 's:"act-games", t:"teach-017"');
content = content.replace(/s:"act-art", t:"teach-008"/g, 's:"act-art", t:"teach-018"');
content = content.replace(/s:"act-library", t:"teach-008"/g, 's:"act-library", t:"teach-018"');
content = content.replace(/teach-008/g, 'teach-018');

fs.writeFileSync('src/mockDB/seed/timetable.js', content);
console.log('Replaced teacher IDs in timetable.js');
