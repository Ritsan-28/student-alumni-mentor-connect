const Job = require('../../models/Job');
const ApiError = require('../../utils/ApiError');

// ─── Create Job ────────────────────────────────────────────────
const createJob = async (userId, role, data) => {
  const isApproved = role === 'admin';

  const job = await Job.create({
    ...data,
    postedBy: userId,
    isApproved,
  });

  return job;
};

// ─── Get All Jobs ──────────────────────────────────────────────
const getJobs = async ({ type, search, page = 1, limit = 10 }) => {
  const query = { isApproved: true, isActive: true };

  if (type) query.type = type;

  if (search) {
    query.$or = [
      { title:   { $regex: search, $options: 'i' } },
      { company: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (page - 1) * limit;

  const jobs = await Job.find(query)
    .populate('postedBy', 'name avatar role')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  const total = await Job.countDocuments(query);

  return {
    jobs,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
    },
  };
};

// ─── Get Job By ID ─────────────────────────────────────────────
const getJobById = async (jobId) => {
  const job = await Job.findById(jobId)
    .populate('postedBy', 'name avatar role');

  if (!job) throw new ApiError(404, 'Job not found');
  return job;
};

// ─── Update Job ────────────────────────────────────────────────
const updateJob = async (userId, role, jobId, data) => {
  const job = await Job.findById(jobId);
  if (!job) throw new ApiError(404, 'Job not found');

  const isOwner = job.postedBy.toString() === userId.toString();
  if (!isOwner && role !== 'admin') {
    throw new ApiError(403, 'Not authorized to update this job');
  }

  Object.assign(job, data);
  await job.save();
  return job;
};

// ─── Delete Job ────────────────────────────────────────────────
const deleteJob = async (userId, role, jobId) => {
  const job = await Job.findById(jobId);
  if (!job) throw new ApiError(404, 'Job not found');

  const isOwner = job.postedBy.toString() === userId.toString();
  if (!isOwner && role !== 'admin') {
    throw new ApiError(403, 'Not authorized to delete this job');
  }

  await job.deleteOne();
  return { message: 'Job deleted successfully' };
};

// ─── Toggle Save Job ───────────────────────────────────────────
const toggleSaveJob = async (userId, jobId) => {
  const job = await Job.findById(jobId);
  if (!job) throw new ApiError(404, 'Job not found');

  const isSaved = job.savedBy.some(
    (id) => id.toString() === userId.toString()
  );

  if (isSaved) {
    job.savedBy = job.savedBy.filter(
      (id) => id.toString() !== userId.toString()
    );
    await job.save();
    return { saved: false, message: 'Job removed from saved' };
  }

  job.savedBy.push(userId);
  await job.save();
  return { saved: true, message: 'Job saved successfully' };
};

// ─── Get Saved Jobs ────────────────────────────────────────────
const getSavedJobs = async (userId) => {
  const jobs = await Job.find({
    savedBy: userId,
    isActive: true,
  }).populate('postedBy', 'name avatar role')
    .sort({ createdAt: -1 });

  return jobs;
};

// ─── Get My Posted Jobs ────────────────────────────────────────
const getMyJobs = async (userId) => {
  const jobs = await Job.find({ postedBy: userId })
    .sort({ createdAt: -1 });

  return jobs;
};

// ─── Admin: Get Pending Jobs ───────────────────────────────────
const getPendingJobs = async () => {
  const jobs = await Job.find({ isApproved: false, isActive: true })
    .populate('postedBy', 'name avatar role')
    .sort({ createdAt: -1 });

  return jobs;
};

// ─── Admin: Approve Job ────────────────────────────────────────
const approveJob = async (jobId) => {
  const job = await Job.findById(jobId);
  if (!job) throw new ApiError(404, 'Job not found');

  job.isApproved = true;
  await job.save();
  return job;
};

module.exports = {
  createJob,
  getJobs,
  getJobById,
  updateJob,
  deleteJob,
  toggleSaveJob,
  getSavedJobs,
  getMyJobs,
  getPendingJobs,
  approveJob,
};