const axios = require('axios');
const fs = require('fs');
require('dotenv').config();

const FB_PAGE_ID = process.env.FB_PAGE_ID;
const FB_PAGE_ACCESS_TOKEN = process.env.FB_PAGE_ACCESS_TOKEN;
const IG_BUSINESS_ID = process.env.INSTAGRAM_BUSINESS_ID;
const SERVER_BASE_URL = process.env.SERVER_BASE_URL;

async function verify() {
    let output = '--- Social Media Verification ---\n\n';

    // 1. Verify Facebook Token
    output += '[1/3] Verifying Facebook Page Access Token...\n';
    try {
        const fbResponse = await axios.get(`https://graph.facebook.com/v18.0/${FB_PAGE_ID}`, {
            params: {
                fields: 'name,access_token',
                access_token: FB_PAGE_ACCESS_TOKEN
            }
        });
        output += `✅ Facebook Page Found: ${fbResponse.data.name}\n`;
    } catch (error) {
        output += `❌ Facebook Token Error: ${error.response ? JSON.stringify(error.response.data) : error.message}\n`;
    }

    // 2. Verify Instagram Business ID
    output += '\n[2/3] Verifying Instagram Business Account...\n';
    try {
        const igResponse = await axios.get(`https://graph.facebook.com/v18.0/${IG_BUSINESS_ID}`, {
            params: {
                fields: 'username,name',
                access_token: FB_PAGE_ACCESS_TOKEN
            }
        });
        output += `✅ Instagram Account Found: ${igResponse.data.username} (${igResponse.data.name})\n`;
    } catch (error) {
        output += `❌ Instagram Error: ${error.response ? JSON.stringify(error.response.data) : error.message}\n`;
    }

    // 3. Verify ngrok / Server Connectivity
    output += '\n[3/3] Verifying SERVER_BASE_URL Accessibility...\n';
    if (!SERVER_BASE_URL) {
        output += '❌ SERVER_BASE_URL is not defined in .env\n';
    } else {
        try {
            const testUrl = `${SERVER_BASE_URL}/static/images/day1.png`;
            const serverResponse = await axios.get(testUrl, { timeout: 5000 });
            output += `✅ ngrok URL reachable: ${SERVER_BASE_URL}\n`;
            output += `✅ Test image found: ${testUrl}\n`;
        } catch (error) {
            output += `❌ ngrok/Server Error: ${error.message}\n`;
            output += `   Make sure your server is running and ngrok is pointing to the correct port.\n`;
        }
    }

    console.log(output);
    fs.writeFileSync('verify_results.txt', output);
}

verify();
