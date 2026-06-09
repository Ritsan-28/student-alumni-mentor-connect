import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Link as LinkIcon, Briefcase } from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardLayout from '../components/layout/DashboardLayout';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import jobService from '../api/jobService';

const CreateJob = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [skillInput, setSkillInput] = useState('');
  const [skills, setSkills] = useState([]);
  const [form, setForm] = useState({
    title: '',
    company: '',
    description: '',
    type: 'internship',
    location: 'Remote',
    salary: '',
    applyLink: '',
    deadline: '',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const addSkill = () => {
    const trimmed = skillInput.trim();
    if (trimmed && !skills.includes(trimmed) && skills.length < 15) {
      setSkills([...skills, trimmed]);
      setSkillInput('');
    }
  };

  const removeSkill = (skill) => setSkills(skills.filter((s) => s !== skill));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.company || !form.description || !form.applyLink) {
      toast.error('Please fill all required fields');
      return;
    }

    setIsLoading(true);
    try {
      await jobService.createJob({ ...form, skills });
      toast.success('Job posted! Pending admin approval.');
      navigate('/jobs');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to post job');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Post a Job</h1>
          <p className="text-gray-500 mt-1">
            Share an opportunity with students and alumni
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Job Details */}
          <div className="card space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Job Details</h2>

            <Input
              label="Job Title"
              name="title"
              placeholder="Frontend Developer Intern"
              value={form.title}
              onChange={handleChange}
              required
            />

            <Input
              label="Company Name"
              name="company"
              placeholder="Flipkart, Google..."
              icon={Briefcase}
              value={form.company}
              onChange={handleChange}
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Job Type <span className="text-red-500">*</span>
              </label>
              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                className="input-field"
              >
                <option value="full-time">💼 Full Time</option>
                <option value="part-time">⏰ Part Time</option>
                <option value="internship">🎓 Internship</option>
                <option value="contract">📋 Contract</option>
                <option value="remote">🌐 Remote</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                placeholder="Describe the role, responsibilities, and requirements..."
                rows={5}
                className="input-field resize-none"
                value={form.description}
                onChange={handleChange}
                maxLength={3000}
                required
              />
              <p className="text-xs text-gray-400 mt-1">
                {form.description.length}/3000
              </p>
            </div>
          </div>

          {/* Location & Compensation */}
          <div className="card space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Location & Compensation</h2>

            <Input
              label="Location"
              name="location"
              placeholder="Bangalore / Remote"
              icon={MapPin}
              value={form.location}
              onChange={handleChange}
            />

            <Input
              label="Salary / Stipend"
              name="salary"
              placeholder="₹15,000/month or Competitive"
              value={form.salary}
              onChange={handleChange}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Application Deadline
              </label>
              <input
                type="date"
                name="deadline"
                value={form.deadline}
                onChange={handleChange}
                className="input-field"
              />
            </div>

            <Input
              label="Apply Link"
              name="applyLink"
              placeholder="https://company.com/careers/apply"
              icon={LinkIcon}
              value={form.applyLink}
              onChange={handleChange}
              required
            />
          </div>

          {/* Skills */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Required Skills
            </h2>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') { e.preventDefault(); addSkill(); }
                }}
                placeholder="Add a skill and press Enter"
                className="input-field flex-1"
              />
              <Button type="button" variant="secondary" onClick={addSkill}>
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1 bg-primary-50 text-primary-700 px-3 py-1 rounded-full text-sm"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkill(skill)}
                    className="hover:text-red-500 ml-1"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-3 justify-end pb-8">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/jobs')}
            >
              Cancel
            </Button>
            <Button type="submit" loading={isLoading}>
              Post Job
            </Button>
          </div>

        </form>
      </div>
    </DashboardLayout>
  );
};

export default CreateJob;