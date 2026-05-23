const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else if (file.endsWith('.ts')) {
            results.push(file);
        }
    });
    return results;
}

const files = walk('c:/projects/tutor/front_end_app_business/projects/chatbox/src/app');
let count = 0;
files.forEach(f => {
    let content = fs.readFileSync(f, 'utf8');
    // Check if it's practically a single line or has no actual newlines inside (excluding end)
    const lines = content.split('\n');
    if (lines.length <= 2 && content.includes('\\n')) {
        content = content.replace(/\\n/g, '\n');
        if (content.endsWith('"') || content.endsWith('"\n')) {
            content = content.replace(/"\n?$/, '');
        }
        if (content.startsWith('"')) {
            content = content.substring(1);
        }
        fs.writeFileSync(f, content);
        console.log('Fixed', f);
        count++;
    }
});
console.log('Total fixed files:', count);
