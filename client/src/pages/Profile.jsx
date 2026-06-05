import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import {
  Camera, MapPin, Briefcase, GraduationCap,
  Plus, Save, Link as LinkIcon,
  Star, Clock, Globe,
} from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardLayout from '../components/layout/DashboardLayout';
import Avatar from '../components/common/Avatar';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { PageLoader } from '../components/common/Loader';
import userService from '../api/userService';
import useAuthStore from '../store/authStore';

// ─── Skill Tag Input ───────────────────────────────────────────
const SkillInput = ({ skills, onChange }) => {
  const [input, setInput] = useState('');

  const addSkill = () => {
    const trimmed = input.trim();
    if (trimmed && !skills.includes(trimmed) && skills.length < 20) {
      onChange([...skills, trimmed]);
      setInput('');
    }
  };

  const removeSkill = (skill) => {
    onChange(skills.filter((s) => s !== skill));
  };

  return (
    <div>
      <div className="flex gap-2 mb-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') { e.preventDefault(); addSkill(); }
          }}
          placeholder="Type a skill and press Enter"
          className="input-field flex-1"
          maxLength={50}
        />
        <Button type="button" variant="secondary" onClick={addSkill} size="md">
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {skills.map((skill) => (
          <span
            key={skill}
            className="inline-flex items-center gap-1 bg-primary-50 text-primary-700 px-3 py-1 rounded-full text-sm font-medium"
          >
            {skill}
            <button
              type="button"
              onClick={() => removeSkill(skill)}
              className="hover:text-red-500 transition-colors ml-1"
            >
              ×
            </button>
          </span>
        ))}
        {skills.length === 0 && (
          <p className="text-sm text-gray-400">No skills added yet</p>
        )}
      </div>
    </div>
  );
};

// ─── Profile Completeness Bar ──────────────────────────────────
const CompletenessBar = ({ percentage }) => (
  <div className="card mb-6">
    <div className="flex items-center justify-between mb-2">
      <span className="text-sm font-medium text-gray-700">Profile Completeness</span>
      <span className="text-sm font-bold text-primary-600">{percentage}%</span>
    </div>
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div
        className="bg-primary-600 h-2 rounded-full transition-all duration-500"
        style={{ width: `${percentage}%` }}
      />
    </div>
    {percentage < 60 && (
      <p className="text-xs text-gray-500 mt-2">
        Complete your profile to unlock full platform features
      </p>
    )}
  </div>
);

