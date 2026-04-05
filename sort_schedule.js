const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');
const { stringify } = require('csv-stringify/sync');

const files = [
    path.join(__dirname, 'facebook_schedule.csv'),
    path.join(__dirname, 'instagram_schedule.csv')
];

function parseDate(dateStr) {
    if (!dateStr) return new Date(0);
    const [month, day, year] = dateStr.split('/');
    return new Date(year, month - 1, day);
}

files.forEach(filePath => {
    try {
        if (fs.existsSync(filePath)) {
            console.log(`Sorting ${path.basename(filePath)}...`);
            const content = fs.readFileSync(filePath, 'utf8');
            const records = parse(content, { columns: true, skip_empty_lines: true, relax_column_count: true });

            records.sort((a, b) => {
                const dateA = parseDate(a.Date);
                const dateB = parseDate(b.Date);
                // Compare Date
                if (dateA < dateB) return -1;
                if (dateA > dateB) return 1;
                // If dates equal, compare Time? (Ignoring for now, assume 1 post per day usually)
                return 0;
            });

            fs.writeFileSync(filePath, stringify(records, { header: true }));
            console.log(`Sorted ${records.length} records.`);
        }
    } catch (err) {
        console.error(`Error sorting ${path.basename(filePath)}:`, err);
    }
});
