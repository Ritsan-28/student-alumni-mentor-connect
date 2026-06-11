import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, MessageSquare, Calendar,
  Clock, ArrowRight, Plus, Star,
} from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardLayout from '../components/layout/DashboardLayout';
import StatCard from '../components/dashboard/StatCard';
import EventItem from '../components/dashboard/EventItem';
import Avatar from '../components/common/Avatar';
import Badge from '../components/common/Badge';
import { PageLoader } from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';
import dashboardService from '../api/dashboardService';
import useAuthStore from '../store/authStore';

const MentorDashboard = () => {
  const { user } = useAuthStore();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      try {
        const response = await dashboardService.getMentorDashboard();
        if (!cancelled) setData(response.data);
      } catch {
        if (!cancelled) toast.error('Failed to load dashboard');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  if (isLoading) return <PageLoader />;

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Welcome */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {user?.name?.split(' ')[0]}! ⭐
            </h1>
            <p className="text-gray-500 mt-1">
              You're making a difference in students' lives
            </p>
          </div>
          <div className="flex gap-3">
            <Link to="/connections" className="btn-secondary flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4" />
              {data?.stats?.pendingRequests > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full px-1.5">
                  {data.stats.pendingRequests}
                </span>
              )}
              Requests
            </Link>
            <Link to="/events/create" className="btn-primary flex items-center gap-2 text-sm">
              <Plus className="h-4 w-4" /> Create Event
            </Link>
          </div>
        </div>

        {/* Pending Requests Banner */}
        {data?.stats?.pendingRequests > 0 && (
          <div className="bg-primary-50 border border-primary-200 rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="font-medium text-primary-800">
                You have {data.stats.pendingRequests} pending mentorship request{data.stats.pendingRequests !== 1 ? 's' : ''}
              </p>
              <p className="text-sm text-primary-600 mt-0.5">
                Review and respond to connection requests
              </p>
            </div>
            <Link to="/connections" className="btn-primary text-sm shrink-0">
              Review Requests
            </Link>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Users}         label="Total Mentees"    value={data?.stats?.totalMentees}     color="bg-primary-600" />
          <StatCard icon={Clock}         label="Pending Requests" value={data?.stats?.pendingRequests}  color="bg-amber-500" />
          <StatCard icon={MessageSquare} label="Unread Msgs"      value={data?.stats?.unreadMessages}   color="bg-emerald-500" />
          <StatCard icon={Calendar}      label="Events Created"   value={data?.stats?.eventsCreated}    color="bg-violet-500" />
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Recent Mentees */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">My Mentees</h2>
              <Link to="/connections" className="text-sm text-primary-600 hover:underline flex items-center gap-1">
                View all <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            {data?.recentMentees?.length === 0 ? (
              <EmptyState
                icon={Users}
                title="No mentees yet"
                description="Accept connection requests to start mentoring"
                action={
                  <Link to="/connections" className="btn-primary">
                    View Requests
                  </Link>
                }
              />
            ) : (
              <div className="space-y-3">
                {data?.recentMentees?.map(({ connectionId, user: mentee }) => (
                  <div key={connectionId} className="flex items-center gap-3">
                    <Avatar src={mentee.avatar} name={mentee.name} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm">{mentee.name}</p>
                      <Badge variant={mentee.role} size="xs">{mentee.role}</Badge>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Link
                        to={`/profile/view/${mentee._id}`}
                        className="text-xs text-primary-600 hover:underline"
                      >
                        Profile
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming Events */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Upcoming Events</h2>
              <Link to="/events" className="text-sm text-primary-600 hover:underline">
                View all
              </Link>
            </div>
            {data?.upcomingEvents?.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">
                No upcoming events
              </p>
            ) : (
              <div className="space-y-3">
                {data?.upcomingEvents?.map((event) => (
                  <EventItem key={event._id} event={event} />
                ))}
              </div>
            )}
          </div>

          {/* My Events */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">My Events</h2>
              <Link to="/events/create" className="text-sm text-primary-600 hover:underline flex items-center gap-1">
                <Plus className="h-3.5 w-3.5" /> Create
              </Link>
            </div>
            {data?.myEvents?.length === 0 ? (
              <EmptyState
                icon={Calendar}
                title="No events created"
                description="Share your knowledge through events"
                action={
                  <Link to="/events/create" className="btn-primary">
                    Create Event
                  </Link>
                }
              />
            ) : (
              <div className="space-y-3">
                {data?.myEvents?.map((event) => (
                  <EventItem key={event._id} event={event} />
                ))}
              </div>
            )}
          </div>

          {/* Quick Tips */}
          <div className="card bg-gradient-to-br from-primary-50 to-indigo-50 border-primary-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Star className="h-5 w-5 text-primary-600" />
              Mentoring Tips
            </h2>
            <div className="space-y-3">
              {[
                'Set clear expectations in your first session',
                'Ask about their goals before giving advice',
                'Share your own failures — they learn more',
                'Suggest resources, don\'t just give answers',
                'Check in regularly even between sessions',
              ].map((tip, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-primary-600 font-bold text-sm shrink-0">{i + 1}.</span>
                  <p className="text-sm text-gray-600">{tip}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
};

export default MentorDashboard;