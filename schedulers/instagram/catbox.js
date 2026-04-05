const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const path = require('path');

/**
 * Uploads a file to Catbox.moe for temporary public hosting.
 * This is used to provide Instagram a direct URL to fetch local images/videos.
 */
async function uploadToCatbox(filePath) {
    try {
        if (!fs.existsSync(filePath)) {
            throw new Error(`File not found for Catbox upload: ${filePath}`);
        }

        const form = new FormData();
        form.append('reqtype', 'fileupload');
        form.append('fileToUpload', fs.createReadStream(filePath));

        const response = await axios.post('https://catbox.moe/user/api.php', form, {
            headers: form.getHeaders(),
            timeout: 60000 // 60s timeout for large videos
        });

        if (typeof response.data === 'string' && response.data.startsWith('https://')) {
            return response.data;
        } else {
            throw new Error(`Catbox upload failed: ${response.data}`);
        }
    } catch (error) {
        console.error(`[Catbox] Upload error: ${error.message}`);
        throw error;
    }
}

module.exports = { uploadToCatbox };
