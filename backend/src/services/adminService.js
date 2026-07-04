const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');

/**
 * Fetches dashboard analytics metrics for the admin panel.
 * Uses parallel Promise.all execution to run all database queries simultaneously,
 * minimizing total response time.
 *
 * @returns {Promise<Object>} - Object containing all dashboard metrics.
 */
const getDashboardAnalytics = async () => {
  // 1. Run all aggregation queries in parallel for maximum efficiency
  const [
    totalUsers,
    totalRecruiters,
    totalCandidates,
    totalJobs,
    totalActiveJobs,
    totalApplications,
    applicationsByStatus,
    recentJobs,
  ] = await Promise.all([
    // Count all registered users
    User.countDocuments(),

    // Count only recruiter-role users
    User.countDocuments({ role: 'recruiter' }),

    // Count only candidate-role users
    User.countDocuments({ role: 'candidate' }),

    // Count all job listings
    Job.countDocuments(),

    // Count only active (live) job listings
    Job.countDocuments({ isActive: true }),

    // Count total applications submitted across the platform
    Application.countDocuments(),

    // Group applications by status to get per-status counts
    Application.aggregate([
      {
        $group: {
          _id: '$status',       // Group by the status field value
          count: { $sum: 1 },   // Sum 1 for each document in the group
        },
      },
    ]),

    // Fetch 5 most recently posted job listings
    Job.find({ isActive: true })
      .sort({ createdAt: -1 }) // Sort in descending order (newest first)
      .limit(5)
      .populate('company', 'companyName logo') // Attach company name for display
      .select('title location salary experience createdAt'),
  ]);

  // 2. Transform applicationsByStatus array into a readable key-value map
  // Input:  [{ _id: 'pending', count: 12 }, { _id: 'accepted', count: 5 }]
  // Output: { pending: 12, accepted: 5, rejected: 0 }
  const statusMap = { pending: 0, accepted: 0, rejected: 0 };
  applicationsByStatus.forEach(({ _id, count }) => {
    statusMap[_id] = count;
  });

  // 3. Return the consolidated analytics payload
  return {
    users: {
      total: totalUsers,
      recruiters: totalRecruiters,
      candidates: totalCandidates,
    },
    jobs: {
      total: totalJobs,
      active: totalActiveJobs,
      inactive: totalJobs - totalActiveJobs,
    },
    applications: {
      total: totalApplications,
      byStatus: statusMap,
    },
    recentJobs,
  };
};

module.exports = {
  getDashboardAnalytics,
};
