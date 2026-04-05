const fs = require('fs');
const { parse } = require('csv-parse/sync');
const { stringify } = require('csv-stringify/sync');

const CSV_PATH = 'linkedin_schedule.csv';
const content = fs.readFileSync(CSV_PATH, 'utf8');

try {
    const records = parse(content, {
        columns: true,
        skip_empty_lines: true,
        relax_column_count: true
    });

    // Cleanup records - fill missing Platform if needed
    const cleaned = records.map(r => ({
        ...r,
        'Platform': r['Platform'] || 'LinkedIn',
        'Retry Count': r['Retry Count'] || '0'
    }));

    const output = stringify(cleaned, { header: true });
    fs.writeFileSync(CSV_PATH, output);
    console.log('CSV Refined and Fixed.');
} catch (e) {
    console.error('CSV Parse Error during cleanup:', e.message);
}
