const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const connectDB = require('./config/db');
require('./models/User');

const sanitize = async () => {
    try {
        await connectDB();
        const User = mongoose.model('User');
        const users = await User.find({});

        console.log(`Aggressively cleaning ${users.length} users...`);

        for (const user of users) {
            console.log(`Clearing role for ${user.email}`);
            user.role = undefined;
            // Also clear any other potential BSON issues
            if (user.assignedSchedulers && !Array.isArray(user.assignedSchedulers)) {
                user.assignedSchedulers = [];
            }
            await user.save();
        }

        console.log('Aggressive sanitization complete!');
        process.exit();
    } catch (error) {
        console.error('Sanitization failed:', error);
        process.exit(1);
    }
};

sanitize();
