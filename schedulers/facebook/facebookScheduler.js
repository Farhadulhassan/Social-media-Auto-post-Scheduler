const axios = require('axios');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const { readCSV, updateCSV } = require('./csvReader');
const { uploadImage } = require('./imagePoster');
const { uploadVideo } = require('./videoPoster');
const logger = require('./logger');
const config = require('./config');

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
    } catch (err) {
        return false;
    }
}

function releaseLock() {
    try {
        if (fs.existsSync(LOCK_FILE)) {
            fs.unlinkSync(LOCK_FILE);
        }
    } catch (err) { }
}

function getMediaType(filePath) {
    if (!filePath) return 'NONE';
    const ext = path.extname(filePath).toLowerCase();
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
    const videoExtensions = ['.mp4', '.mov', '.avi', '.mkv', '.webm'];

    if (imageExtensions.includes(ext)) return 'IMAGE';
    if (videoExtensions.includes(ext)) return 'VIDEO';
    return 'NONE';
}

async function processFBPost(record) {
    const pageId = config.FACEBOOK_PAGE_ID;
    const pageAccessToken = config.FACEBOOK_PAGE_ACCESS_TOKEN;

    if (!pageId || !pageAccessToken) {
        return { success: false, status: 'Failed', message: 'Missing FB_PAGE_ID or FB_PAGE_ACCESS_TOKEN' };
    }

    const caption = `${record['Post Title']}\n\n${record['Post Caption']}\n\n${record['Hashtags'] || ''}`;
    const mediaPath = record['Image Path OR Image URL'];
    const mediaType = getMediaType(mediaPath);

    if (config.DRY_RUN) {
        return { success: true, status: 'Posted (Dry Run)', message: 'Dry run enabled.' };
    }

    try {
        let fbPostId;

        if (mediaType === 'IMAGE') {
            fbPostId = await uploadImage(pageAccessToken, pageId, mediaPath, caption);
        } else if (mediaType === 'VIDEO') {
            fbPostId = await uploadVideo(pageAccessToken, pageId, mediaPath, caption);
        } else {
            // Text-only post
            const response = await axios.post(`https://graph.facebook.com/v18.0/${pageId}/feed`, {
                message: caption,
                access_token: pageAccessToken
            });
            fbPostId = response.data.id;
        }

        return {
            success: true,
            status: 'Posted',
            message: `Successfully posted to FB. ID: ${fbPostId}`
        };
    } catch (error) {
        const errorMsg = error.response ? JSON.stringify(error.response.data) : error.message;
        return {
            success: false,
            status: 'Failed',
            message: errorMsg
        };
    }
}

async function runFacebookScheduler() {
    if (!acquireLock()) {
        console.log('[Facebook] Scheduler already running.');
        return;
    }

    try {
        logger.info('Starting Facebook Scheduler run...');
        const records = readCSV();

        if (!records.length) {
            releaseLock();
            return;
        }

        const now = new Date();
        let updated = false;

        for (let i = 0; i < records.length; i++) {
            const record = records[i];

            // Only process Facebook platform records
            if (record.Platform !== 'Facebook') continue;

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

                    logger.info(`Attempting Facebook post: "${record['Post Title']}" (Attempt ${retryCount + 1})`);

                    const result = await processFBPost(record);

                    if (!result.success) {
                        record['Retry Count'] = (retryCount + 1).toString();
                        logger.error(`FB Post failed: ${result.message}`, { title: record['Post Title'] });
                    } else {
                        logger.success(`FB Post successful!`, { title: record['Post Title'] });
                    }

                    record['Post Status'] = result.status;
                    record['Log / Error Message'] = result.message;
                    updated = true;
                }
            }
        }

        if (updated) {
            updateCSV(records);
        }
        logger.info('Facebook Scheduler run complete.');
    } catch (err) {
        logger.error(`Fatal FB scheduler error: ${err.message}`);
    } finally {
        releaseLock();
    }
}

if (require.main === module) {
    runFacebookScheduler();
}

module.exports = { runFacebookScheduler, processFBPost };

