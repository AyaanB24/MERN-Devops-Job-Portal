const Company = require('../models/Company');
const asyncHandler = require('../utils/asyncHandler');

exports.createCompany = asyncHandler(async (req, res) => {
  const { companyName, description, website } = req.body;
  
  // Check if recruiter already has a company
  const existingCompany = await Company.findOne({ owner: req.user.id });
  if (existingCompany) {
    return res.status(400).json({ 
      success: false, 
      message: 'You already have a company. A recruiter can only own one company.',
      data: { existingCompany }
    });
  }
  
  const company = await Company.create({
    companyName,
    description,
    website,
    owner: req.user.id
  });
  res.status(201).json({ success: true, data: company });
});

exports.getCompanies = asyncHandler(async (req, res) => {
  const companies = await Company.find({ owner: req.user.id });
  res.status(200).json({ success: true, data: companies });
});

exports.updateCompany = asyncHandler(async (req, res) => {
  let company = await Company.findById(req.params.id);
  if (!company) {
    return res.status(404).json({ success: false, message: 'Company not found' });
  }
  if (company.owner.toString() !== req.user.id) {
    return res.status(403).json({ success: false, message: 'Not authorized to update this company' });
  }
  company = await Company.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  res.status(200).json({ success: true, data: company });
});

exports.deleteCompany = asyncHandler(async (req, res) => {
  const company = await Company.findById(req.params.id);
  if (!company) {
    return res.status(404).json({ success: false, message: 'Company not found' });
  }
  if (company.owner.toString() !== req.user.id) {
    return res.status(403).json({ success: false, message: 'Not authorized to delete this company' });
  }
  await company.deleteOne();
  res.status(200).json({ success: true, message: 'Company deleted' });
});
