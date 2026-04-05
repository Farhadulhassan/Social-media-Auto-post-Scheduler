const axios = require('axios');
require('dotenv').config();

async function checkIG() {
    const token = process.env.INSTAGRAM_ACCESS_TOKEN || process.env.FB_PAGE_ACCESS_TOKEN;
    const igId = process.env.INSTAGRAM_BUSINESS_ID;

    console.log('--- Instagram Verification ---');
    console.log('Using ID:', igId);

    try {
        // 1. Check if ID exists and get basic info
        const res = await axios.get(`https://graph.facebook.com/v18.0/${igId}`, {
            params: {
                fields: 'name,username,website',
                access_token: token
            }
        });
        console.log('Account found:', res.data.name, `(@${res.data.username})`);

        // 2. Check permissions
        const perms = await axios.get(`https://graph.facebook.com/v18.0/me/permissions`, {
            params: { access_token: token }
        });
        const granted = perms.data.data.filter(p => p.status === 'granted').map(p => p.permission);
        console.log('Granted Permissions:', granted.join(', '));

        if (granted.includes('instagram_content_publish')) {
            console.log('✅ Success: Post permission is active!');
        } else {
            console.log('❌ Warning: instagram_content_publish permission is missing!');
        }

    } catch (e) {
        console.error('Error:', e.response ? JSON.stringify(e.response.data) : e.message);
    }
}

checkIG();
