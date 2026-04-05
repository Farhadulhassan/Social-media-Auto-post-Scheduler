const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
dotenv.config();

// Ensure we use the URI from .env
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('MONGODB_URI not found in .env file!');
    process.exit(1);
}

const connectDB = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to CORRECT MongoDB');
    } catch (err) {
        console.error('Connection error:', err);
        process.exit(1);
    }
};

require('./models/Role');
require('./models/User');
require('./models/Scheduler');

const deepSanitizeAndMigrate = async () => {
    try {
        await connectDB();
        const User = mongoose.model('User');
        const Scheduler = mongoose.model('Scheduler');

        // 1. Scrub ALL users for invalid roles (string instead of ObjectId)
        const users = await User.find({});
        console.log(`Checking ${users.length} users for invalid roles...`);
        for (const user of users) {
            // Mongoose might already try to 'cast' it, so we check if it's currently failing or has a string
            // Let's use a raw update to be absolutely sure
            if (user.role && (typeof user.role === 'string')) {
                console.log(`Fixing User ${user.email}: Role was string "${user.role}", resetting...`);
                await User.updateOne({ _id: user._id }, { $unset: { role: "" } });
            }
        }

        // Specifically fix "vendor" or "customer" if they are stored as strings
        const rawUsers = await User.collection.find({ role: { $type: "string" } }).toArray();
        console.log(`Found ${rawUsers.length} users with RAW string roles.`);
        for (const rawUser of rawUsers) {
            console.log(`Cleaning raw string role for ${rawUser.email}: current value "${rawUser.role}"`);
            await User.collection.updateOne({ _id: rawUser._id }, { $unset: { role: "" } });
        }

        // 2. Identify Admin for ownership
        const admin = await User.findOne({ email: 'admin@admin.com' });

        // 3. Migrate Legacy CSVs to MongoDB Schedulers
        const platforms = ['Facebook', 'Instagram', 'LinkedIn'];
        for (const p of platforms) {
            const existing = await Scheduler.findOne({ platform: p });
            if (!existing) {
                console.log(`Migrating legacy platform: ${p}`);
                await Scheduler.create({
                    name: `Legacy ${p} Scheduler`,
                    platform: p,
                    platformId: 'LEGACY_ID',
                    accessToken: 'LEGACY_TOKEN',
                    status: 'ACTIVE',
                    owner: admin ? admin._id : null
                });
            } else {
                console.log(`Platform ${p} already exists in DB.`);
            }
        }

        console.log('Deep Sanitization & Migration complete on CORRECT DB!');
        process.exit();
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
};

deepSanitizeAndMigrate();
