const axios = require('axios');
const fs = require('fs');
const path = require('path');
const logger = require('./logger');

async function uploadImage(accessToken, userId, imagePath) {
    try {
        // 1. Register Image Upload
        const registerRes = await axios.post('https://api.linkedin.com/v2/assets?action=registerUpload', {
            "registerUploadRequest": {
                "recipes": ["urn:li:digitalmediaRecipe:feedshare-image"],
                "owner": `urn:li:person:${userId}`,
                "serviceRelationships": [{
                    "relationshipType": "OWNER",
                    "identifier": "urn:li:userGeneratedContent"
                }]
            }
        }, { headers: { 'Authorization': `Bearer ${accessToken}`, 'X-Restli-Protocol-Version': '2.0.0' } });

        const uploadUrl = registerRes.data.value.uploadMechanism['com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest'].uploadUrl;
        const asset = registerRes.data.value.asset;

        logger.info(`Image registered. Asset: ${asset}`);

        // 2. Upload Image Binary
        const absolutePath = path.isAbsolute(imagePath) ? imagePath : path.resolve(__dirname, '../../', imagePath);

        if (!fs.existsSync(absolutePath)) {
            throw new Error(`Image file not found: ${absolutePath}`);
        }

        const imageContent = fs.readFileSync(absolutePath);
        await axios.put(uploadUrl, imageContent, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/octet-stream'
            }
        });

        logger.info('Image binary uploaded successfully.');
        return asset;
    } catch (error) {
        const errorMsg = error.response ? JSON.stringify(error.response.data) : error.message;
        logger.error(`Image Upload Error: ${errorMsg}`);
        throw new Error(`Image Upload Failed: ${errorMsg}`);
    }
}

module.exports = { uploadImage };
