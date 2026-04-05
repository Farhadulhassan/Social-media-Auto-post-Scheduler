const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');
const { stringify } = require('csv-stringify/sync');

const linkedinPath = path.join(__dirname, 'linkedin_schedule.csv');
const facebookPath = path.join(__dirname, 'facebook_schedule.csv');
const instagramPath = path.join(__dirname, 'instagram_schedule.csv');

function updateSchedules() {
    try {
        console.log('Reading LinkedIn schedule...');
        const linkedinContent = fs.readFileSync(linkedinPath, 'utf8');
        const linkedinRecords = parse(linkedinContent, { columns: true, skip_empty_lines: true, relax_column_count: true });

        // Find Dec 21 post
        const targetPost = linkedinRecords.find(r => r.Date === '12/21/2025');
        if (!targetPost) {
            console.error('Could not find Dec 21 post in LinkedIn schedule!');
            return;
        }

        console.log('Found Dec 21 post:', targetPost['Post Title']);

        // Defines target time (slightly in past so it triggers immediately)
        const targetTime = '11:05 PM';

        // Update Facebook
        console.log('Updating Facebook schedule...');
        const fbContent = fs.readFileSync(facebookPath, 'utf8');
        const fbRecords = parse(fbContent, { columns: true, skip_empty_lines: true, relax_column_count: true });

        // Find index of Dec 21
        const fbIndex = fbRecords.findIndex(r => r.Date === '12/21/2025');

        const fbEntry = {
            Date: '12/21/2025',
            Time: targetTime,
            Platform: 'Facebook',
            'Topic Category': targetPost['Topic Category'],
            'Post Title': targetPost['Post Title'],
            'Post Caption': targetPost['Post Caption'],
            Hashtags: targetPost.Hashtags,
            'Image Path OR Image URL': targetPost['Image Path OR Image URL'],
            'Image Prompt': targetPost['Image Prompt'],
            'Image Status': 'Pending',
            'Post Status': 'Pending',
            'Log / Error Message': '',
            'Retry Count': '0'
        };

        if (fbIndex !== -1) {
            fbRecords[fbIndex] = fbEntry;
        } else {
            fbRecords.push(fbEntry);
        }

        fs.writeFileSync(facebookPath, stringify(fbRecords, { header: true }));
        console.log('Facebook schedule updated.');

        // Update Instagram
        console.log('Updating Instagram schedule...');
        const instaContent = fs.readFileSync(instagramPath, 'utf8');
        const instaRecords = parse(instaContent, { columns: true, skip_empty_lines: true, relax_column_count: true });

        // Find index of Dec 21 (likely not there)
        const instaIndex = instaRecords.findIndex(r => r.Date === '12/21/2025');

        const instaEntry = {
            Date: '12/21/2025',
            Time: targetTime,
            Platform: 'Instagram',
            'Topic Category': targetPost['Topic Category'],
            'Post Title': targetPost['Post Title'],
            'Post Caption': targetPost['Post Caption'],
            Hashtags: targetPost.Hashtags,
            'Image Path OR Image URL': targetPost['Image Path OR Image URL'],
            'Media Type': 'image', // Enforce image
            'Post Status': 'Pending',
            'Log / Error Message': '',
            'Retry Count': '0'
        };

        if (instaIndex !== -1) {
            instaRecords[instaIndex] = instaEntry;
        } else {
            // Insert in correct order? Or just push.
            // Since records are likely sorted by date, let's try to splice if possible, or just push.
            // The sync script append them. We can push or filter/sort.
            // To be safe, let's just push and verify position is okay.
            // Actually, if we push, it might be out of order (Dec 22 is already there).
            // But scheduler filters by date=currentDate, so order in CSV usually doesn't matter for the logic.
            instaRecords.push(instaEntry);
        }

        fs.writeFileSync(instagramPath, stringify(instaRecords, { header: true }));
        console.log('Instagram schedule updated.');

    } catch (error) {
        console.error('Error updating schedules:', error);
    }
}

updateSchedules();
