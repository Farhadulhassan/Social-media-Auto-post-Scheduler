const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const logger = require('./logger');

async function uploadImage(pageAccessToken, pageId, imagePath, caption) {
    try {
        const absolutePath = path.isAbsolute(imagePath) ? imagePath : path.resolve(__dirname, '../../', imagePath);

        if (!fs.existsSync(absolutePath)) {
            throw new Error(`Facebook Image file not found: ${absolutePath}`);
        }

        const form = new FormData();
        form.append('source', fs.createReadStream(absolutePath));
        form.append('caption', caption || '');
        form.append('access_token', pageAccessToken);

        const response = await axios.post(`https://graph.facebook.com/v18.0/${pageId}/photos`, form, {
            headers: form.getHeaders()
        });

        logger.info(`Facebook Image uploaded. ID: ${response.data.id}`);
        return response.data.id;
    } catch (error) {
        const errorMsg = error.response ? JSON.stringify(error.response.data) : error.message;
        logger.error(`Facebook Image Upload Error: ${errorMsg}`);
        throw new Error(`Facebook Image Upload Failed: ${errorMsg}`);
    }
}

module.exports = { uploadImage };
