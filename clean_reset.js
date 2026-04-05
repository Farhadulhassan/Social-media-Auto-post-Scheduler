const fs = require('fs');

const fixFile = (file, statusIdx, logIdx, retryIdx) => {
    if (!fs.existsSync(file)) return;
    let content = fs.readFileSync(file, 'utf8');
    let lines = content.split('\n');

    let newLines = lines.map(line => {
        if (line.startsWith('12/19/2025')) {
            let parts = line.split(',');
            // Reconstruct the line properly
            // We want: Date,Time,Platform,Topic,Title,Caption,Hashtags,MediaPath,Media/ImagePrompt,Status,Log,Retry
            // Let's just keep the first 8 parts and reset the rest
            let base = parts.slice(0, 9);
            if (file === 'facebook_schedule.csv') {
                // FB has: Date,Time,Platform,Topic,Title,Caption,Hashtags,MediaPath,Prompt,Status,Log,Retry
                base = parts.slice(0, 9);
                return [...base, 'Pending', '""', '0'].join(',');
            } else {
                // IG has: Date,Time,Platform,Topic,Title,Caption,Hashtags,MediaPath,Type,Status,Log,Retry
                base = parts.slice(0, 9);
                return [...base, 'Pending', '""', '0'].join(',');
            }
        }
        return line;
    });

    fs.writeFileSync(file, newLines.join('\n'));
    console.log(`Cleaned and Reset ${file}`);
};

fixFile('facebook_schedule.csv', 10, 11, 12);
fixFile('instagram_schedule.csv', 9, 10, 11);
