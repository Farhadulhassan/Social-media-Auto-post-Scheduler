const fs = require('fs');
let content = fs.readFileSync('linkedin_schedule.csv', 'utf8');

// Revert 12/18 post
content = content.replace('12/18/2025,3:30 PM', '12/18/2025,9:30 AM');
content = content.replace('Pending,Failed (Dry Run)', 'Pending,Posted');
content = content.replace('Dry run enabled. No actual post made.', 'Successfully posted via API');
content = content.replace('Test Reset', 'Successfully posted via API'); // in case it was there

fs.writeFileSync('linkedin_schedule.csv', content);
console.log('CSV restored.');
