import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Link as LinkIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardLayout from '../components/layout/DashboardLayout';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import eventService from '../api/eventService';

const CreateEvent = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState([]);
  const [form, setForm] = useState({
    title: '',
    description: '',
    type: 'webinar',
    date: '',
    endDate: '',
    location: 'Online',
    link: '',
    maxAttendees: '',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const addTag = () => {
    const trimmed = tagInput.trim().toLowerCase();
    if (trimmed && !tags.includes(trimmed) && tags.length < 10) {
      setTags([...tags, trimmed]);
      setTagInput('');
    }
  };

  const removeTag = (tag) => setTags(tags.filter((t) => t !== tag));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.description || !form.date || !form.type) {
      toast.error('Please fill all required fields');
      return;
    }

    setIsLoading(true);
    try {
      await eventService.createEvent({
        ...form,
        tags,
        maxAttendees: form.maxAttendees ? Number(form.maxAttendees) : 0,
      });
      toast.success('Event created successfully!');
      navigate('/events');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create event');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Create Event</h1>
          <p className="text-gray-500 mt-1">
            Share an event with the community
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Basic Info */}
          <div className="card space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Event Details</h2>

            <Input
              label="Event Title"
              name="title"
              placeholder="Resume Building Workshop"
              value={form.title}
              onChange={handleChange}
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                placeholder="Describe what attendees will learn or experience..."
                rows={4}
                className="input-field resize-none"
                value={form.description}
                onChange={handleChange}
                maxLength={2000}
                required
              />
              <p className="text-xs text-gray-400 mt-1">
                {form.description.length}/2000
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Event Type <span className="text-red-500">*</span>
              </label>
              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                className="input-field"
                required
              >
                <option value="webinar">🎥 Webinar</option>
                <option value="workshop">🛠️ Workshop</option>
                <option value="meetup">🤝 Meetup</option>
                <option value="seminar">📚 Seminar</option>
                <option value="other">📅 Other</option>
              </select>
            </div>
          </div>

          {/* Date & Location */}
          <div className="card space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Date & Location</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Start Date & Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  End Date & Time
                </label>
                <input
                  type="datetime-local"
                  name="endDate"
                  value={form.endDate}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>
            </div>

            <Input
              label="Location"
              name="location"
              placeholder="Online / Venue name"
              icon={MapPin}
              value={form.location}
              onChange={handleChange}
            />

            <Input
              label="Event Link"
              name="link"
              placeholder="https://zoom.us/..."
              icon={LinkIcon}
              value={form.link}
              onChange={handleChange}
            />

            <Input
              label="Max Attendees (0 = unlimited)"
              name="maxAttendees"
              type="number"
              placeholder="0"
              value={form.maxAttendees}
              onChange={handleChange}
            />
          </div>

          {/* Tags */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Tags</h2>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                placeholder="Add a tag and press Enter"
                className="input-field flex-1"
              />
              <Button type="button" variant="secondary" onClick={addTag}>
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 bg-primary-50 text-primary-700 px-3 py-1 rounded-full text-sm"
                >
                  #{tag}
                  <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-500 ml-1">×</button>
                </span>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-3 justify-end pb-8">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/events')}
            >
              Cancel
            </Button>
            <Button type="submit" loading={isLoading}>
              Create Event
            </Button>
          </div>

        </form>
      </div>
    </DashboardLayout>
  );
};

export default CreateEvent;