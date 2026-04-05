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

/**
 * Acquire a file-based lock to prevent concurrent runs
 */
function acquireLock() {
    try {
        if (fs.existsSync(LOCK_FILE)) {
            const stats = fs.statSync(LOCK_FILE);
            // If lock is older than 30 mins, assume it's stale and delete it
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

/**
 * Release the lock
 */
function releaseLock() {
    try {
        if (fs.existsSync(LOCK_FILE)) {
            fs.unlinkSync(LOCK_FILE);
        }
    } catch (err) { }
}

/**
 * Detect media type based on file extension
 */
function getMediaType(filePath) {
    if (!filePath) return 'NONE';
    const ext = path.extname(filePath).toLowerCase();
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
    const videoExtensions = ['.mp4', '.mov', '.avi', '.mkv', '.webm'];

    if (imageExtensions.includes(ext)) return 'IMAGE';
    if (videoExtensions.includes(ext)) return 'VIDEO';
    return 'NONE';
}

/**
 * Safety checks for a post record
 */
function validateRecord(record) {
    if (!record.Date || !record.Time || !record['Post Title']) {
        return { valid: false, error: 'Missing core fields (Date, Time, or Title)' };
    }

    if (record['Image Path OR Image URL']) {
        const mediaPath = record['Image Path OR Image URL'];
        if (!mediaPath.startsWith('http')) {
            const absolutePath = path.isAbsolute(mediaPath) ? mediaPath : path.resolve(__dirname, '../../', mediaPath);
            if (!fs.existsSync(absolutePath)) {
                return { valid: false, error: `Media file not found: ${mediaPath}` };
            }
        }
    }

    return { valid: true };
}

/**
 * Single post execution
 */
async function processPost(record, index) {
    const postData = {
        title: record['Post Title'],
        caption: record['Post Caption'],
        hashtags: record['Hashtags'],
        mediaPath: record['Image Path OR Image URL']
    };

    const accessToken = process.env.LINKEDIN_ACCESS_TOKEN;
    if (!accessToken) {
        return { success: false, status: 'Failed', message: 'Missing LINKEDIN_ACCESS_TOKEN' };
    }

    if (config.DRY_RUN) {
        return { success: true, status: 'Posted (Dry Run)', message: 'Dry run enabled. No actual post made.' };
    }

    try {
        // 1. Get User Profile ID
        const profileRes = await axios.get('https://api.linkedin.com/v2/userinfo', {
            headers: { 'Authorization': `Bearer ${accessToken}` }
        });
        const userId = profileRes.data.sub;

        const mediaType = getMediaType(postData.mediaPath);
        let mediaAsset = null;

        if (mediaType === 'IMAGE') {
            mediaAsset = await uploadImage(accessToken, userId, postData.mediaPath);
        } else if (mediaType === 'VIDEO') {
            mediaAsset = await uploadVideo(accessToken, userId, postData.mediaPath);
        }

        // 2. Create Post
        const postPayload = {
            "author": `urn:li:person:${userId}`,
            "lifecycleState": "PUBLISHED",
            "specificContent": {
                "com.linkedin.ugc.ShareContent": {
                    "shareCommentary": {
                        "text": `${postData.title}\n\n${postData.caption}\n\n${postData.hashtags || ''}`
                    },
                    "shareMediaCategory": mediaType === 'NONE' ? 'NONE' : mediaType,
                }
            },
            "visibility": {
                "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"
            }
        };

        if (mediaAsset) {
            postPayload.specificContent["com.linkedin.ugc.ShareContent"].media = [{
                "status": "READY",
                "description": { "text": postData.title },
                "media": mediaAsset,
                "title": { "text": postData.title }
            }];
        }

        const postRes = await axios.post('https://api.linkedin.com/v2/ugcPosts', postPayload, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'X-Restli-Protocol-Version': '2.0.0'
            }
        });

        return {
            success: true,
            status: 'Posted',
            message: `Successfully posted. ID: ${postRes.data.id}`
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

/**
 * Main loop
 */
async function runLinkedInScheduler() {
    if (!acquireLock()) {
        console.log('[LinkedIn] Scheduler is already running. Skipping this execution.');
        return;
    }

    try {
        logger.info('Running LinkedIn Scheduler...');
        const records = readCSV();
        if (!records.length) {
            releaseLock();
            return;
        }

        const now = new Date();
        let updated = false;

        for (let i = 0; i < records.length; i++) {
            const record = records[i];

            // Only process LinkedIn platform records
            if (record.Platform !== 'LinkedIn') continue;

            const status = record['Post Status'];

            // Skip already posted
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

                    // Safety check
                    const validation = validateRecord(record);
                    if (!validation.valid) {
                        logger.error(`Post validation failed for row ${i + 1}: ${validation.error}`, {
                            title: record['Post Title'],
                            index: i
                        });
                        record['Post Status'] = 'Failed';
                        record['Log / Error Message'] = `Validation Error: ${validation.error}`;
                        updated = true;
                        continue;
                    }

                    logger.info(`Attempting post: "${record['Post Title']}" (Attempt ${retryCount + 1})`, {
                        id: record['Post Title'],
                        media: record['Image Path OR Image URL']
                    });

                    const result = await processPost(record, i);

                    if (!result.success) {
                        record['Retry Count'] = (retryCount + 1).toString();
                        logger.warn(`Post failed: ${result.message}`, { title: record['Post Title'], attempt: record['Retry Count'] });
                    } else {
                        logger.success(`Post successful!`, { title: record['Post Title'] });
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

        logger.info('Scheduler run complete.');
    } catch (err) {
        logger.error(`Fatal scheduler error: ${err.message}`, { stack: err.stack });
    } finally {
        releaseLock();
    }
}

if (require.main === module) {
    runLinkedInScheduler().catch(err => {
        console.error('Fatal execution error:', err);
    });
}

module.exports = { runLinkedInScheduler, processPost };

