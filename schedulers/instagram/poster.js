const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config();
const config = require('./config');
const { readCSV, updateCSV } = require('./csvReader');
const { createImageContainer } = require('./image.js');
const { createVideoContainer } = require('./video.js');
const logger = require('./logger');

const LOCK_FILE = path.resolve(__dirname, config.LOCK_FILE);

function acquireLock() {
    try {
        if (fs.existsSync(LOCK_FILE)) {
            const stats = fs.statSync(LOCK_FILE);
            if (Date.now() - stats.mtimeMs > 30 * 60 * 1000) {
                fs.unlinkSync(LOCK_FILE);
            } else {
                return false;
            }
        }
        fs.writeFileSync(LOCK_FILE, process.pid.toString());
        return true;
    } catch (err) { return false; }
}

function releaseLock() {
    try { if (fs.existsSync(LOCK_FILE)) fs.unlinkSync(LOCK_FILE); } catch (err) { }
}

async function publishMedia(accessToken, instagramId, creationId) {
    const maxRetries = 3;
    const delay = 5000; // 5 seconds

    for (let i = 0; i < maxRetries; i++) {
        try {
            const response = await axios.post(`https://graph.facebook.com/v18.0/${instagramId}/media_publish`, null, {
                params: {
                    creation_id: creationId,
                    access_token: accessToken
                }
            });
            return response.data.id;
        } catch (error) {
            const errorData = error.response ? error.response.data : {};
            const isTransient = errorData.error && errorData.error.code === 9007; // Media not ready

            if (isTransient && i < maxRetries - 1) {
                logger.info(`Instagram media not ready. Retrying in ${delay / 1000}s... (${i + 1}/${maxRetries})`);
                await new Promise(resolve => setTimeout(resolve, delay));
                continue;
            }

            const errorMsg = error.response ? JSON.stringify(error.response.data) : error.message;
            throw new Error(`Instagram Publish Failed: ${errorMsg}`);
        }
    }
}

async function runInstagramScheduler() {
    if (!acquireLock()) {
        console.log('[Instagram] Scheduler already running.');
        return;
    }

    try {
        logger.info('Starting Instagram Scheduler run...');
        const records = readCSV();
        if (!records.length) { releaseLock(); return; }

        const now = new Date();
        const accessToken = config.FACEBOOK_PAGE_ACCESS_TOKEN;
        const instagramId = config.INSTAGRAM_BUSINESS_ID;

        if (!accessToken || !instagramId) {
            logger.error('Missing Instagram credentials in .env');
            releaseLock();
            return;
        }

        let updated = false;

        for (let i = 0; i < records.length; i++) {
            const record = records[i];
            if (record.Platform !== 'Instagram') continue;

            const status = record['Post Status'];
            if (status === 'Posted' || status.startsWith('Posted')) continue;

            const scheduledTime = new Date(`${record.Date} ${record.Time}`);
            const diffMinutes = (now - scheduledTime) / (1000 * 60);

            // POST SELECTION CRITERIA:
            // 1. Time is past (diffMinutes >= 0)
            // 2. If PENDING: Allow ANY time today (Catch-up)
            // 3. If FAILED: Enforce strict window (Retry Limit)

            const isPendingDue = status === 'Pending' && diffMinutes >= 0;
            const isFailedRetry = status === 'Failed' && diffMinutes >= 0 && diffMinutes <= config.TIME_WINDOW_MINUTES;

            if (isPendingDue || isFailedRetry) {
                const retryCount = parseInt(record['Retry Count'] || '0');

                if (status === 'Pending' || (status === 'Failed' && retryCount < config.RETRY_LIMIT)) {
                    try {
                        logger.info(`Attempting Instagram post: "${record['Post Title']}" (Type: ${record['Media Type']})`);

                        let creationId;
                        const caption = `${record['Post Title']}\n\n${record['Post Caption']}\n\n${record['Hashtags'] || ''}`;
                        const mediaPath = record['Image Path OR Image URL'];

                        if (record['Media Type'] === 'video') {
                            creationId = await createVideoContainer(accessToken, instagramId, mediaPath, caption);
                        } else {
                            creationId = await createImageContainer(accessToken, instagramId, mediaPath, caption);
                        }

                        const postId = await publishMedia(accessToken, instagramId, creationId);

                        record['Post Status'] = 'Posted';
                        record['Log / Error Message'] = `Successfully posted. ID: ${postId}`;
                        logger.success(`Post successful! ID: ${postId}`, { title: record['Post Title'] });

                    } catch (err) {
                        record['Post Status'] = 'Failed';
                        record['Log / Error Message'] = err.message;
                        record['Retry Count'] = (retryCount + 1).toString();
                        logger.error(`Post failed: ${err.message}`, { title: record['Post Title'] });
                    }
                    updated = true;
                }
            }
        }

        if (updated) updateCSV(records);
        logger.info('Instagram Scheduler run complete.');
    } catch (err) {
        logger.error(`Fatal Error: ${err.message}`);
    } finally {
        releaseLock();
    }
}

if (require.main === module) {
    runInstagramScheduler().catch(err => console.error(err));
}

module.exports = { runInstagramScheduler };
