const mongoose = require('mongoose');
const User = require('../src/models/User');
const Job = require('../src/models/Job');
const Application = require('../src/models/Application');

const test = async () => {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/jobportal');
        console.log('MongoDB Connected.');

        // 1. Fetch existing candidate and job
        const candidate = await User.findOne({ role: 'candidate' });
        const job = await Job.findOne();

        if (!candidate || !job) {
            console.error('❌ No candidate or job found. Run Phase 8 test first.');
            return;
        }

        // 2. Apply to a job (should SUCCEED)
        const application = await Application.create({
            candidate: candidate._id,
            job: job._id,
            coverLetter: 'I am very passionate about this role.',
        });
        console.log('✅ Application submitted:', application.status);

        // 3. Try applying again (should FAIL - duplicate index)
        try {
            await Application.create({
                candidate: candidate._id,
                job: job._id,
            });
        } catch (err) {
            console.log('✅ Duplicate application blocked by compound unique index.');
        }

        // 4. Accept the candidate
        application.status = 'accepted';
        await application.save();
        console.log('✅ Status updated to:', application.status);

        // 5. Populate candidate and job details
        const populated = await Application.findById(application._id)
            .populate('candidate', 'name email')
            .populate('job', 'title location');

        console.log('✅ Candidate:', populated.candidate.name);
        console.log('✅ Job:', populated.job.title);

    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        await mongoose.connection.close();
    }
};

test();