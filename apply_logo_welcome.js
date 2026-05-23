const fs = require('fs');
const path = require('path');

const srcAppDir = path.join(__dirname, 'projects', 'chatbox', 'src', 'app');

const newLogoSvg = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>`;

// Login
const loginPath = path.join(srcAppDir, 'pages', 'auth', 'login', 'login.html');
if (fs.existsSync(loginPath)) {
    let content = fs.readFileSync(loginPath, 'utf8');
    content = content.replace(
        /<div class="auth-logo">([\s\S]*?)<\/div>/,
        `<div class="auth-logo" style="display:flex; justify-content:center; align-items:center;">${newLogoSvg}</div>`
    );
    fs.writeFileSync(loginPath, content);
}

// Register
const regPath = path.join(srcAppDir, 'pages', 'auth', 'register', 'register.html');
if (fs.existsSync(regPath)) {
    let content = fs.readFileSync(regPath, 'utf8');
    content = content.replace(
        /<div class="auth-logo">([\s\S]*?)<\/div>/,
        `<div class="auth-logo" style="display:flex; justify-content:center; align-items:center;">${newLogoSvg}</div>`
    );
    fs.writeFileSync(regPath, content);
}

// Welcome
const welcomePath = path.join(srcAppDir, 'pages', 'welcome', 'welcome.html');
if (fs.existsSync(welcomePath)) {
    let content = fs.readFileSync(welcomePath, 'utf8');
    content = content.replace(
        /<div class="icon-brand shadow-glow-indigo">([\s\S]*?)<\/div>/,
        `<div class="icon-brand shadow-glow-indigo" style="display:flex; justify-content:center; align-items:center;">${newLogoSvg}</div>`
    );
    fs.writeFileSync(welcomePath, content);
}

// Also update sidebar to not say IntelliVal but NexusAI if it's there
const sidebarPath = path.join(srcAppDir, 'components', 'sidebar', 'sidebar.ts');
if (fs.existsSync(sidebarPath)) {
    let content = fs.readFileSync(sidebarPath, 'utf8');
    content = content.replace(/IntelliVal/g, 'NexusAI');
    fs.writeFileSync(sidebarPath, content);
}
