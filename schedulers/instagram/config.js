module.exports = {
    RETRY_LIMIT: 3,
    TIME_WINDOW_MINUTES: 60,
    DRY_RUN: false,
    LOCK_FILE: '../../.instagram_scheduler.lock',
    LOG_SUCCESS: '../../logs/instagram_success.log',
    LOG_ERROR: '../../logs/instagram_error.log',
    INSTAGRAM_BUSINESS_ID: process.env.INSTAGRAM_BUSINESS_ID,
    FACEBOOK_PAGE_ACCESS_TOKEN: process.env.INSTAGRAM_ACCESS_TOKEN || process.env.FB_PAGE_ACCESS_TOKEN,
    SERVER_BASE_URL: process.env.SERVER_BASE_URL || 'http://localhost:3000' // Use .env for ngrok/public URL
};
