const Job = require('../models/Job');
const asyncHandler = require('../utils/asyncHandler');

exports.createJob = asyncHandler(async (req, res) => {
  req.body.createdBy = req.user.id;
  const job = await Job.create(req.body);
  res.status(201).json({ success: true, data: job });
});

exports.getJobs = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  let query = {};
  if (req.query.createdBy) query.createdBy = req.query.createdBy;

  const jobs = await Job.find(query).populate('company', 'companyName').skip(skip).limit(limit);
  const total = await Job.countDocuments(query);
  
  res.status(200).json({ 
    success: true, 
    data: jobs, 
    pagination: { page, totalPages: Math.ceil(total / limit) } 
  });
});

exports.getJobById = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id).populate('company', 'companyName description website');
  if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
  res.status(200).json({ success: true, data: job });
});

exports.updateJob = asyncHandler(async (req, res) => {
  let job = await Job.findById(req.params.id);
  if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
  
  // IDOR Protection: only the owner can update
  if (job.createdBy.toString() !== req.user.id) {
    return res.status(403).json({ success: false, message: 'Not authorized to update this job' });
  }
  
  job = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  res.status(200).json({ success: true, data: job });
});

exports.deleteJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);
  if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
  
  // IDOR Protection: only the owner can delete
  if (job.createdBy.toString() !== req.user.id) {
    return res.status(403).json({ success: false, message: 'Not authorized to delete this job' });
  }
  
  await Job.findOneAndDelete({ _id: req.params.id }); // This triggers the Mongoose hook we added earlier
  res.status(200).json({ success: true, message: 'Job deleted' });
});
