const { execSync } = require('child_process');

// Define components to generate
const componentsToGenerate = [
    // Analysis & Market
    'pages/analysis/business-idea-analysis',
    'pages/market/market-research',
    'pages/market/market-feedback',
    'pages/market/public-feedback',

    // Specialists
    'pages/specialists/specialist-recommendation',

    // Chat
    'pages/chatbot/ai-chatbot',
    'pages/chat/chat-conversation',

    // Reports
    'pages/reports/report-list',
    'pages/reports/report-details',

    // Help Center
    'pages/help/help-center',

    // Admin
    'pages/admin/admin-dashboard',
    'pages/admin/admin-users',
    'pages/admin/admin-projects',
    'pages/admin/admin-specialists',
    'pages/admin/admin-complaints',
    'pages/admin/admin-config',

    // UI Components Shared
    'components/sidebar',
    'components/navbar',
    'components/project-card',
    'components/score-card',
    'components/kpi-card',
    'components/chart-card',
    'components/data-table',
    'components/feedback-list',
    'components/specialist-card',
    'components/chat-window',
    'components/message-bubble',
    'components/report-card',
    'components/loading-spinner',
    'components/alert',
    'components/modal',
    'components/badge'
];

for (const comp of componentsToGenerate) {
    try {
        console.log(`Generating component: ${comp}...`);
        execSync(`npx ng g c ${comp} --project=chatbox --standalone=true --inline-style=false --inline-template=false -t -s --skip-tests=true`, { stdio: 'inherit' });
    } catch (error) {
        console.error(`Failed to generate ${comp}:`, error.message);
    }
}
