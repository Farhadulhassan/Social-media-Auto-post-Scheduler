const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');
const { stringify } = require('csv-stringify/sync');

const FB_CSV = path.join(__dirname, 'facebook_schedule.csv');
const IG_CSV = path.join(__dirname, 'instagram_schedule.csv');

function resetCSV(csvPath) {
    if (!fs.existsSync(csvPath)) {
        console.log(`File not found: ${csvPath}`);
        return;
    }

    try {
        const fileContent = fs.readFileSync(csvPath, 'utf8');
        const records = parse(fileContent, {
            columns: true,
            skip_empty_lines: true,
            relax_column_count: true,
            trim: true
        });

        let resetCount = 0;
        const updatedRecords = records.map(r => {
            if (r['Post Status'] === 'Failed') {
                r['Post Status'] = 'Pending';
                r['Log / Error Message'] = 'Reset after token update';
                r['Retry Count'] = '0';
                resetCount++;
            }
            return r;
        });

        if (resetCount > 0) {
            const output = stringify(updatedRecords, { header: true });
            fs.writeFileSync(csvPath, output);
            console.log(`✅ Reset ${resetCount} failed posts in ${path.basename(csvPath)}`);
        } else {
            console.log(`ℹ️ No failed posts found in ${path.basename(csvPath)}`);
        }
    } catch (err) {
        console.error(`❌ Error processing ${path.basename(csvPath)}: ${err.message}`);
    }
}

console.log('--- Resetting Failed Posts ---');
resetCSV(FB_CSV);
resetCSV(IG_CSV);
