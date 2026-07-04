const mongoose = require('mongoose');

const savedJobSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      index: true, // Optimizes fetching all saved jobs for a specific user
    },
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: [true, 'Job reference is required'],
      index: true, // Optimizes fetching all users who saved a specific job
    },
    savedAt: {
      type: Date,
      default: Date.now, // Automatically captures the time the job was bookmarked
    },
  },
  {
    timestamps: false, // savedAt manually tracks the relevant timestamp; createdAt/updatedAt not needed
  }
);

// Compound unique index to prevent a user from saving the same job more than once
savedJobSchema.index({ user: 1, job: 1 }, { unique: true });

const SavedJob = mongoose.model('SavedJob', savedJobSchema);

module.exports = SavedJob;
