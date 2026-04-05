const fs = require('fs');
const { parse } = require('csv-parse/sync');
const { stringify } = require('csv-stringify/sync');

const CSV_PATH = 'linkedin_schedule.csv';
const content = fs.readFileSync(CSV_PATH, 'utf8');

try {
    const rawRecords = parse(content, {
        columns: true,
        skip_empty_lines: true,
        relax_column_count: true,
        trim: true
    });

    // Remove Facebook rows from LinkedIn CSV
    const cleaned = rawRecords.filter(r => r.Platform === 'LinkedIn');

    const output = stringify(cleaned, { header: true });
    fs.writeFileSync(CSV_PATH, output);
    console.log('LinkedIn CSV cleaned.');
} catch (e) {
    console.error('Cleanup failed:', e.message);
}
