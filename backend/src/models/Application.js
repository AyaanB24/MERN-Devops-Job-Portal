const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Candidate reference is required'],
      index: true, // Optimizes fetching all applications by a specific candidate
    },
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: [true, 'Job reference is required'],
      index: true, // Optimizes fetching all applications for a specific job
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'accepted', 'rejected'],
        message: '{VALUE} is not a valid application status',
      },
      default: 'pending',
      index: true, // Optimizes filtering applications by status
    },
    resume: {
      type: String,
      default: '', // URL of resume submitted with this specific application
    },
    coverLetter: {
      type: String,
      default: '',
      trim: true,
      maxlength: [2000, 'Cover letter cannot exceed 2000 characters'],
    },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt fields
  }
);

// Compound unique index to prevent a candidate from applying to the same job twice
applicationSchema.index({ candidate: 1, job: 1 }, { unique: true });

const Application = mongoose.model('Application', applicationSchema);

module.exports = Application;
