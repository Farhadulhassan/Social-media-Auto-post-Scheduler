const axios = require('axios');
const fs = require('fs');
const path = require('path');
const logger = require('./logger');

async function uploadVideo(accessToken, userId, videoPath) {
    try {
        // 1. Register Video Upload
        const registerRes = await axios.post('https://api.linkedin.com/v2/assets?action=registerUpload', {
            "registerUploadRequest": {
                "recipes": ["urn:li:digitalmediaRecipe:feedshare-video"],
                "owner": `urn:li:person:${userId}`,
                "serviceRelationships": [{
                    "relationshipType": "OWNER",
                    "identifier": "urn:li:userGeneratedContent"
                }]
            }
        }, { headers: { 'Authorization': `Bearer ${accessToken}`, 'X-Restli-Protocol-Version': '2.0.0' } });

        const uploadUrl = registerRes.data.value.uploadMechanism['com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest'].uploadUrl;
        const asset = registerRes.data.value.asset;

        logger.info(`Video registered. Asset: ${asset}`);

        // 2. Upload Video Binary
        const absolutePath = path.isAbsolute(videoPath) ? videoPath : path.resolve(__dirname, '../../', videoPath);

        if (!fs.existsSync(absolutePath)) {
            throw new Error(`Video file not found: ${absolutePath}`);
        }

        const videoContent = fs.readFileSync(absolutePath);

        // Videos are typically uploaded with 'application/octet-stream' or their specific mime type
        await axios.put(uploadUrl, videoContent, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/octet-stream'
            }
        });

        logger.info('Video binary uploaded successfully.');

        // 3. Wait for video to be READY (Processing can take time)
        // For simplicity in this script, we'll return the asset. 
        // If the post fails immediately, it might be because processing is still happening.
        // But for many small videos, they become READY quickly.

        return asset;
    } catch (error) {
        const errorMsg = error.response ? JSON.stringify(error.response.data) : error.message;
        logger.error(`Video Upload Error: ${errorMsg}`);
        throw new Error(`Video Upload Failed: ${errorMsg}`);
    }
}

module.exports = { uploadVideo };
