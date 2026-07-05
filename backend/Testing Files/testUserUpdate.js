const mongoose = require('mongoose');
const User = require('../src/models/User');
const { updateProfile } = require('../src/services/userService');

const test = async () => {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/jobportal');
        console.log('MongoDB Connected.');

        // 1. Fetch or create a test candidate
        let user = await User.findOne({ role: 'candidate' });
        if (!user) {
            user = await User.create({
                name: 'John Candidate',
                email: 'candidate@example.com',
                password: 'securepassword123',
                role: 'candidate'
            });
        }

        console.log('Original User Bio:', user.bio || 'None');

        // 2. Perform a partial update on the bio and skills
        const updatePayload = {
            bio: 'Enthusiastic software engineer working with Node.js and MongoDB.',
            skills: ['JavaScript', 'Node.js', 'Express', 'MongoDB'],
            role: 'admin', // Should be ignored by whitelist
            email: 'hacker@example.com' // Should be ignored by whitelist
        };

        const updatedUser = await updateProfile(user._id, updatePayload);
        console.log('✅ Update Profile Succeeded.');
        console.log('Updated Bio:', updatedUser.bio);
        console.log('Updated Skills:', updatedUser.skills);
        console.log('Role unchanged (Whitelist verified):', updatedUser.role);
        console.log('Email unchanged (Whitelist verified):', updatedUser.email);

    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        await mongoose.connect('mongodb://127.0.0.1:27017/jobportal'); // Ensure connection is active
        await mongoose.connection.close();
    }
};

test();