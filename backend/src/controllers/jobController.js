const Job = require('../models/Job');
const Company = require('../models/Company');
const asyncHandler = require('../utils/asyncHandler');

exports.createJob = asyncHandler(async (req, res) => {
  // 1. Set the job creator to the current user
  req.body.createdBy = req.user.id;
  
  // 2. Verify the company exists and belongs to the recruiter
  const company = await Company.findById(req.body.company);
  if (!company) {
    return res.status(404).json({ success: false, message: 'Company not found' });
  }
  
  // 3. SECURITY: Only the company owner can post jobs for that company
  if (company.owner.toString() !== req.user.id) {
    return res.status(403).json({ success: false, message: 'You can only post jobs for companies you own' });
  }
  
  // 4. Create the job
  const job = await Job.create(req.body);
  res.status(201).json({ success: true, data: job });
});

exports.getJobs = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  let query = {};
  
  // Check if client explicitly requests to filter by their company (manage mode)
  // by passing manageMode=true query parameter
  const manageMode = req.query.manageMode === 'true';
  
  // If in manage mode and user is a recruiter, ONLY show their jobs
  if (manageMode && req.user && req.user.role === 'recruiter') {
    // Get all companies owned by this recruiter
    const recruiterCompanies = await Company.find({ owner: req.user.id }, '_id');
    const companyIds = recruiterCompanies.map(c => c._id);
    
    // Only show jobs from their companies
    query.company = { $in: companyIds };
  }
  // Otherwise, show all jobs (public browsing)
  // req.user might be set from optionalAuth, but we ignore it for public browsing

  const jobs = await Job.find(query)
    .populate('company', 'companyName')
    .skip(skip)
    .limit(limit);
  
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
  
  // If user is recruiter, verify they own the company
  if (req.user && req.user.role === 'recruiter') {
    const company = await Company.findById(job.company._id);
    if (company.owner.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this job' });
    }
  }
  
  res.status(200).json({ success: true, data: job });
});

exports.updateJob = asyncHandler(async (req, res) => {
  let job = await Job.findById(req.params.id);
  if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
  
  // IDOR Protection: verify company ownership
  const company = await Company.findById(job.company);
  if (!company) return res.status(404).json({ success: false, message: 'Company not found' });
  
  if (company.owner.toString() !== req.user.id) {
    return res.status(403).json({ success: false, message: 'Not authorized to update this job' });
  }
  
  job = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  res.status(200).json({ success: true, data: job });
});

exports.deleteJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);
  if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
  
  // IDOR Protection: verify company ownership (unless admin)
  if (req.user.role !== 'admin') {
    const company = await Company.findById(job.company);
    if (!company) return res.status(404).json({ success: false, message: 'Company not found' });
    
    if (company.owner.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this job' });
    }
  }
  
  await Job.findOneAndDelete({ _id: req.params.id });
  res.status(200).json({ success: true, message: 'Job deleted' });
});
