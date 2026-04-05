const axios = require('axios');

const url = `https://lto-phones-judge.loca.lt/static/images/day1.png`;

async function test() {
    console.log(`Testing URL: ${url}`);
    try {
        const response = await axios.get(url, { timeout: 10000 });
        console.log(`✅ Success! Status: ${response.status}`);
        console.log(`Content-Type: ${response.headers['content-type']}`);
        if (response.headers['content-type'].includes('html')) {
            console.log('⚠️ Warning: Received HTML instead of image. Tunnel might have a landing page.');
        }
    } catch (error) {
        console.log(`❌ Failed! Status: ${error.response ? error.response.status : error.message}`);
    }
}
test();
