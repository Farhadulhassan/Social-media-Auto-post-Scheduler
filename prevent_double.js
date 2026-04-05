const fs = require('fs');
const { parse } = require('csv-parse/sync');
const { stringify } = require('csv-stringify/sync');

const file = 'linkedin_schedule.csv';
if (fs.existsSync(file)) {
    const content = fs.readFileSync(file, 'utf8');
    const records = parse(content, { columns: true, skip_empty_lines: true, relax_column_count: true });

    const updated = records.map(r => {
        if (r.Date === '12/19/2025' && r.Platform === 'LinkedIn') {
            r['Post Status'] = 'Posted';
            r['Log / Error Message'] = 'Already posted (Prevented double post)';
        }
        return r;
    });

    fs.writeFileSync(file, stringify(updated, { header: true }));
    console.log('LinkedIn status updated to prevent double post.');
}
