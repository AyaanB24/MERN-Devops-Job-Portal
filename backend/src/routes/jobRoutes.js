const express = require('express');
const { createJob, getJobs, getJobById, updateJob, deleteJob } = require('../controllers/jobController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const router = express.Router();

router.route('/')
  .post(protect, authorize('recruiter'), createJob)
  .get(getJobs); // Public route

router.route('/:id')
  .get(getJobById) // Public route
  .put(protect, authorize('recruiter'), updateJob)
  .delete(protect, authorize('recruiter', 'admin'), deleteJob);

module.exports = router;
