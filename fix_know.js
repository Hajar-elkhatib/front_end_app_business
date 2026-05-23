const fs = require('fs');

let docPath = 'c:/projects/tutor/front_end_app_business/projects/chatbox/src/app/models/knowledge-document.model.ts';
let c = fs.readFileSync(docPath, 'utf8');
c = c.replace(/"\n?$/, '');
fs.writeFileSync(docPath, c);
console.log('Fixed doc.model.ts');
