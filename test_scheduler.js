// Force reload environment variables
delete require.cache[require.resolve('dotenv')];
require('dotenv').config({ override: true });

console.log('FB_PAGE_ACCESS_TOKEN (first 50 chars):', process.env.FB_PAGE_ACCESS_TOKEN?.substring(0, 50));
console.log('INSTAGRAM_ACCESS_TOKEN (first 50 chars):', process.env.INSTAGRAM_ACCESS_TOKEN?.substring(0, 50));
console.log('FB_PAGE_ID:', process.env.FB_PAGE_ID);
console.log('INSTAGRAM_BUSINESS_ID:', process.env.INSTAGRAM_BUSINESS_ID);

// Now run the scheduler
require('./automation/scheduler.js');
