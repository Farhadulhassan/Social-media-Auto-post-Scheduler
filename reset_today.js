const fs = require('fs');
let content = fs.readFileSync('linkedin_schedule.csv', 'utf8');

// Change date/time to be current-ish (15:30 PM)
content = content.replace('12/18/2025,9:30 AM', '12/18/2025,3:30 PM');
// Ensure status is Failed
content = content.replace('Pending,Posted', 'Pending,Failed');
content = content.replace('Successfully posted via API', 'Test Failure');

fs.writeFileSync('linkedin_schedule.csv', content);
console.log('Updated 12/18 post to 3:30 PM and Failed status.');
