const { readCSV } = require('./schedulers/facebook/csvReader');
const records = readCSV();
console.log('Total records:', records.length);
if (records.length > 0) {
    console.log('First record Platform:', `'${records[0].Platform}'`);
    console.log('Today:', '12/19/2025');
    const today = records.filter(r => r.Date === '12/19/2025');
    console.log('Today records:', today.length);
    if (today.length > 0) {
        console.log('Today Platform:', `'${today[0].Platform}'`);
        console.log('Today Status:', `'${today[0]['Post Status']}'`);
    }
}
