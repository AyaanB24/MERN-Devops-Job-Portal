const express = require('express');
const { createJob, getJobs, getJobById, updateJob, deleteJob } = require('../controllers/jobController');
const { protect, optionalAuth } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { validateCreateJob, validateUpdateJob } = require('../validators/jobValidator');

const router = express.Router();

router.route('/')
  .post(protect, authorize('recruiter'), validateCreateJob, createJob)
  .get(optionalAuth, getJobs); // Public route, but authenticate if token provided

router.route('/:id')
  .get(protect, getJobById) // Protected route - recruiter isolation
  .put(protect, authorize('recruiter'), validateUpdateJob, updateJob)
  .delete(protect, authorize('recruiter', 'admin'), deleteJob);

module.exports = router;
