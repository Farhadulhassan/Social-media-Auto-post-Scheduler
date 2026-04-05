const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const connectDB = require('./config/db');
require('./models/User');
require('./models/Scheduler');

const restore = async () => {
    try {
        await connectDB();
        const User = mongoose.model('User');
        const Scheduler = mongoose.model('Scheduler');

        // 1. Get Admin
        const admin = await User.findOne({ email: 'admin@admin.com' });
        if (!admin) {
            console.error('Admin user not found!');
            process.exit(1);
        }

        const schedulersData = [
            {
                name: 'Facebook Page Scheduler',
                platform: 'Facebook',
                platformId: process.env.FB_PAGE_ID || '860404523831930',
                accessToken: process.env.FB_PAGE_ACCESS_TOKEN,
                status: 'ACTIVE',
                owner: admin._id
            },
            {
                name: 'Instagram Business Scheduler',
                platform: 'Instagram',
                platformId: process.env.INSTAGRAM_BUSINESS_ID || '17841479654935411',
                accessToken: process.env.INSTAGRAM_ACCESS_TOKEN,
                status: 'ACTIVE',
                owner: admin._id
            },
            {
                name: 'LinkedIn Profile Scheduler',
                platform: 'LinkedIn',
                platformId: 'LINKEDIN_ME',
                accessToken: process.env.LINKEDIN_ACCESS_TOKEN,
                status: 'ACTIVE',
                owner: admin._id
            }
        ];

        console.log('Restoring schedulers...');
        for (const data of schedulersData) {
            const existing = await Scheduler.findOne({ platform: data.platform, owner: admin._id });
            if (!existing) {
                await Scheduler.create(data);
                console.log(`Created ${data.platform} scheduler.`);
            } else {
                console.log(`${data.platform} scheduler already exists.`);
            }
        }

        console.log('Restore complete!');
        process.exit();
    } catch (error) {
        console.error('Restore failed:', error);
        process.exit(1);
    }
};

restore();
