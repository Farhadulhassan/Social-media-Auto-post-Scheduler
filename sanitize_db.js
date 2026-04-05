const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const connectDB = require('./config/db');
require('./models/Role');
require('./models/User');

const sanitize = async () => {
    try {
        await connectDB();
        const User = mongoose.model('User');
        const users = await User.find({});

        console.log(`Checking ${users.length} users...`);

        for (const user of users) {
            // Check if role is a string
            if (user.role && typeof user.role === 'string' && !mongoose.Types.ObjectId.isValid(user.role)) {
                console.log(`Fixing User ${user.email}: Role was string "${user.role}", resetting to null`);
                user.role = undefined; // This will effectively set it to null or remove the field if optional
                await user.save();
            }
        }

        console.log('Sanitization complete!');
        process.exit();
    } catch (error) {
        console.error('Sanitization failed:', error);
        process.exit(1);
    }
};

sanitize();
