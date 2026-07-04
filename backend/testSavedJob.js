const mongoose = require('mongoose');
const User = require('./src/models/User');
const Job = require('./src/models/Job');
const SavedJob = require('./src/models/SavedJob');

const test = async () => {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/jobportal');
        console.log('MongoDB Connected.');

        // 1. Fetch existing candidate and job
        const user = await User.findOne({ role: 'candidate' });
        const job = await Job.findOne();

        if (!user || !job) {
            console.error('❌ No candidate or job found. Run Phase 8 test first.');
            return;
        }

        // 2. Save the job (should SUCCEED)
        const saved = await SavedJob.create({
            user: user._id,
            job: job._id,
        });
        console.log('✅ Job saved at:', saved.savedAt);

        // 3. Try saving again (should FAIL - duplicate index)
        try {
            await SavedJob.create({
                user: user._id,
                job: job._id,
            });
        } catch (err) {
            console.log('✅ Duplicate save blocked by compound unique index.');
        }

        // 4. Fetch all saved jobs for the user with populated job details
        const savedJobs = await SavedJob.find({ user: user._id })
            .populate('job', 'title location salary');

        console.log(`✅ Saved jobs for ${user.name}:`);
        savedJobs.forEach(s => console.log(' -', s.job.title, '|', s.job.location));

        // 5. Unsave (delete) the bookmark
        await SavedJob.deleteOne({ user: user._id, job: job._id });
        console.log('✅ Job unsaved successfully.');

    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        await mongoose.connection.close();
    }
};

test();