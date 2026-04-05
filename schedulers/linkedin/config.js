module.exports = {
    RETRY_LIMIT: 3,
    TIME_WINDOW_MINUTES: 60, // How far back to look for missed posts
    DRY_RUN: false,
    LOCK_FILE: '../../.linkedin_scheduler.lock',
    LOG_SUCCESS: '../../logs/linkedin_success.log',
    LOG_ERROR: '../../logs/linkedin_error.log'
};
