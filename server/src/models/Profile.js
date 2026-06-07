const mongoose = require('mongoose');

// ─── Sub-schemas ───────────────────────────────────────────────

const educationSchema = new mongoose.Schema({
  institution: {
    type: String,
    required: true,
    trim: true,
  },
  degree: {
    type: String,
    required: true,
    trim: true,
  },
  fieldOfStudy: {
    type: String,
    trim: true,
  },
  startYear: {
    type: Number,
  },
  endYear: {
    type: Number,
  },
  isCurrentlyStudying: {
    type: Boolean,
    default: false,
  },
}, { _id: true });

const experienceSchema = new mongoose.Schema({
  company: {
    type: String,
    required: true,
    trim: true,
  },
  position: {
    type: String,
    required: true,
    trim: true,
  },
  location: {
    type: String,
    trim: true,
  },
  startDate: {
    type: Date,
  },
  endDate: {
    type: Date,
  },
  isCurrentRole: {
    type: Boolean,
    default: false,
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500,
  },
}, { _id: true });

const socialLinksSchema = new mongoose.Schema({
  linkedin: { type: String, trim: true, default: '' },
  github:   { type: String, trim: true, default: '' },
  twitter:  { type: String, trim: true, default: '' },
  website:  { type: String, trim: true, default: '' },
}, { _id: false });

// ─── Main Profile Schema ───────────────────────────────────────
const profileSchema = new mongoose.Schema(
  {
    // Reference to the User document
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true, // one profile per user
    },

    // ── Common Fields (all roles) ──
    bio: {
      type: String,
      trim: true,
      maxlength: [500, 'Bio cannot exceed 500 characters'],
      default: '',
    },
    location: {
      type: String,
      trim: true,
      default: '',
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    skills: {
      type: [String],
      default: [],
      validate: {
        validator: (arr) => arr.length <= 20,
        message: 'Cannot have more than 20 skills',
      },
    },
    education: {
      type: [educationSchema],
      default: [],
    },
    socialLinks: {
      type: socialLinksSchema,
      default: () => ({}),
    },

    // ── Student-specific Fields ──
    interests: {
      type: [String],
      default: [],
    },
    careerGoal: {
      type: String,
      trim: true,
      maxlength: 300,
      default: '',
    },
    expectedGraduationYear: {
      type: Number,
    },

    // ── Alumni-specific Fields ──
    graduationYear: {
      type: Number,
    },
    currentCompany: {
      type: String,
      trim: true,
      default: '',
    },
    currentPosition: {
      type: String,
      trim: true,
      default: '',
    },
    industry: {
      type: String,
      trim: true,
      default: '',
    },
    experience: {
      type: [experienceSchema],
      default: [],
    },

    // ── Mentor-specific Fields ──
    expertise: {
      type: [String],
      default: [],
    },
    yearsOfExperience: {
      type: Number,
      min: 0,
      max: 50,
    },
    availability: {
      type: String,
      enum: ['available', 'busy', 'unavailable'],
      default: 'available',
    },
    sessionType: {
      type: [String],
      enum: ['one-on-one', 'group', 'async'],
      default: ['one-on-one'],
    },
    languages: {
      type: [String],
      default: ['English'],
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalRatings: {
      type: Number,
      default: 0,
    },

    // ── Profile Completeness ──
    isProfileComplete: {
      type: Boolean,
      default: false,
    },
    profileCompleteness: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
  },
  {
    timestamps: true,
  }
);

// ─── Calculate Profile Completeness ───────────────────────────
// Runs before every save and updates the completeness percentage
profileSchema.pre('save', function () {
  let score = 0;

  if (this.bio && this.bio.length > 20) score += 20;
  if (this.location) score += 10;
  if (Array.isArray(this.skills) && this.skills.length >= 3) score += 20;
  if (Array.isArray(this.education) && this.education.length >= 1) score += 20;

  if (
    this.socialLinks &&
    (this.socialLinks.linkedin || this.socialLinks.github)
  ) {
    score += 10;
  }

  this.profileCompleteness = score;
  this.isProfileComplete = score >= 60;
});

// ─── Indexes ───────────────────────────────────────────────────
profileSchema.index({ skills: 1 });
profileSchema.index({ expertise: 1 });
profileSchema.index({ availability: 1 });

module.exports = mongoose.model('Profile', profileSchema);