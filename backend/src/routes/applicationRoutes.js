const express = require('express');
const { createApplication, getApplications, updateApplicationStatus } = require('../controllers/applicationController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const router = express.Router();

router.route('/')
  .post(protect, authorize('candidate'), createApplication)
  .get(protect, getApplications); // Candidates and Recruiters can view apps

router.route('/:id/status')
  .put(protect, authorize('recruiter'), updateApplicationStatus);

module.exports = router;
