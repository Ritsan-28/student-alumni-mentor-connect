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
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [skill, setSkill] = useState('');
  const [availability, setAvailability] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const debouncedSearch = useDebounce(search);
  const debouncedSkill = useDebounce(skill);

  const activeFiltersRef = useRef({ 
    search: debouncedSearch, 
    skill: debouncedSkill, 
    availability 
  });
  
  const abortControllerRef = useRef(null);

  const fetchMentors = useCallback(async (targetPage, currentSearch, currentSkill, currentAvailability) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsLoading(true);
    try {
      const params = { role: 'mentor', page: targetPage, limit: 9 };
      if (currentSearch.trim()) params.search = currentSearch.trim();
      if (currentSkill.trim()) params.skill = currentSkill.trim();
      if (currentAvailability) params.availability = currentAvailability;

      const response = await mentorService.getMentors(params, { signal: controller.signal });
      
      setMentors(response.data?.results || []);
      setPagination(response.data?.pagination || { total: 0, totalPages: 1 });
    } catch (error) {
      if (error.name === 'CanceledError' || error.name === 'AbortError') {
        return;
      }
      const msg = error.response?.data?.message || 'Failed to load mentors';
      toast.error(msg);
    } finally {
      if (!controller.signal.aborted) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const currentFilters = { 
      search: debouncedSearch, 
      skill: debouncedSkill, 
      availability 
    };

    const filtersChanged = 
      activeFiltersRef.current.search !== currentFilters.search ||
      activeFiltersRef.current.skill !== currentFilters.skill ||
      activeFiltersRef.current.availability !== currentFilters.availability;

    if (filtersChanged) {
      activeFiltersRef.current = currentFilters;
      setPage(1);
      fetchMentors(1, debouncedSearch, debouncedSkill, availability);
    } else {
      fetchMentors(page, debouncedSearch, debouncedSkill, availability);
    }
  }, [page, debouncedSearch, debouncedSkill, availability, fetchMentors]);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const clearFilters = () => {
    setSearch('');
    setSkill('');
    setAvailability('');
    setPage(1);
  };

  const hasFilters = !!(search || skill || availability);

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Find a Mentor</h1>
            <p className="text-sm text-gray-500 mt-1">
              Connect with experienced professionals who can guide your career path.
            </p>
          </div>
          {!isLoading && (
            <div className="inline-flex items-center px-3 py-1 bg-gray-100 rounded-full text-xs font-semibold text-gray-600 self-start sm:self-auto">
              {pagination.total || 0} mentor{pagination.total !== 1 ? 's' : ''} found
            </div>
          )}
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-6 transition-all duration-300">
          <div className="flex gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or company..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all placeholder:text-gray-400"
              />
            </div>
            
            <div className="relative flex-1 min-w-[240px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by skill (e.g., React, Python)..."
                value={skill}
                onChange={(e) => setSkill(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all placeholder:text-gray-400"
              />
            </div>

            <button
              type="button"
              onClick={() => setShowFilters(prev => !prev)}
              className={`px-4 py-2 text-sm font-medium rounded-xl border transition-all flex items-center gap-2 ${
                showFilters 
                  ? 'bg-primary-50 border-primary-200 text-primary-700 ring-2 ring-primary-100' 
                  : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <SlidersHorizontal className="h-4 w-4" />
              Advanced Filters
            </button>

            {hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="px-4 py-2 text-sm font-medium bg-red-50 text-red-600 border border-red-100 rounded-xl hover:bg-red-100 transition-all flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Clear All
              </button>
            )}
          </div>

          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-100 transition-all duration-300">
              <div className="w-full max-w-xs">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  Availability Status
                </label>
                <select
                  value={availability}
                  onChange={(e) => setAvailability(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all text-gray-700 cursor-pointer"
                >
                  <option value="">All Schedules</option>
                  <option value="available">🟢 Available Now</option>
                  <option value="busy">🟡 Limited Availability</option>
                  <option value="unavailable">🔴 Fully Booked</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : mentors.length === 0 ? (
          <div className="py-12 bg-white rounded-2xl border border-gray-100 shadow-sm px-4">
            <EmptyState
              icon={Search}
              title="No mentors found"
              description="Try adjusting your search terms or relaxing your filters to discover active industry mentors."
              action={
                hasFilters ? (
                  <button 
                    type="button" 
                    onClick={clearFilters} 
                    className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-xl hover:bg-primary-700 transition-all shadow-sm"
                  >
                    Reset Search Criteria
                  </button>
                ) : null
              }
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {mentors.map((mentor, index) => {
              const uniqueKey = mentor?.user?._id || mentor?.profile?._id || `mentor-${index}`;
              return (
                <MentorCard
                  key={uniqueKey}
                  user={mentor?.user}
                  profile={mentor?.profile}
                  onConnect={() => toast.success('Connection feature coming in Sprint 5!')}
                />
              );
            })}
          </div>
        )}

        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 sm:gap-4 mt-10">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-2 sm:px-4 text-sm font-medium border border-gray-200 rounded-xl bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-white transition-all select-none"
            >
              ← Previous
            </button>
            
            <span className="text-xs sm:text-sm font-medium text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100 min-w-[100px] text-center">
              Page {page} of {pagination.totalPages}
            </span>
            
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              disabled={page === pagination.totalPages}
              className="px-3 py-2 sm:px-4 text-sm font-medium border border-gray-200 rounded-xl bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-white transition-all select-none"
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