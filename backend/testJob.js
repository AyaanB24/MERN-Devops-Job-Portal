const mongoose = require('mongoose');
const User = require('./src/models/User');
const Company = require('./src/models/Company');
const Job = require('./src/models/Job');

const test = async () => {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/jobportal');
        console.log('MongoDB Connected.');

        // 1. Fetch existing recruiter and company
        const recruiter = await User.findOne({ role: 'recruiter' });
        const company = await Company.findOne();

        if (!recruiter || !company) {
            console.error('❌ No recruiter or company found. Run Phase 5 test first.');
            return;
        }

        // 2. Test validation: invalid experience should FAIL
        try {
            await Job.create({
                title: 'Invalid Job',
                description: 'Test',
                salary: 50000,
                location: 'Mumbai',
                experience: '999 years', // Invalid enum value
                company: company._id,
                createdBy: recruiter._id,
            });
        } catch (err) {
            console.log('✅ Validation caught invalid experience enum:', err.message);
        }

        // 3. Create a valid job
        const job = await Job.create({
            title: 'Senior Node.js Developer',
            description: 'Build scalable REST APIs for our platform.',
            salary: 1500000,
            location: 'Bangalore',
            experience: '3-5 years',
            jobType: 'Full-time',
            skills: ['Node.js', 'Express', 'MongoDB'],
            company: company._id,
            createdBy: recruiter._id,
        });
        console.log('✅ Job created successfully:', job.title);

        // 4. Populate both references
        const populated = await Job.findById(job._id).populate('company').populate('createdBy');
        console.log('✅ Company:', populated.company.companyName);
        console.log('✅ Created By:', populated.createdBy.name);

    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        await mongoose.connection.close();
    }
};

test();