const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    company: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      maxlength: [100, 'Company name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Job description is required'],
      trim: true,
      maxlength: [3000, 'Description cannot exceed 3000 characters'],
    },
    type: {
      type: String,
      enum: ['full-time', 'part-time', 'internship', 'contract', 'remote'],
      required: [true, 'Job type is required'],
    },
    location: {
      type: String,
      trim: true,
      default: 'Remote',
    },
    salary: {
      type: String,
      trim: true,
      default: '',
    },
    skills: {
      type: [String],
      default: [],
    },
    applyLink: {
      type: String,
      trim: true,
      required: [true, 'Apply link is required'],
    },
    deadline: {
      type: Date,
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    savedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    isApproved: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

jobSchema.index({ postedBy: 1 });
jobSchema.index({ isApproved: 1 });
jobSchema.index({ type: 1 });
jobSchema.index({ title: 'text', company: 'text' });

module.exports = mongoose.model('Job', jobSchema);