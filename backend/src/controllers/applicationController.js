const Application = require('../models/Application');
const Job = require('../models/Job');
const Company = require('../models/Company');
const asyncHandler = require('../utils/asyncHandler');

exports.createApplication = asyncHandler(async (req, res) => {
  const { job, coverLetter } = req.body;
  const application = await Application.create({
    candidate: req.user.id,
    job,
    coverLetter
  });
  res.status(201).json({ success: true, data: application });
});

exports.getApplications = asyncHandler(async (req, res) => {
  let query = {};
  
  if (req.user.role === 'candidate') {
    // Candidates see only their own applications
    query.candidate = req.user.id;
  } else if (req.user.role === 'recruiter') {
    // Recruiters can only see applications for jobs from their companies
    if (req.query.job) {
      // If filtering by specific job, verify ownership
      const job = await Job.findById(req.query.job);
      if (!job) {
        return res.status(404).json({ success: false, message: 'Job not found' });
      }
      
      const company = await Company.findById(job.company);
      if (!company || company.owner.toString() !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Not authorized to view applications for this job' });
      }
      
      query.job = req.query.job;
    } else {
      // Get all jobs from recruiter's companies
      const recruiterCompanies = await Company.find({ owner: req.user.id }, '_id');
      const companyIds = recruiterCompanies.map(c => c._id);
      const recruiterJobs = await Job.find({ company: { $in: companyIds } }, '_id');
      const jobIds = recruiterJobs.map(j => j._id);
      
      query.job = { $in: jobIds };
    }
  }

  const applications = await Application.find(query)
    .populate('candidate', 'name email')
    .populate('job', 'title');
    
  res.status(200).json({ success: true, data: applications });
});

exports.updateApplicationStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const application = await Application.findById(req.params.id);
  if (!application) return res.status(404).json({ success: false, message: 'Application not found' });

  // Verify recruiter ownership before allowing status update
  if (req.user.role === 'recruiter') {
    const job = await Job.findById(application.job);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
    
    const company = await Company.findById(job.company);
    if (!company || company.owner.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this application' });
    }
  }

  application.status = status;
  await application.save();
  res.status(200).json({ success: true, data: application });
});
