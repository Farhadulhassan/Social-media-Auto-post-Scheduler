const fs = require('fs');
const path = require('path');
const config = require('./config');

const LOG_DIR = path.join(__dirname, '../../logs');

if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
}

function logTo(filePath, level, message, metadata = {}) {
    const timestamp = new Date().toISOString();
    const logEntry = {
        timestamp,
        level,
        message,
        ...metadata
    };

    const formattedMessage = JSON.stringify(logEntry) + '\n';

    console.log(`[Facebook] [${level}] ${message}`, Object.keys(metadata).length ? metadata : '');

    try {
        fs.appendFileSync(path.resolve(__dirname, filePath), formattedMessage);
    } catch (err) {
        console.error('Failed to write to Facebook log file:', err);
    }
}

module.exports = {
    info: (msg, meta) => logTo(config.LOG_SUCCESS, 'INFO', msg, meta),
    error: (msg, meta) => logTo(config.LOG_ERROR, 'ERROR', msg, meta),
    warn: (msg, meta) => logTo(config.LOG_ERROR, 'WARN', msg, meta),
    success: (msg, meta) => logTo(config.LOG_SUCCESS, 'SUCCESS', msg, meta)
};
