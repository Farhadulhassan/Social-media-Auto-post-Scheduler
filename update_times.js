const fs = require('fs');
const path = require('path');

const files = [
    'linkedin_schedule.csv',
    'facebook_schedule.csv',
    'instagram_schedule.csv'
];

const targetDate = '12/19/2025';
const targetTime = '9:10 AM';

files.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (!fs.existsSync(filePath)) return;

    let content = fs.readFileSync(filePath, 'utf8');
    let lines = content.split('\n');
    let updated = false;

    lines = lines.map(line => {
        if (line.startsWith(targetDate)) {
            let parts = line.split(',');
            if (parts[1] !== targetTime) {
                console.log(`Updating ${file}: ${parts[1]} -> ${targetTime}`);
                parts[1] = targetTime;
                updated = true;
                return parts.join(',');
            }
        }
        return line;
    });

    if (updated) {
        fs.writeFileSync(filePath, lines.join('\n'));
        console.log(`Saved ${file}`);
    } else {
        console.log(`No changes needed for ${file}`);
    }
});
