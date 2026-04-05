const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { createObjectCsvWriter } = require('csv-writer');

const linkedinPath = path.join(__dirname, 'linkedin_schedule.csv');
const facebookPath = path.join(__dirname, 'facebook_schedule.csv');
const instagramPath = path.join(__dirname, 'instagram_schedule.csv');

const futureStartDate = new Date('2025-12-22T00:00:00'); // Start from tomorrow

// Helper to parse date string "MM/DD/YYYY"
function parseDate(dateStr) {
    const [month, day, year] = dateStr.split('/');
    return new Date(year, month - 1, day);
}

// Helper to escape CSV fields if they contain commas or quotes
function escapeCsvField(field) {
    if (field === undefined || field === null) return '';
    const stringField = String(field);
    if (stringField.includes(',') || stringField.includes('"') || stringField.includes('\n')) {
        return `"${stringField.replace(/"/g, '""')}"`;
    }
    return stringField;
}

// Headers for Facebook (Same as LinkedIn essentially)
const fbHeaders = [
    'Date', 'Time', 'Platform', 'Topic Category', 'Post Title',
    'Post Caption', 'Hashtags', 'Image Path OR Image URL',
    'Image Prompt', 'Image Status', 'Post Status',
    'Log / Error Message', 'Retry Count'
];

// Headers for Instagram
const instaHeaders = [
    'Date', 'Time', 'Platform', 'Topic Category', 'Post Title',
    'Post Caption', 'Hashtags', 'Image Path OR Image URL',
    'Media Type', 'Post Status', 'Log / Error Message', 'Retry Count'
];

const linkedinPosts = [];

fs.createReadStream(linkedinPath)
    .pipe(csv())
    .on('data', (row) => {
        if (row.Date) {
            const postDate = parseDate(row.Date);
            // We only care about posts from Dec 22 onwards
            if (postDate >= futureStartDate) {
                linkedinPosts.push(row);
            }
        }
    })
    .on('end', () => {
        console.log(`Found ${linkedinPosts.length} future posts from LinkedIn.`);
        appendToFacebook(linkedinPosts);
        appendToInstagram(linkedinPosts);
    });

function appendToFacebook(posts) {
    const newRows = posts.map(post => {
        return [
            post.Date,
            post.Time,
            'Facebook', // Change Platform
            post['Topic Category'],
            post['Post Title'],
            post['Post Caption'],
            post.Hashtags,
            post['Image Path OR Image URL'],
            post['Image Prompt'] || '',
            'Pending', // Image Status
            'Pending', // Post Status
            '', // Log
            '0' // Retry Count
        ].map(escapeCsvField).join(',');
    });

    if (newRows.length > 0) {
        fs.appendFileSync(facebookPath, '\n' + newRows.join('\n'));
        console.log(`Appended ${newRows.length} rows to Facebook.`);
    }
}

function appendToInstagram(posts) {
    const newRows = posts.map(post => {
        const imagePath = post['Image Path OR Image URL'] || '';
        // Assume image unless explicitly video, but user wants image only automation for now.
        // Even if the path expects a video, if usage is 'image' it might fail, but user said "pics path da diya" 
        // implying they are images.
        const mediaType = 'image';

        return [
            post.Date,
            post.Time,
            'Instagram', // Change Platform
            post['Topic Category'],
            post['Post Title'],
            post['Post Caption'],
            post.Hashtags,
            imagePath,
            mediaType,
            'Pending', // Post Status
            '', // Log
            '0' // Retry Count
        ].map(escapeCsvField).join(',');
    });

    if (newRows.length > 0) {
        fs.appendFileSync(instagramPath, '\n' + newRows.join('\n'));
        console.log(`Appended ${newRows.length} rows to Instagram.`);
    }
}
