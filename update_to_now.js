const fs = require('fs');
const { parse } = require('csv-parse/sync');
const { stringify } = require('csv-stringify/sync');

// Update time to current time + 2 minutes
const now = new Date();
const targetTime = new Date(now.getTime() + 2 * 60000); // 2 minutes from now
const hours = targetTime.getHours();
const minutes = targetTime.getMinutes();
const ampm = hours >= 12 ? 'PM' : 'AM';
const displayHours = hours % 12 || 12;
const timeStr = `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;

console.log(`Setting time to: ${timeStr}`);

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
    console.log(`Updated ${file}`);
};

updateFile('facebook_schedule.csv');
updateFile('instagram_schedule.csv');
