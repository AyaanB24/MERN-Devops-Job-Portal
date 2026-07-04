const mongoose = require('mongoose');
const User = require('./src/models/User');
const Company = require('./src/models/Company');

const test = async () => {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/jobportal');
        console.log('MongoDB Connected.');

        // 1. Fetch or create a test user (owner)
        let user = await User.findOne();
        if (!user) {
            user = await User.create({
                name: 'Test Owner',
                email: 'owner@example.com',
                password: 'securepassword123',
                role: 'recruiter'
            });
        }

        // 2. Try creating a company with invalid website format (should FAIL)
        try {
            await Company.create({
                companyName: 'Bad Format Inc',
                website: 'not-a-valid-url',
                owner: user._id
            });
        } catch (err) {
            console.log('✅ Validation properly caught invalid URL format:', err.message);
        }

        // 3. Create a valid company (should SUCCEED)
        const company = await Company.create({
            companyName: 'Tech Corp ' + Date.now(),
            description: 'A leading tech company',
            website: 'https://techcorp.com',
            owner: user._id
        });
        console.log('✅ Company created successfully:', company);

        // 4. Query & populate reference
        const queriedCompany = await Company.findById(company._id).populate('owner');
        console.log('✅ Populated Owner Details:', queriedCompany.owner.name);

    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        await mongoose.connection.close();
    }
};

test();