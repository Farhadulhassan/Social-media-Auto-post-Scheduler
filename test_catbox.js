const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const path = require('path');

async function uploadToCatbox(filePath) {
    try {
        const form = new FormData();
        form.append('reqtype', 'fileupload');
        form.append('fileToUpload', fs.createReadStream(filePath));

        const response = await axios.post('https://catbox.moe/user/api.php', form, {
            headers: form.getHeaders()
        });

        return response.data; // This is the URL
    } catch (error) {
        console.error('Catbox upload failed:', error.message);
        return null;
    }
}

// Test with day1.png
const testFile = 'E:\\Linkdin post\\day1.png';
uploadToCatbox(testFile).then(url => {
    console.log('Uploaded URL:', url);
});
