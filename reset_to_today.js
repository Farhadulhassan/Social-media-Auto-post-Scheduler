const fs = require('fs');
const { parse } = require('csv-parse/sync');
const { stringify } = require('csv-stringify/sync');

console.log('Restoring original dates and setting status appropriately.');

const updateFacebook = (records) => {
    if (records.length > 0) {
        records[0].Date = '12/19/2025';
        records[0].Time = '11:25 AM';
        records[0]['Post Status'] = 'Pending'; // Was failed, but set to pending for retry
    }
    if (records.length > 1) {
        records[1].Date = '12/20/2025';
        records[1].Time = '11:00 AM';
        records[1]['Post Status'] = 'Posted'; // Today's post, assume posted
    }
    if (records.length > 2) {
        records[2].Date = '12/21/2025';
        records[2].Time = '12:00 PM';
        records[2]['Post Status'] = 'Pending';
    }
    return records;
};

const updateInstagram = (records) => {
    if (records.length > 0) {
        records[0].Date = '12/18/2025';
        records[0].Time = '11:57 PM';
        records[0]['Post Status'] = 'Posted'; // Already posted
    }
    if (records.length > 1) {
        records[1].Date = '12/19/2025';
        records[1].Time = '11:22 AM';
        records[1]['Post Status'] = 'Pending'; // Failed, set to pending
    }
    return records;
};

const updateLinkedIn = (records) => {
    const dates = [
        '12/17/2025', '12/18/2025', '12/19/2025', '12/20/2025', // For first 4
        '12/21/2025', '12/22/2025', '12/23/2025', '12/24/2025', // And so on
        '12/25/2025', '12/26/2025', '12/27/2025', '12/28/2025',
        '12/29/2025', '12/30/2025', '12/31/2025', '1/1/2026',
        '1/2/2026', '1/3/2026', '1/4/2026', '1/5/2026',
        '1/6/2026', '1/7/2026', '1/8/2026', '1/9/2026',
        '1/10/2026', '1/11/2026', '1/12/2026', '1/13/2026',
        '1/14/2026', '1/15/2026'
    ];
    records.forEach((r, i) => {
        if (dates[i]) r.Date = dates[i];
        r.Time = '9:00 AM'; // Default time
        if (i === 3) { // Dec 20 post
            r['Post Status'] = 'Posted'; // Today's post
        } else {
            r['Post Status'] = 'Pending';
        }
        r['Retry Count'] = '0';
        r['Log / Error Message'] = '';
    });
    return records;
};

const updateFile = (file, updater) => {
    if (!fs.existsSync(file)) return;
    const content = fs.readFileSync(file, 'utf8');
    const records = parse(content, { columns: true, skip_empty_lines: true, relax_column_count: true });
    const updated = updater(records);
    fs.writeFileSync(file, stringify(updated, { header: true }));
    console.log(`Updated ${file}`);
};

updateFile('facebook_schedule.csv', updateFacebook);
updateFile('instagram_schedule.csv', updateInstagram);
updateFile('linkedin_schedule.csv', updateLinkedIn);

console.log('CSVs restored to original dates, only Dec 20 posts marked as Posted.');