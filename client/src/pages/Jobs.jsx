import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Plus, Search, X, Bookmark } from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardLayout from '../components/layout/DashboardLayout';
import JobCard from '../components/jobs/JobCard';
import { CardSkeleton } from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';
import jobService from '../api/jobService';
import useAuthStore from '../store/authStore';

const useDebounce = (value, delay = 500) => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
};

const Jobs = () => {
  const { user } = useAuthStore();
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [savedIds, setSavedIds] = useState(new Set());
  const [activeTab, setActiveTab] = useState('all');

  const debouncedSearch = useDebounce(search);
  const prevFilters = useRef({ debouncedSearch, type, activeTab });
  const canPost = ['alumni', 'mentor', 'admin'].includes(user?.role);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setIsLoading(true);
      try {
        if (activeTab === 'saved') {
          const response = await jobService.getSavedJobs();
          if (!cancelled) {
            setJobs(response.data);
            setPagination({});
          }
        } else {
          const filtersChanged =
            prevFilters.current.debouncedSearch !== debouncedSearch ||
            prevFilters.current.type !== type ||
            prevFilters.current.activeTab !== activeTab;

          const currentPage = filtersChanged ? 1 : page;

          if (filtersChanged) {
            prevFilters.current = { debouncedSearch, type, activeTab };
          }

          const params = { page: currentPage, limit: 9 };
          if (debouncedSearch) params.search = debouncedSearch;
          if (type) params.type = type;

          const response = await jobService.getJobs(params);
          if (!cancelled) {
            setJobs(response.data.jobs);
            setPagination(response.data.pagination);
          }
        }
      } catch {
        if (!cancelled) toast.error('Failed to load jobs');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [debouncedSearch, type, page, activeTab]);

  const handleSave = async (jobId) => {
    try {
      const response = await jobService.toggleSaveJob(jobId);
      const { saved } = response.data;

      setSavedIds((prev) => {
        const next = new Set(prev);
        if (saved) {
          next.add(jobId);
        } else {
          next.delete(jobId);
        }
        return next;
      });

      toast.success(saved ? 'Job saved!' : 'Job removed from saved');

      if (activeTab === 'saved' && !saved) {
        setJobs((prev) => prev.filter((j) => j._id !== jobId));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save job');
    }
  };

  const clearFilters = () => {
    setSearch('');
    setType('');
    setPage(1);
  };

  const hasFilters = search || type;

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Jobs & Internships</h1>
            <p className="text-gray-500 mt-1">
              Opportunities shared by alumni and mentors
            </p>
          </div>
          {canPost && (
            <Link to="/jobs/create" className="btn-primary flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Post a Job
            </Link>
          )}
        </div>

        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6 w-fit">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'all'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            All Jobs
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'saved'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Bookmark className="h-3.5 w-3.5" />
            Saved
          </button>
        </div>

        {activeTab === 'all' && (
          <div className="card mb-6">
            <div className="flex gap-3 flex-wrap">
              <div className="relative flex-1 min-w-48">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search jobs or companies..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="input-field pl-9"
                />
              </div>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="input-field w-44"
              >
                <option value="">All Types</option>
                <option value="full-time">💼 Full Time</option>
                <option value="part-time">⏰ Part Time</option>
                <option value="internship">🎓 Internship</option>
                <option value="contract">📋 Contract</option>
                <option value="remote">🌐 Remote</option>
              </select>
              {hasFilters && (
                <button
                  onClick={clearFilters}
                  className="btn-secondary flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50"
                >
                  <X className="h-4 w-4" /> Clear
                </button>
              )}
            </div>
          </div>
        )}

        {!isLoading && activeTab === 'all' && (
          <p className="text-sm text-gray-500 mb-4">
            {pagination.total || 0} job{pagination.total !== 1 ? 's' : ''} found
          </p>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : jobs.length === 0 ? (
          <EmptyState
            icon={Briefcase}
            title={activeTab === 'saved' ? 'No saved jobs' : 'No jobs found'}
            description={
              activeTab === 'saved'
                ? 'Save jobs you are interested in to view them here'
                : 'No jobs match your search. Try different filters.'
            }
            action={
              activeTab === 'saved' ? (
                <button onClick={() => setActiveTab('all')} className="btn-primary">
                  Browse Jobs
                </button>
              ) : hasFilters ? (
                <button onClick={clearFilters} className="btn-primary">
                  Clear Filters
                </button>
              ) : canPost ? (
                <Link to="/jobs/create" className="btn-primary">
                  Post First Job
                </Link>
              ) : null
            }
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job) => (
              <JobCard
                key={job._id}
                job={job}
                onSave={handleSave}
                isSaved={savedIds.has(job._id)}
              />
            ))}
          </div>
        )}

        {activeTab === 'all' && pagination.totalPages > 1 && (
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

export default Jobs;