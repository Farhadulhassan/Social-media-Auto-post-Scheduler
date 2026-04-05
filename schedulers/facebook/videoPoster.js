const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const logger = require('./logger');

async function uploadVideo(pageAccessToken, pageId, videoPath, description) {
    try {
        const absolutePath = path.isAbsolute(videoPath) ? videoPath : path.resolve(__dirname, '../../', videoPath);

        if (!fs.existsSync(absolutePath)) {
            throw new Error(`Facebook Video file not found: ${absolutePath}`);
        }

        const form = new FormData();
        form.append('source', fs.createReadStream(absolutePath));
        form.append('description', description || '');
        form.append('access_token', pageAccessToken);

        // Videos are posted to /videos endpoint
        const response = await axios.post(`https://graph.facebook.com/v18.0/${pageId}/videos`, form, {
            headers: form.getHeaders(),
            maxContentLength: Infinity,
            maxBodyLength: Infinity
        });

        logger.info(`Facebook Video uploaded/published. ID: ${response.data.id}`);
        return response.data.id;
    } catch (error) {
        const errorMsg = error.response ? JSON.stringify(error.response.data) : error.message;
        logger.error(`Facebook Video Upload Error: ${errorMsg}`);
        throw new Error(`Facebook Video Upload Failed: ${errorMsg}`);
    }
}

module.exports = { uploadVideo };
