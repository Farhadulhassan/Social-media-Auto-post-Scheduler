const fs = require('fs');
const { parse } = require('csv-parse/sync');
const { stringify } = require('csv-stringify/sync');

// Set time to NOW (not future)
const now = new Date();
const hours = now.getHours();
const minutes = now.getMinutes();
const ampm = hours >= 12 ? 'PM' : 'AM';
const displayHours = hours % 12 || 12;
const timeStr = `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;

console.log(`Setting time to NOW: ${timeStr}`);

const updateFile = (file) => {
    if (!fs.existsSync(file)) return;
    const content = fs.readFileSync(file, 'utf8');
    const records = parse(content, { columns: true, skip_empty_lines: true, relax_column_count: true });

    const updated = records.map(r => {
        if (r.Date === '12/19/2025' && r['Post Status'] === 'Pending') {
            r.Time = timeStr;
        }
        return r;
    });

    fs.writeFileSync(file, stringify(updated, { header: true }));
    console.log(`Updated ${file} to ${timeStr}`);
};

updateFile('facebook_schedule.csv');
updateFile('instagram_schedule.csv');
