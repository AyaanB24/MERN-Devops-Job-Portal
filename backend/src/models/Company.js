const mongoose = require('mongoose');

const companySchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      required: [true, 'Company name is required'],
      unique: true,
      trim: true,
      index: true, // Optimizes search queries by name
      maxlength: [100, 'Company name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    website: {
      type: String,
      trim: true,
      match: [
        /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
        'Please provide a valid website URL',
      ],
    },
    logo: {
      type: String,
      default: '', // Store secure URL to cloud storage (e.g., Cloudinary)
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Company owner is required'],
      unique: true, // Ensures 1 recruiter can only have 1 company
      index: true, // Optimizes lookup for companies owned by specific users
    },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt fields
  }
);

const Company = mongoose.model('Company', companySchema);

module.exports = Company;
