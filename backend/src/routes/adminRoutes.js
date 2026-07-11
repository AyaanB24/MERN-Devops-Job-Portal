const express = require('express');
const { getAnalytics, getUsers, deleteUser } = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const router = express.Router();

// Apply auth and admin role to all routes in this file
router.use(protect, authorize('admin'));

router.get('/analytics', getAnalytics);
router.route('/users')
  .get(getUsers);
router.route('/users/:id')
  .delete(deleteUser);

module.exports = router;
