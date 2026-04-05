const mongoose = require('mongoose');

const schedulerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    platform: {
        type: String,
        enum: ['Facebook', 'Instagram', 'LinkedIn'],
        required: true
    },
    platformId: String, // Page ID or Business ID
    accessToken: String,
    status: {
        type: String,
        enum: ['ACTIVE', 'INACTIVE'],
        default: 'ACTIVE'
    },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

module.exports = mongoose.model('Scheduler', schedulerSchema);
