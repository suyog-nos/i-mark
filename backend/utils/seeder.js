const User = require('../models/User');

const seedAdmin = async () => {
    try {
        const adminEmail = process.env.ADMIN_EMAIL || 'admin@admin.com';
        const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
        const adminName = process.env.ADMIN_NAME || 'Admin User';

        const existingAdmin = await User.findOne({ email: adminEmail });

        if (existingAdmin) {
            console.log('Admin user already exists.');
            return;
        }

        const admin = new User({
            name: adminName,
            email: adminEmail,
            password: adminPassword,
            role: 'admin',
            status: 'active',
            profile: {
                bio: 'System Administrator',
                picture: ''
            }
        });

        await admin.save();
        console.log(`Admin user created successfully: ${adminEmail}`);
    } catch (error) {
        console.error('Error seeding admin user:', error);
    }
};

module.exports = seedAdmin;
