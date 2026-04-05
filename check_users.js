const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const connectDB = require('./config/db');
require('./models/Role');
require('./models/User');

const checkUsers = async () => {
    try {
        await connectDB();
        const User = mongoose.model('User');
        const users = await User.find({}).populate('role');
        console.log('--- USERS ---');
        users.forEach(u => {
            console.log(`Name: ${u.name}, Email: ${u.email}, Role: ${u.role ? (u.role.name || u.role) : 'None'}`);
            if (u.role && typeof u.role === 'string') {
                console.log(`WARNING: User ${u.email} has role as string: "${u.role}"`);
            }
        });
        process.exit();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

checkUsers();
