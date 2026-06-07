import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Plus, Search, X } from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardLayout from '../components/layout/DashboardLayout';
import EventCard from '../components/events/EventCard';
import { CardSkeleton } from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';
import eventService from '../api/eventService';
import useAuthStore from '../store/authStore';

const useDebounce = (value, delay = 500) => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
};

const Events = () => {
  const { user } = useAuthStore();
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [registeredIds, setRegisteredIds] = useState(new Set());

  const debouncedSearch = useDebounce(search);
  const prevFilters = useRef({ debouncedSearch, type });

  const canCreate = ['alumni', 'mentor', 'admin'].includes(user?.role);

  const fetchEvents = useCallback(async (currentPage) => {
    setIsLoading(true);
    try {
      const params = { page: currentPage, limit: 9 };
      if (debouncedSearch) params.search = debouncedSearch;
      if (type) params.type = type;

      const response = await eventService.getEvents(params);
      setEvents(response.data.events);
      setPagination(response.data.pagination);
    } catch {
      toast.error('Failed to load events');
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, type]);

  useEffect(() => {
    const filtersChanged =
      prevFilters.current.debouncedSearch !== debouncedSearch ||
      prevFilters.current.type !== type;

    if (filtersChanged) {
      prevFilters.current = { debouncedSearch, type };
      fetchEvents(1);
      setPage(1);
    } else {
      fetchEvents(page);
    }
  }, [debouncedSearch, type, page, fetchEvents]);

  const handleRegister = async (eventId) => {
    try {
      const response = await eventService.registerInterest(eventId);
      const { registered } = response.data;

      setRegisteredIds((prev) => {
        const next = new Set(prev);
        if (registered) {
          next.add(eventId);
        } else {
          next.delete(eventId);
        }
        return next;
      });

      toast.success(registered ? 'Registered for event!' : 'Unregistered from event');

      setEvents((prev) =>
        prev.map((e) =>
          e._id === eventId
            ? {
                ...e,
                attendees: registered
                  ? [...(e.attendees || []), user._id]
                  : (e.attendees || []).filter((a) => a !== user._id),
              }
            : e
        )
      );
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to register');
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

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Events</h1>
            <p className="text-gray-500 mt-1">
              Discover webinars, workshops, and networking events
            </p>
          </div>
          {canCreate && (
            <Link to="/events/create" className="btn-primary flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Event
            </Link>
          )}
        </div>

        {/* Filters */}
        <div className="card mb-6">
          <div className="flex gap-3 flex-wrap">
            <div className="relative flex-1 min-w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search events..."
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
              <option value="webinar">🎥 Webinar</option>
              <option value="workshop">🛠️ Workshop</option>
              <option value="meetup">🤝 Meetup</option>
              <option value="seminar">📚 Seminar</option>
              <option value="other">📅 Other</option>
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

        {/* Results count */}
        {!isLoading && (
          <p className="text-sm text-gray-500 mb-4">
            {pagination.total || 0} event{pagination.total !== 1 ? 's' : ''} found
          </p>
        )}

        {/* Events Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : events.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="No events found"
            description="No events match your search. Try different filters."
            action={
              hasFilters ? (
                <button onClick={clearFilters} className="btn-primary">
                  Clear Filters
                </button>
              ) : canCreate ? (
                <Link to="/events/create" className="btn-primary">
                  Create First Event
                </Link>
              ) : null
            }
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <EventCard
                key={event._id}
                event={event}
                onRegister={handleRegister}
                isRegistered={registeredIds.has(event._id)}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
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

export default Events;