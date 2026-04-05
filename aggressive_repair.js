const fs = require('fs');
const { parse } = require('csv-parse/sync');
const { stringify } = require('csv-stringify/sync');

const CSV_PATH = 'linkedin_schedule.csv';
const content = fs.readFileSync(CSV_PATH, 'utf8');

try {
    // Parse everything with relax_column_count
    const rawRecords = parse(content, {
        columns: true,
        skip_empty_lines: true,
        relax_column_count: true,
        trim: true
    });

    console.log('Raw records count:', rawRecords.length);

    // Keep only records that have a valid Date and at least 5 meaningful columns
    // This removes the "scrambled" extra rows
    const cleaned = rawRecords.filter(r => {
        const hasDate = r['Date'] && r['Date'].includes('/');
        const hasPlatform = r['Platform'] === 'LinkedIn' || r['Platform'] === 'Facebook';
        return hasDate && hasPlatform;
    }).map(r => ({
        'Date': r['Date'],
        'Time': r['Time'],
        'Platform': r['Platform'] || 'LinkedIn',
        'Topic Category': r['Topic Category'] || '',
        'Post Title': r['Post Title'] || '',
        'Post Caption': r['Post Caption'] || '',
        'Hashtags': r['Hashtags'] || '',
        'Image Path OR Image URL': r['Image Path OR Image URL'] || '',
        'Image Prompt': r['Image Prompt'] || '',
        'Image Status': r['Image Status'] || 'Pending',
        'Post Status': r['Post Status'] || 'Pending',
        'Log / Error Message': r['Log / Error Message'] || '',
        'Retry Count': r['Retry Count'] || '0'
    }));

    console.log('Cleaned records count:', cleaned.length);

    const output = stringify(cleaned, { header: true });
    fs.writeFileSync(CSV_PATH, output);
    console.log('CSV overwriten with clean data.');
} catch (e) {
    console.error('Aggressive fix failed:', e.message);
}
