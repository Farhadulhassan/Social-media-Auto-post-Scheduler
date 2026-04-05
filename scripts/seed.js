const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Role = require('../models/Role');
const User = require('../models/User');

dotenv.config();

const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/social-media-handler');

        // Clear existing roles
        await Role.deleteMany();

        const roles = [
            {
                name: 'Super Admin',
                permissions: ['*']
            },
            {
                name: 'Trusted Manager',
                permissions: [
                    'scheduler.view', 'scheduler.create', 'scheduler.edit', 'scheduler.enable_disable',
                    'csv.upload', 'csv.edit', 'csv.activate',
                    'platform.facebook', 'platform.instagram', 'platform.linkedin'
                ]
            },
            {
                name: 'SEO Editor',
                permissions: [
                    'scheduler.view',
                    'post.edit.title', 'post.edit.caption', 'post.edit.tags'
                ]
            }
        ];

        const createdRoles = await Role.insertMany(roles);
        console.log('✅ Roles seeded:', createdRoles.length);

        // Initial Admin
        const adminEmail = 'admin@admin.com';
        console.log('Checking if admin exists:', adminEmail);
        const adminExists = await User.findOne({ email: adminEmail });

        if (!adminExists) {
            console.log('Admin does not exist, creating...');
            const superAdminRole = createdRoles.find(r => r.name === 'Super Admin');
            console.log('Found Super Admin Role ID:', superAdminRole._id);
            await User.create({
                name: 'Super Admin',
                email: adminEmail,
                password: 'admin123', // User should change this
                status: 'APPROVED',
                role: superAdminRole._id
            });
            console.log('✅ Initial Admin created: admin@admin.com / admin123');
        } else {
            console.log('Admin already exists');
        }

        process.exit();
    } catch (error) {
        console.error('❌ Error seeding data:', error);
        process.exit(1);
    }

};

seed();
