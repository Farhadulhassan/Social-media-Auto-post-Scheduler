const axios = require('axios');
const path = require('path');
const logger = require('./logger');
const config = require('./config');
const { uploadToCatbox } = require('./catbox');



async function createImageContainer(accessToken, instagramId, mediaPath, caption) {
    try {
        // Construct the public URL for the image
        // In local development, you'll need something like ngrok to expose localhost
        const fileName = path.basename(mediaPath);
        let imageUrl;

        if (mediaPath.startsWith('http')) {
            imageUrl = mediaPath;
        } else {
            // Use Catbox to host the local image for Instagram
            logger.info(`Uploading image to Catbox: ${fileName}`);
            imageUrl = await uploadToCatbox(mediaPath);
            logger.info(`Catbox URL: ${imageUrl}`);
        }


        logger.info(`Creating Instagram Image container for: ${fileName}`);

        const response = await axios.post(`https://graph.facebook.com/v18.0/${instagramId}/media`, null, {
            params: {
                image_url: imageUrl,
                caption: caption || '',
                access_token: accessToken
            }
        });

        const creationId = response.data.id;
        logger.info(`Instagram Image container created. ID: ${creationId}`);
        return creationId;
    } catch (error) {
        const errorMsg = error.response ? JSON.stringify(error.response.data) : error.message;
        logger.error(`Instagram Image Container Error: ${errorMsg}`);
        throw new Error(`Instagram Image Container Failed: ${errorMsg}`);
    }
}

module.exports = { createImageContainer };
