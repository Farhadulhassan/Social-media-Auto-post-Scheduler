const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    status: {
        type: String,
        enum: ['PENDING', 'APPROVED', 'BLOCKED'],
        default: 'PENDING'
    },
    role: { type: mongoose.Schema.Types.ObjectId, ref: 'Role' },
    assignedSchedulers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Scheduler' }],
    createdAt: { type: Date, default: Date.now }
});

userSchema.pre('save', async function () {
    if (!this.isModified('password')) {
        return;
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});




userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
