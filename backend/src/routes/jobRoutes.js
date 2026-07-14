const express = require('express');
const { createJob, getJobs, getJobById, updateJob, deleteJob } = require('../controllers/jobController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { validateCreateJob, validateUpdateJob } = require('../validators/jobValidator');

const router = express.Router();

router.route('/')
  .post(protect, authorize('recruiter'), validateCreateJob, createJob)
  .get(getJobs); // Public route

router.route('/:id')
  .get(getJobById) // Public route
  .put(protect, authorize('recruiter'), validateUpdateJob, updateJob)
  .delete(protect, authorize('recruiter', 'admin'), deleteJob);

module.exports = router;
