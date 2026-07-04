const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
      index: true, // Optimizes text search queries by title
      maxlength: [100, 'Job title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Job description is required'],
      trim: true,
      maxlength: [5000, 'Description cannot exceed 5000 characters'],
    },
    salary: {
      type: Number,
      required: [true, 'Salary is required'],
      min: [0, 'Salary cannot be negative'],
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
      index: true, // Optimizes filtering jobs by location
    },
    experience: {
      type: String,
      required: [true, 'Experience level is required'],
      enum: {
        values: ['0-1 years', '1-3 years', '3-5 years', '5-10 years', '10+ years'],
        message: '{VALUE} is not a valid experience range',
      },
    },
    jobType: {
      type: String,
      enum: {
        values: ['Full-time', 'Part-time', 'Contract', 'Internship', 'Remote'],
        message: '{VALUE} is not a valid job type',
      },
      default: 'Full-time',
    },
    skills: {
      type: [String],
      default: [], // List of required skills for the job position
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: [true, 'Company reference is required'],
      index: true, // Optimizes fetching all jobs under a specific company
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Job creator reference is required'],
      index: true, // Optimizes fetching all jobs posted by a specific recruiter
    },
    isActive: {
      type: Boolean,
      default: true, // Allows soft-disabling a job listing without deleting it
      index: true,
    },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt fields
  }
);

// Compound text index to enable full-text search across title and description
jobSchema.index({ title: 'text', description: 'text' });

const Job = mongoose.model('Job', jobSchema);

module.exports = Job;
