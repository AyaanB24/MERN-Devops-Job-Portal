const mongoose = require('mongoose');
// Explicitly require all models referenced via populate() to register their schemas
require('./src/models/Company');
const { getDashboardAnalytics } = require('./src/services/adminService');


const test = async () => {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/jobportal');
        console.log('MongoDB Connected.');

        const analytics = await getDashboardAnalytics();

        console.log('\n📊 Admin Dashboard Analytics');
        console.log('================================');
        console.log('👥 Users');
        console.log('   Total:', analytics.users.total);
        console.log('   Recruiters:', analytics.users.recruiters);
        console.log('   Candidates:', analytics.users.candidates);

        console.log('\n💼 Jobs');
        console.log('   Total:', analytics.jobs.total);
        console.log('   Active:', analytics.jobs.active);
        console.log('   Inactive:', analytics.jobs.inactive);

        console.log('\n📋 Applications');
        console.log('   Total:', analytics.applications.total);
        console.log('   By Status:', analytics.applications.byStatus);

        console.log('\n🆕 Recent Jobs');
        analytics.recentJobs.forEach(j => {
            console.log(`   - ${j.title} | ${j.location} | ₹${j.salary}`);
        });

        console.log('\n✅ Analytics fetched successfully.');
    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        await mongoose.connection.close();
    }
};

test();