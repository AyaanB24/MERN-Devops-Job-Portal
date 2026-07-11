const express = require('express');
const { createCompany, getCompanies, updateCompany, deleteCompany } = require('../controllers/companyController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const router = express.Router();

router.route('/')
  .post(protect, authorize('recruiter'), createCompany)
  .get(protect, authorize('recruiter'), getCompanies);

router.route('/:id')
  .put(protect, authorize('recruiter'), updateCompany)
  .delete(protect, authorize('recruiter'), deleteCompany);

module.exports = router;
