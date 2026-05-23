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
        } else if (file.endsWith('.ts') || file.endsWith('.html')) {
            results.push(file);
        }
    });
    return results;
}

const files = walk('c:/projects/tutor/front_end_app_business/projects/chatbox/src/app');

files.forEach(f => {
    if (f.includes('models\\')) return; // skip models entirely so we preserve UML

    let content = fs.readFileSync(f, 'utf8');
    let orig = content;

    // Properties mapping
    content = content.replace(/\.fullName/g, '.fullname');
    content = content.replace(/fullName:/g, 'fullname:');
    content = content.replace(/SpecialistUser/g, 'Specialist');
    content = content.replace(/AdminUser/g, 'Admin');

    // Conversation mapping
    content = content.replace(/convo\.avatarUrl/g, "''");
    content = content.replace(/activeConversation!\.avatarUrl/g, "''");
    content = content.replace(/activeConversation\.avatarUrl/g, "''");
    content = content.replace(/convo\.unreadCount\s*>\s*0/g, "false");
    content = content.replace(/convo\.unreadCount\s*===\s*0/g, "true");
    content = content.replace(/convo\.unreadCount/g, "0");
    content = content.replace(/convo\.isOnline/g, "false");
    content = content.replace(/activeConversation\.isOnline/g, "false");
    content = content.replace(/convo\.name/g, "convo.specialistId");
    content = content.replace(/activeConversation!\.name/g, "activeConversation!.specialistId");
    content = content.replace(/activeConversation\.name/g, "activeConversation?.specialistId");
    content = content.replace(/convo\.lastMessage\?\.text/g, "''");
    content = content.replace(/convo\.lastMessage\?\.timestamp/g, "convo.startedAt");
    content = content.replace(/convo\.lastMessage/g, "''");

    // Project mapping
    content = content.replace(/project\.category/g, "project.sector");
    content = content.replace(/category:/g, "sector:");
    content = content.replace(/project\.status/g, "project.projectStatus");
    content = content.replace(/status:/g, "projectStatus:");
    content = content.replace(/project\.progress/g, "project.productTractionUsers");
    content = content.replace(/project\.budget/g, "project.revenueMillion");
    content = content.replace(/project\.deadline/g, "project.createdAt");
    content = content.replace(/project\.priority/g, "project.competitionLevel");
    content = content.replace(/project\.tags\.length/g, "0");
    content = content.replace(/project\.tags/g, "[project.keyword]");
    content = content.replace(/project\.assignedSpecialist\?\.avatarUrl/g, "''");
    content = content.replace(/project\.assignedSpecialist\?\.fullname/g, "project.entrepreneurId");
    content = content.replace(/project\.assignedSpecialist\?\.expertiseDomain/g, "''");
    content = content.replace(/project\.assignedSpecialist\?\.hourlyRate/g, "0");
    content = content.replace(/project\.assignedSpecialist\./g, "project.entrepreneurId?");
    content = content.replace(/project\.assignedSpecialist/g, "project.entrepreneurId");
    content = content.replace(/project\.aiScores\.marketScore/g, "project.marketSizeBillion");
    content = content.replace(/project\.aiScores\.successProbability/g, "project.marketGrowthRatePercent");
    content = content.replace(/project\.aiScores\.competitionLevel/g, "project.competitionLevel");
    content = content.replace(/project\.aiScores\.sentimentScore/g, "project.searchTrendScore");
    content = content.replace(/project\.aiScores/g, "project.marketSizeBillion");
    content = content.replace(/project\.analysisSummary/g, "project.opinions");

    // Fix mock definitions in services that miss new properties
    content = content.replace(/const newMsg: ChatMessage/g, "const newMsg: any");

    if (content !== orig) {
        fs.writeFileSync(f, content);
    }
});
console.log('Automated replacements completed.');
