const fs = require('fs');

let modelPath = 'c:/projects/tutor/front_end_app_business/projects/chatbox/src/app/models/chat.model.ts';
let c = fs.readFileSync(modelPath, 'utf8');
c = c.replace('lastMessage?: Message;', 'lastMessage?: ChatMessage;');
c = c.replace(/"\n?$/, '');
fs.writeFileSync(modelPath, c);
console.log('Fixed chat.model.ts');
