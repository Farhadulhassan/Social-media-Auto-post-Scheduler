const fs = require('fs');

const CSV_PATH = 'linkedin_schedule.csv';
let content = fs.readFileSync(CSV_PATH, 'utf8');

// Fix 12/17 Post
const old17 = 'Pending,Failed,Manual Reset for Test. ID: urn:li:share:7407087405230428161,0';
const new17 = 'Pending,Posted,Successfully posted via API. ID: urn:li:share:7407087405230428161,0';

if (content.includes(old17)) {
    content = content.replace(old17, new17);
}

// Fix 12/18 Post (Restore Time and Status)
const old18_meta = '12/18/2025,3:30 PM';
const new18_meta = '12/18/2025,9:30 AM';
if (content.includes(old18_meta)) {
    content = content.replace(old18_meta, new18_meta);
}

const old18_status = 'Pending,Failed (Dry Run),Dry run enabled. No actual post made.,0';
const new18_status = 'Pending,Posted,Successfully posted via API. ID: urn:li:share:7407347007364816896,0';

if (content.includes(old18_status)) {
    content = content.replace(old18_status, new18_status);
}

fs.writeFileSync(CSV_PATH, content);
console.log('CSV Statuses Restored Successfully.');
