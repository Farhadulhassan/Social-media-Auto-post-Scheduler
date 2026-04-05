const fs = require('fs');
const { parse } = require('csv-parse/sync');
const { stringify } = require('csv-stringify/sync');

// Change Facebook post to text-only (no image)
const file = 'facebook_schedule.csv';
const content = fs.readFileSync(file, 'utf8');
const records = parse(content, { columns: true, skip_empty_lines: true, relax_column_count: true });

const updated = records.map(r => {
    if (r.Date === '12/19/2025') {
        r['Image Path OR Image URL'] = ''; // Remove image
        r['Post Status'] = 'Pending';
        r['Retry Count'] = '0';
        r['Log / Error Message'] = '';
    }
    return r;
});

fs.writeFileSync(file, stringify(updated, { header: true }));
console.log('Facebook post changed to text-only');
