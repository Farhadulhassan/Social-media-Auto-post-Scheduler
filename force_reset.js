const fs = require('fs');
const { parse } = require('csv-parse/sync');
const { stringify } = require('csv-stringify/sync');

const fixFB = () => {
    const file = 'facebook_schedule.csv';
    if (!fs.existsSync(file)) return;
    const content = fs.readFileSync(file, 'utf8');
    const records = parse(content, { columns: true, skip_empty_lines: true, relax_column_count: true });

    const updated = records.map(r => {
        if (r.Date === '12/19/2025') {
            r['Post Status'] = 'Pending';
            r['Retry Count'] = '0';
            r['Log / Error Message'] = '';
        }
        return r;
    });

    fs.writeFileSync(file, stringify(updated, { header: true }));
    console.log('Facebook CSV Reset to Pending (0 retries)');
};

const fixIG = () => {
    const file = 'instagram_schedule.csv';
    if (!fs.existsSync(file)) return;
    const content = fs.readFileSync(file, 'utf8');
    const records = parse(content, { columns: true, skip_empty_lines: true, relax_column_count: true });

    const updated = records.map(r => {
        if (r.Date === '12/19/2025') {
            r['Post Status'] = 'Pending';
            r['Retry Count'] = '0';
            r['Log / Error Message'] = '';
        }
        return r;
    });

    fs.writeFileSync(file, stringify(updated, { header: true }));
    console.log('Instagram CSV Reset to Pending (0 retries)');
};

fixFB();
fixIG();
