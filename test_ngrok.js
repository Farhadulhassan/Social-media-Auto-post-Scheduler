const axios = require('axios');
require('dotenv').config();

const url = `${process.env.SERVER_BASE_URL}/static/images/day1.png`;

async function test() {
    console.log(`Testing URL: ${url}`);
    try {
        const response = await axios.get(url, {
            headers: { 'ngrok-skip-browser-warning': 'true' }
        });
        console.log(`✅ Success! Status: ${response.status}`);
        console.log(`Content-Type: ${response.headers['content-type']}`);
    } catch (error) {
        console.log(`❌ Failed! Status: ${error.response ? error.response.status : error.message}`);
        if (error.response && error.response.data) {
            console.log('Response data (truncated):', typeof error.response.data === 'string' ? error.response.data.substring(0, 200) : 'binary/object');
        }
    }
}
test();
