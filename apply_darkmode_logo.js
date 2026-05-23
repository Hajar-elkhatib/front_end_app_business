const fs = require('fs');
const path = require('path');

const srcAppDir = path.join(__dirname, 'projects', 'chatbox', 'src', 'app');

// 1. Update Logo in MainLayout (main-layout.html)
const mainLayoutPath = path.join(srcAppDir, 'layout', 'main-layout.html');
let mainLayoutHtml = fs.readFileSync(mainLayoutPath, 'utf8');

// The new SVG logo
const newLogoSvg = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" class="text-indigo-600" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>`;

mainLayoutHtml = mainLayoutHtml.replace(
    '<div class="logo-icon shadow-sm"></div>',
    `<div class="logo-icon shadow-sm" style="background: none; border-radius: 0; box-shadow: none; display: flex; align-items: center; justify-content: center; height: auto; width: auto;">${newLogoSvg}</div>`
);

// Insert dark mode toggle next to notification button
const toggleBtn = `
  <button class="icon-btn relative" (click)="toggleTheme(); $event.stopPropagation()" title="Toggle Dark/Light Mode">
    <svg *ngIf="isDarkMode" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
    <svg *ngIf="!isDarkMode" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
  </button>
`;

mainLayoutHtml = mainLayoutHtml.replace(
    '<button class="icon-btn relative" (click)="toggleNotifications(); $event.stopPropagation()">',
    `${toggleBtn}\n          <button class="icon-btn relative" (click)="toggleNotifications(); $event.stopPropagation()">`
);

fs.writeFileSync(mainLayoutPath, mainLayoutHtml);

// 2. Update MainLayout ts for Theme Toggle
const mainLayoutTsPath = path.join(srcAppDir, 'layout', 'main-layout.ts');
let mainLayoutTs = fs.readFileSync(mainLayoutTsPath, 'utf8');

if (!mainLayoutTs.includes('isDarkMode')) {
    mainLayoutTs = mainLayoutTs.replace(
        'export class MainLayout {',
        `export class MainLayout {\n  isDarkMode = false;\n\n  ngOnInit() {\n    this.isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark';\n  }\n\n  toggleTheme() {\n    this.isDarkMode = !this.isDarkMode;\n    if (this.isDarkMode) document.documentElement.setAttribute('data-theme', 'dark');\n    else document.documentElement.removeAttribute('data-theme');\n    localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');\n  }\n`
    );
    // Add OnInit import
    mainLayoutTs = mainLayoutTs.replace("import { Component }", "import { Component, OnInit }");
    mainLayoutTs = mainLayoutTs.replace("export class MainLayout {", "export class MainLayout implements OnInit {");
    fs.writeFileSync(mainLayoutTsPath, mainLayoutTs);
}

// 3. Update Landing Page Logo
const landingHtmlPath = path.join(srcAppDir, 'pages/landing', 'landing.html');
if (fs.existsSync(landingHtmlPath)) {
    let landingHtml = fs.readFileSync(landingHtmlPath, 'utf8');
    landingHtml = landingHtml.replace('<span class="logo-icon">🚀</span>', `<span class="logo-icon" style="display:flex; align-items:center;">${newLogoSvg}</span>`);
    fs.writeFileSync(landingHtmlPath, landingHtml);
}

// 4. Update index.html or styles.css to load initial theme and provide dark mode CSS
const stylesPath = path.join(__dirname, 'projects', 'chatbox', 'src', 'styles.css');
let stylesCss = fs.readFileSync(stylesPath, 'utf8');

if (!stylesCss.includes('[data-theme="dark"]')) {
    stylesCss += `
/* Dark Mode Theme */
[data-theme="dark"] {
  --bg-primary: #121212;
  --bg-secondary: #0A0A0A;
  --bg-tertiary: #1E1E1E;
  
  --text-primary: #FAFAFA;
  --text-secondary: #A1A1AA;
  --text-muted: #71717A;
  
  --border-color: #27272A;
  --border-subtle: #18181B;

  --indigo-50: rgba(79, 70, 229, 0.1);
  --indigo-100: rgba(79, 70, 229, 0.2);
  --success-bg: rgba(16, 185, 129, 0.1);
  --warning-bg: rgba(245, 158, 11, 0.1);
  --danger-bg: rgba(239, 68, 68, 0.1);
}

/* Extra dark mode adjustments */
[data-theme="dark"] .bg-white, 
[data-theme="dark"] .bg-gray-50, 
[data-theme="dark"] .bg-indigo-50, 
[data-theme="dark"] .bg-success-bg,
[data-theme="dark"] .bg-warning-bg,
[data-theme="dark"] .bg-danger-bg {
  background-color: var(--bg-primary) !important;
}

[data-theme="dark"] table th {
  background-color: var(--bg-tertiary);
  color: var(--text-primary);
}

[data-theme="dark"] .badge-idea,
[data-theme="dark"] .badge-progress,
[data-theme="dark"] .badge-launched,
[data-theme="dark"] .badge-improving {
  background-color: var(--bg-tertiary);
  border-color: var(--border-color);
}
`;
    fs.writeFileSync(stylesPath, stylesCss);
}

// Add script to index.html to prevent flash of wrong theme
const indexHtmlPath = path.join(__dirname, 'projects', 'chatbox', 'src', 'index.html');
if (fs.existsSync(indexHtmlPath)) {
    let indexHtml = fs.readFileSync(indexHtmlPath, 'utf8');
    if (!indexHtml.includes('theme-check')) {
        const themeCheckScript = `
    <script id="theme-check">
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.setAttribute('data-theme', 'dark');
      }
    </script>
    `;
        indexHtml = indexHtml.replace('</head>', `${themeCheckScript}</head>`);
        fs.writeFileSync(indexHtmlPath, indexHtml);
    }
}

console.log('Dark mode and logo updated.');
