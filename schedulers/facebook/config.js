module.exports = {
    RETRY_LIMIT: 3,
    TIME_WINDOW_MINUTES: 60,
    DRY_RUN: false,
    LOCK_FILE: '../../.facebook_scheduler.lock',
    LOG_SUCCESS: '../../logs/facebook_success.log',
    LOG_ERROR: '../../logs/facebook_error.log',
    FACEBOOK_PAGE_ID: process.env.FB_PAGE_ID,
    FACEBOOK_PAGE_ACCESS_TOKEN: process.env.FB_PAGE_ACCESS_TOKEN
};
