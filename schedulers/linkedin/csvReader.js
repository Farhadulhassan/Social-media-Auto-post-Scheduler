const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');
const { stringify } = require('csv-stringify/sync');
const logger = require('./logger');

const CSV_PATH = path.join(__dirname, '../../linkedin_schedule.csv');

function readCSV() {
    if (!fs.existsSync(CSV_PATH)) {
        logger.error(`CSV file not found at ${CSV_PATH}`);
        return [];
    }

    try {
        const fileContent = fs.readFileSync(CSV_PATH, 'utf8');
        const records = parse(fileContent, {
            columns: true,
            skip_empty_lines: true,
            relax_column_count: true
        });

        // Ensure Retry Count column exists in all records
        return records.map(r => ({
            ...r,
            'Retry Count': r['Retry Count'] || '0'
        }));
    } catch (err) {
        logger.error(`Error reading/parsing CSV: ${err.message}`);
        return [];
    }
}

function updateCSV(records) {
    try {
        const output = stringify(records, { header: true });
        fs.writeFileSync(CSV_PATH, output);
        // logger.info('CSV updated successfully.');
        return true;
    } catch (err) {
        logger.error(`Error writing CSV: ${err.message}`);
        return false;
    }
}

module.exports = {
    readCSV,
    updateCSV
};
