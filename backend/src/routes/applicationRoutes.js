const express = require('express');
const { createApplication, getApplications, updateApplicationStatus } = require('../controllers/applicationController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/')
  .post(protect, createApplication)
  .get(protect, getApplications);

router.route('/:id/status')
  .put(protect, updateApplicationStatus);

module.exports = router;
