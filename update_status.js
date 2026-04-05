const fs = require('fs');
const { parse } = require('csv-parse/sync');
const { stringify } = require('csv-stringify/sync');

const updateLinkedIn = (records) => {
    records.forEach((r, i) => {
        if (r.Date === '12/17/2025' || r.Date === '12/18/2025' || r.Date === '12/19/2025' || r.Date === '12/20/2025') {
            r['Post Status'] = 'Posted';
            r['Log / Error Message'] = 'Posted.';
        } else {
            r['Post Status'] = 'Pending';
            r['Log / Error Message'] = '';
        }
        r['Retry Count'] = '0';
    });
    return records;
};

const file = 'linkedin_schedule.csv';
if (fs.existsSync(file)) {
    const content = fs.readFileSync(file, 'utf8');
    const records = parse(content, { columns: true, skip_empty_lines: true, relax_column_count: true });
    const updated = updateLinkedIn(records);
    fs.writeFileSync(file, stringify(updated, { header: true }));
    console.log('Updated LinkedIn CSV: Dec 20 Posted, 21-23 Pending.');
}