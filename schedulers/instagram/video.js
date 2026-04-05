const axios = require('axios');
const path = require('path');
const logger = require('./logger');
const config = require('./config');
const { uploadToCatbox } = require('./catbox');



async function createVideoContainer(accessToken, instagramId, mediaPath, caption) {
    try {
        const fileName = path.basename(mediaPath);
        let videoUrl;

        if (mediaPath.startsWith('http')) {
            videoUrl = mediaPath;
        } else {
            // Use Catbox to host the local video for Instagram
            logger.info(`Uploading video to Catbox: ${fileName}`);
            videoUrl = await uploadToCatbox(mediaPath);
            logger.info(`Catbox URL: ${videoUrl}`);
        }


        logger.info(`Creating Instagram Video (Reel) container for: ${fileName}`);

        const response = await axios.post(`https://graph.facebook.com/v18.0/${instagramId}/media`, null, {
            params: {
                media_type: 'REELS',
                video_url: videoUrl,
                caption: caption || '',
                access_token: accessToken
            }
        });

        const creationId = response.data.id;
        logger.info(`Instagram Video container created. ID: ${creationId}. Waiting for processing...`);

        // Wait for video processing (Poll status)
        await waitForVideoProcessing(accessToken, creationId);

        return creationId;
    } catch (error) {
        const errorMsg = error.response ? JSON.stringify(error.response.data) : error.message;
        logger.error(`Instagram Video Container Error: ${errorMsg}`);
        throw new Error(`Instagram Video Container Failed: ${errorMsg}`);
    }
}

async function waitForVideoProcessing(accessToken, creationId) {
    const maxRetries = 10;
    const delay = 10000; // 10 seconds

    for (let i = 0; i < maxRetries; i++) {
        const response = await axios.get(`https://graph.facebook.com/v18.0/${creationId}`, {
            params: {
                fields: 'status_code',
                access_token: accessToken
            }
        });

        const status = response.data.status_code;
        if (status === 'FINISHED') {
            logger.info('Instagram Video processing finished.');
            return;
        } else if (status === 'ERROR') {
            throw new Error('Instagram Video processing failed.');
        }

        logger.info(`Video status: ${status}. Retrying in ${delay / 1000}s... (${i + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
    }

    throw new Error('Instagram Video processing timed out.');
}

module.exports = { createVideoContainer };
