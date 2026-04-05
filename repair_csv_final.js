const fs = require('fs');
const { parse } = require('csv-parse/sync');
const { stringify } = require('csv-stringify/sync');

const CSV_PATH = 'linkedin_schedule.csv';
const content = fs.readFileSync(CSV_PATH, 'utf8');

try {
    // We use relax_column_count to get all records even if some are broken
    const records = parse(content, {
        columns: true,
        skip_empty_lines: true,
        relax_column_count: true,
        trim: true
    });

    // Filter out records that are clearly broken or empty
    const cleaned = records.filter(r => r.Date && r['Post Title']).map(r => ({
        'Date': r['Date'],
        'Time': r['Time'],
        'Platform': r['Platform'] || 'LinkedIn',
        'Topic Category': r['Topic Category'],
        'Post Title': r['Post Title'],
        'Post Caption': r['Post Caption'],
        'Hashtags': r['Hashtags'],
        'Image Path OR Image URL': r['Image Path OR Image URL'],
        'Image Prompt': r['Image Prompt'],
        'Image Status': r['Image Status'],
        'Post Status': r['Post Status'],
        'Log / Error Message': r['Log / Error Message'],
        'Retry Count': r['Retry Count'] || '0'
    }));

    const output = stringify(cleaned, { header: true });
    fs.writeFileSync(CSV_PATH, output);
    console.log('CSV Fully Repaired. Total records:', cleaned.length);
} catch (e) {
    console.error('Fatal Repair Error:', e.message);
}
