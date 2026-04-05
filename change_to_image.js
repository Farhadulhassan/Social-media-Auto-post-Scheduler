const fs = require('fs');
const { parse } = require('csv-parse/sync');
const { stringify } = require('csv-stringify/sync');

const file = 'facebook_schedule.csv';
const content = fs.readFileSync(file, 'utf8');
const records = parse(content, { columns: true, skip_empty_lines: true, relax_column_count: true });

const updated = records.map(r => {
    if (r.Date === '12/19/2025') {
        // Change video to image
        r['Image Path OR Image URL'] = 'E:/Linkdin post/day1.png';
        r['Post Status'] = 'Pending';
        r['Retry Count'] = '0';
        r['Log / Error Message'] = '';
    }
    return r;
});

fs.writeFileSync(file, stringify(updated, { header: true }));
console.log('Facebook post changed from video to image');