// ─── Main Profile Page ─────────────────────────────────────────
const Profile = () => {
  const { user, updateUser } = useAuthStore();
  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [skills, setSkills] = useState([]);
  const [expertise, setExpertise] = useState([]);
  const [interests, setInterests] = useState([]);
  const fileInputRef = useRef(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  // Load profile on mount
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await userService.getMe();
        const { user: userData, profile } = response.data;
        setProfileData({ user: userData, profile });
        setSkills(profile.skills || []);
        setExpertise(profile.expertise || []);
        setInterests(profile.interests || []);

        // Pre-fill form with existing data
        reset({
          name: userData.name,
          bio: profile.bio,
          location: profile.location,
          phone: profile.phone,
          careerGoal: profile.careerGoal,
          currentCompany: profile.currentCompany,
          currentPosition: profile.currentPosition,
          industry: profile.industry,
          graduationYear: profile.graduationYear,
          expectedGraduationYear: profile.expectedGraduationYear,
          yearsOfExperience: profile.yearsOfExperience,
          availability: profile.availability,
          'socialLinks.linkedin': profile.socialLinks?.linkedin,
          'socialLinks.github': profile.socialLinks?.github,
          'socialLinks.twitter': profile.socialLinks?.twitter,
          'socialLinks.website': profile.socialLinks?.website,
        });
      } catch {
        toast.error('Failed to load profile');
      } finally {
        setIsLoading(false);
      }
    };
    loadProfile();
  }, [reset]);

  // Handle photo upload
  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be under 2MB');
      return;
    }

    const formData = new FormData();
    formData.append('avatar', file);
    setIsUploadingPhoto(true);

    try {
      const response = await userService.updatePhoto(formData);
      const updatedUser = response.data.user;
      updateUser({ avatar: updatedUser.avatar });
      setProfileData((prev) => ({ ...prev, user: updatedUser }));
      toast.success('Profile photo updated!');
    } catch {
      toast.error('Failed to upload photo');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  // Handle form save
  const onSubmit = async (data) => {
    setIsSaving(true);
    try {
      const payload = {
        ...data,
        skills,
        expertise,
        interests,
        socialLinks: {
          linkedin: data['socialLinks.linkedin'] || '',
          github:   data['socialLinks.github'] || '',
          twitter:  data['socialLinks.twitter'] || '',
          website:  data['socialLinks.website'] || '',
        },
      };

      // Remove flat social link keys
      delete payload['socialLinks.linkedin'];
      delete payload['socialLinks.github'];
      delete payload['socialLinks.twitter'];
      delete payload['socialLinks.website'];

      const response = await userService.updateMe(payload);
      const { user: updatedUser, profile: updatedProfile } = response.data;

      setProfileData({ user: updatedUser, profile: updatedProfile });
      updateUser({ name: updatedUser.name, avatar: updatedUser.avatar });
      toast.success('Profile saved successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save profile');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <PageLoader />;

  const { profile } = profileData;
  const role = user?.role;

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-500 mt-1">
            Keep your profile updated to get the best connections
          </p>
        </div>

        {/* Completeness Bar */}
        <CompletenessBar percentage={profile?.profileCompleteness || 0} />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

          {/* ── Photo + Basic Info ── */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Basic Information
            </h2>

            {/* Photo Upload */}
            <div className="flex items-center gap-6 mb-6">
              <div className="relative">
                <Avatar
                  src={profileData?.user?.avatar}
                  name={user?.name}
                  size="2xl"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingPhoto}
                  className="absolute bottom-0 right-0 bg-primary-600 text-white rounded-full p-2 hover:bg-primary-700 transition-colors shadow-md"
                >
                  <Camera className="h-4 w-4" />
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handlePhotoUpload}
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                />
              </div>
              <div>
                <p className="font-semibold text-gray-900">{user?.name}</p>
                <Badge variant={role} className="mt-1">
                  {role?.charAt(0).toUpperCase() + role?.slice(1)}
                </Badge>
                <p className="text-xs text-gray-400 mt-2">
                  JPG, PNG or WebP · Max 2MB
                </p>
                {isUploadingPhoto && (
                  <p className="text-xs text-primary-600 mt-1">Uploading...</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                placeholder="Your full name"
                error={errors.name?.message}
                {...register('name', { required: 'Name is required' })}
              />
              <Input
                label="Location"
                placeholder="City, Country"
                icon={MapPin}
                {...register('location')}
              />
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Bio
                </label>
                <textarea
                  placeholder="Tell others about yourself..."
                  rows={3}
                  className="input-field resize-none"
                  maxLength={500}
                  {...register('bio')}
                />
              </div>
            </div>
          </div>

          {/* ── Skills ── */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">
              Skills
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              Add up to 20 skills. Press Enter after each.
            </p>
            <SkillInput skills={skills} onChange={setSkills} />
          </div>

          {/* ── Student-specific Section ── */}
          {role === 'student' && (
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                <GraduationCap className="inline h-5 w-5 mr-2 text-indigo-500" />
                Academic Details
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Expected Graduation Year"
                  type="number"
                  placeholder="2026"
                  {...register('expectedGraduationYear')}
                />
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Career Goal
                  </label>
                  <textarea
                    placeholder="What kind of role or career are you aiming for?"
                    rows={2}
                    className="input-field resize-none"
                    maxLength={300}
                    {...register('careerGoal')}
                  />
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Interests
                </label>
                <SkillInput
                  skills={interests}
                  onChange={setInterests}
                />
              </div>
            </div>
          )}

          {/* ── Alumni-specific Section ── */}
          {role === 'alumni' && (
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                <Briefcase className="inline h-5 w-5 mr-2 text-sky-500" />
                Professional Details
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Current Company"
                  placeholder="Google, Flipkart..."
                  icon={Briefcase}
                  {...register('currentCompany')}
                />
                <Input
                  label="Current Position"
                  placeholder="Software Engineer..."
                  {...register('currentPosition')}
                />
                <Input
                  label="Industry"
                  placeholder="Technology, Finance..."
                  {...register('industry')}
                />
                <Input
                  label="Graduation Year"
                  type="number"
                  placeholder="2020"
                  {...register('graduationYear')}
                />
              </div>
            </div>
          )}

          {/* ── Mentor-specific Section ── */}
          {role === 'mentor' && (
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                <Star className="inline h-5 w-5 mr-2 text-emerald-500" />
                Mentorship Details
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <Input
                  label="Current Company"
                  placeholder="Google, Amazon..."
                  icon={Briefcase}
                  {...register('currentCompany')}
                />
                <Input
                  label="Current Position"
                  placeholder="Senior Engineer..."
                  {...register('currentPosition')}
                />
                <Input
                  label="Years of Experience"
                  type="number"
                  placeholder="8"
                  icon={Clock}
                  {...register('yearsOfExperience')}
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Availability
                  </label>
                  <select className="input-field" {...register('availability')}>
                    <option value="available">🟢 Available</option>
                    <option value="busy">🟡 Busy</option>
                    <option value="unavailable">🔴 Unavailable</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Areas of Expertise
                </label>
                <SkillInput skills={expertise} onChange={setExpertise} />
              </div>
            </div>
          )}

          {/* ── Social Links ── */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              <Globe className="inline h-5 w-5 mr-2 text-gray-500" />
              Social Links
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="LinkedIn"
                placeholder="https://linkedin.com/in/yourprofile"
                icon={LinkIcon}
                {...register('socialLinks.linkedin')}
              />
              <Input
                label="GitHub"
                placeholder="https://github.com/yourusername"
                icon={LinkIcon}
                {...register('socialLinks.github')}
              />
              <Input
                label="Twitter / X"
                placeholder="https://twitter.com/yourhandle"
                icon={LinkIcon}
                {...register('socialLinks.twitter')}
              />
              <Input
                label="Personal Website"
                placeholder="https://yourwebsite.com"
                icon={LinkIcon}
                {...register('socialLinks.website')}
              />
            </div>
          </div>

          {/* ── Save Button ── */}
          <div className="flex justify-end pb-8">
            <Button
              type="submit"
              size="lg"
              loading={isSaving}
              className="px-8"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Profile
            </Button>
          </div>

        </form>
      </div>
    </DashboardLayout>
  );
};

export default Profile;