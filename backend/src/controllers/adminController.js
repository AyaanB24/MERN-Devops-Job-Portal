const adminService = require('../services/adminService');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

exports.getAnalytics = asyncHandler(async (req, res) => {
  const data = await adminService.getDashboardAnalytics();
  res.status(200).json({ success: true, data });
});

exports.getUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select('-password');
  res.status(200).json({ success: true, data: users });
});

exports.deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  
  await user.deleteOne();
  res.status(200).json({ success: true, message: 'User deleted' });
});
