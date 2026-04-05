const recordDate = '12/26/2025';
const recordTime = '9:00 AM';
const scheduledTime = new Date(`${recordDate} ${recordTime}`);
const now = new Date();
const diffMinutes = (now - scheduledTime) / (1000 * 60);

console.log('Record Date:', recordDate);
console.log('Record Time:', recordTime);
console.log('Scheduled Time (Parsed):', scheduledTime.toString());
console.log('Now:', now.toString());
console.log('Diff Minutes:', diffMinutes);
console.log('Is Pending/Due:', diffMinutes >= 0);
