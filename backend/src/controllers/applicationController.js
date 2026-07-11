const Application = require('../models/Application');
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
    query.candidate = req.user.id;
  } else if (req.query.job) {
    query.job = req.query.job; // Recruiters fetch by job ID
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

  application.status = status;
  await application.save();
  res.status(200).json({ success: true, data: application });
});
