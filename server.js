const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

require('dotenv').config();
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');
const { stringify } = require('csv-stringify/sync');
const { exec } = require('child_process');
const connectDB = require('./config/db');
const fileUpload = require('express-fileupload');
const authRoutes = require('./routes/authRoutes');
const schedulerRoutes = require('./routes/schedulerRoutes');
const userRoutes = require('./routes/userRoutes');
const postRoutes = require('./routes/postRoutes');
const roleRoutes = require('./routes/roleRoutes');



// Initialize Mongoose Models
require('./models/Role');
require('./models/User');
require('./models/Scheduler');
require('./models/Post');
console.log('Registered Models:', mongoose.modelNames());


const app = express();
const PORT = process.env.PORT || 3000;

// Connect to Database
connectDB();

// Seed Default Admin
const seedAdmin = async () => {
    try {
        const User = mongoose.model('User');
        const adminEmail = process.env.ADMIN_EMAIL || 'admin@admin.com';
        const adminPass = process.env.ADMIN_PASSWORD || 'admin123';
        
        const adminExists = await User.findOne({ email: adminEmail });
        if (!adminExists) {
            await User.create({
                name: 'Super Admin',
                email: adminEmail,
                password: adminPass,
                status: 'APPROVED'
            });
            console.log(`[Seed] Default Admin created: ${adminEmail} / ${adminPass}`);
        }
    } catch (error) {
        console.error('[Seed] Error seeding admin:', error);
    }
};
seedAdmin();
const PLATFORMS = {
    linkedin: path.join(__dirname, 'linkedin_schedule.csv'),
    facebook: path.join(__dirname, 'facebook_schedule.csv'),
    instagram: path.join(__dirname, 'instagram_schedule.csv')
};

app.use(cors());
app.use(bodyParser.json());
app.use(fileUpload());


app.use('/static/images', express.static('E:/Linkdin post'));

app.use('/static/fb_images', express.static('E:/Facbook post'));
app.use('/static/ig_images', express.static('E:/Instagram post'));

// Routes
app.use('/api/users', authRoutes);
app.use('/api/schedulers', schedulerRoutes);
app.use('/api/user-management', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/roles', roleRoutes);





// MongoDB Unified Scheduler
const { checkAndPost } = require('./automation/mongoScheduler');

// Check every minute
setInterval(async () => {
    try {
        await checkAndPost();
    } catch (err) {
        console.error('[Scheduler Interval] Loop error:', err.message);
    }
}, 60 * 1000);

// Initial check on startup
checkAndPost();


// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(`[Global Error Handler] Error: ${err.message}`);
    console.error(err.stack);

    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode);
    res.json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
});


// Start Server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

