const fs = require('fs');
const { parse } = require('csv-parse/sync');
const { stringify } = require('csv-stringify/sync');

const filePath = 'linkedin_schedule.csv';
const content = fs.readFileSync(filePath, 'utf8');

try {
    // We use relax options to handle any slight corruption from the previous script
    const records = parse(content, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
        relax_column_count: true,
        relax_quotes: true
    });

    console.log(`Read ${records.length} records.`);

    const targetDate = '12/19/2025';
    const targetTime = '9:10 AM';

    const updatedRecords = records.filter(r => r.Date && r['Post Title']).map(r => {
        if (r.Date === targetDate) {
            r.Time = targetTime;
        }
        return r;
    });

    const output = stringify(updatedRecords, { header: true });
    fs.writeFileSync(filePath, output);
    console.log(`Successfully updated and saved ${filePath}. Total valid records: ${updatedRecords.length}`);
} catch (error) {
    console.error('Error fixing CSV:', error.message);
}
