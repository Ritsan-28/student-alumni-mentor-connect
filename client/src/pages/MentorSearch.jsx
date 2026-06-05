import { useState, useEffect, useCallback, useRef } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardLayout from '../components/layout/DashboardLayout';
import MentorCard from '../components/mentors/MentorCard';
import { CardSkeleton } from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';
import mentorService from '../api/mentorService';

const useDebounce = (value, delay = 500) => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
};

const MentorSearch = () => {
  const [mentors, setMentors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [skill, setSkill] = useState('');
  const [availability, setAvailability] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const debouncedSearch = useDebounce(search);
  const debouncedSkill = useDebounce(skill);

  // Track previous filter values to detect changes
  const prevFilters = useRef({ debouncedSearch, debouncedSkill, availability });

  const fetchMentors = useCallback(async (currentPage) => {
    setIsLoading(true);
    try {
      const params = { role: 'mentor', page: currentPage, limit: 9 };
      if (debouncedSearch) params.search = debouncedSearch;
      if (debouncedSkill)  params.skill  = debouncedSkill;
      if (availability)    params.availability = availability;

      const response = await mentorService.getMentors(params);
      setMentors(response.data.results);
      setPagination(response.data.pagination);
    } catch {
      toast.error('Failed to load mentors');
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, debouncedSkill, availability]);

  useEffect(() => {
    const filtersChanged =
      prevFilters.current.debouncedSearch !== debouncedSearch ||
      prevFilters.current.debouncedSkill  !== debouncedSkill  ||
      prevFilters.current.availability    !== availability;

    if (filtersChanged) {
      prevFilters.current = { debouncedSearch, debouncedSkill, availability };
      fetchMentors(1);
      setPage(1);
    } else {
      fetchMentors(page);
    }
  }, [debouncedSearch, debouncedSkill, availability, page, fetchMentors]);

  const clearFilters = () => {
    setSearch('');
    setSkill('');
    setAvailability('');
    setPage(1);
  };

  const hasFilters = search || skill || availability;

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Find a Mentor</h1>
          <p className="text-gray-500 mt-1">
            Connect with experienced professionals who can guide your career
          </p>
        </div>

        <div className="card mb-6">
          <div className="flex gap-3 flex-wrap">
            <div className="relative flex-1 min-w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-field pl-9"
              />
            </div>
            <div className="relative flex-1 min-w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by skill..."
                value={skill}
                onChange={(e) => setSkill(e.target.value)}
                className="input-field pl-9"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`btn-secondary flex items-center gap-2 ${showFilters ? 'bg-primary-50 border-primary-300 text-primary-700' : ''}`}
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
            </button>
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="btn-secondary flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50"
              >
                <X className="h-4 w-4" />
                Clear
              </button>
            )}
          </div>

          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-100 flex gap-4 flex-wrap">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Availability
                </label>
                <select
                  value={availability}
                  onChange={(e) => setAvailability(e.target.value)}
                  className="input-field w-48"
                >
                  <option value="">All</option>
                  <option value="available">🟢 Available</option>
                  <option value="busy">🟡 Busy</option>
                  <option value="unavailable">🔴 Unavailable</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {!isLoading && (
          <p className="text-sm text-gray-500 mb-4">
            {pagination.total || 0} mentor{pagination.total !== 1 ? 's' : ''} found
          </p>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : mentors.length === 0 ? (
          <EmptyState
            icon={Search}
            title="No mentors found"
            description="Try adjusting your search or filters to find the right mentor"
            action={
              <button onClick={clearFilters} className="btn-primary">
                Clear Filters
              </button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {mentors.map(({ user, profile }) => (
              <MentorCard
                key={user._id}
                user={user}
                profile={profile}
                onConnect={() => toast.success('Connection feature coming in Sprint 5!')}
              />
            ))}
          </div>
        )}

        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-8">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="btn-secondary disabled:opacity-40"
            >
              ← Previous
            </button>
            <span className="text-sm text-gray-600">
              Page {page} of {pagination.totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              disabled={page === pagination.totalPages}
              className="btn-secondary disabled:opacity-40"
            >
              Next →
            </button>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
};

export default MentorSearch;