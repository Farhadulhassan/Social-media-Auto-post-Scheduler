const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    schedulerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Scheduler', required: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    topic: String,
    title: String,
    caption: String,
    hashtags: String,
    mediaPath: String,
    mediaType: { type: String, enum: ['image', 'video'] },
    status: {
        type: String,
        enum: ['Pending', 'Posted', 'Failed'],
        default: 'Pending'
    },
    errorLog: String,
    retryCount: { type: Number, default: 0 },
    postedId: String
});

module.exports = mongoose.model('Post', postSchema);
