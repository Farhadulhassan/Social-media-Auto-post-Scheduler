const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');
const dotenv = require('dotenv');

dotenv.config();
const connectDB = require('./config/db');
require('./models/User');
require('./models/Scheduler');
require('./models/Post');

async function importPlatformCsv(platformName, csvFilename) {
    const Scheduler = mongoose.model('Scheduler');
    const Post = mongoose.model('Post');
    
    // Find scheduler
    const scheduler = await Scheduler.findOne({ platform: platformName });
    if (!scheduler) {
        console.log(`Skipping ${platformName}: No Scheduler found.`);
        return;
    }

    const filePath = path.join(__dirname, csvFilename);
    if (!fs.existsSync(filePath)) {
        console.log(`Skipping ${platformName}: ${csvFilename} not found.`);
        return;
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    const records = parse(content, { columns: true, skip_empty_lines: true });

    const postsToCreate = records.map(record => ({
        schedulerId: scheduler._id,
        date: record.date || record.Date,
        time: record.time || record.Time,
        topic: record.topic || record.Topic || record['Topic Category'],
        title: record.title || record.Title || record['Post Title'],
        caption: record.caption || record.Caption || record['Post Caption'],
        hashtags: record.hashtags || record.Hashtags,
        mediaPath: record.mediaPath || record.MediaPath || record.media_path || record['Image Path OR Image URL'],
        mediaType: (record.mediaType || record.MediaType || record['Media Type'] || 'image').toLowerCase(),
        status: record['Post Status'] || record.status || 'Pending'
    }));

    // Clear old ones just in case
    await Post.deleteMany({ schedulerId: scheduler._id });
    
    // Insert new posts
    if (postsToCreate.length > 0) {
        await Post.insertMany(postsToCreate);
        console.log(`Imported ${postsToCreate.length} posts to ${platformName} scheduler.`);
    } else {
        console.log(`No posts to import for ${platformName}`);
    }
}

const restore = async () => {
    try {
        await connectDB();
        await importPlatformCsv('Facebook', 'facebook_schedule.csv');
        await importPlatformCsv('Instagram', 'instagram_schedule.csv');
        await importPlatformCsv('LinkedIn', 'linkedin_schedule.csv');
        console.log('Posts restore complete!');
        process.exit(0);
    } catch (error) {
        console.error('Error restoring posts:', error);
        process.exit(1);
    }
};

restore();
