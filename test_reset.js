const fs = require('fs');
const content = fs.readFileSync('linkedin_schedule.csv', 'utf8');
const lines = content.split('\n');
// Find today's post
const searchStr = '12/18/2025,9:30 AM,LinkedIn,Backend Logic,Node.js Single Threading: Feature or Bug?';
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(searchStr)) {
        // Find the line that typically ends the row after the status
        // Since CSV fields can have newlines, this is risky, but let's try a simple replace on the whole content
        break;
    }
}

// Safer: replace the status if found in context
const original = 'Pending,Posted,Successfully posted via API';
const replacement = 'Pending,Failed,Manual Reset for Test';
if (content.includes(original)) {
    fs.writeFileSync('linkedin_schedule.csv', content.replace(original, replacement));
    console.log('CSV updated for testing.');
} else {
    console.log('Target string not found.');
}
