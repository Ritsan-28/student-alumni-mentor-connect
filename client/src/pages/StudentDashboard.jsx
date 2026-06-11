import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, MessageSquare, Bell, TrendingUp,
  Search, ArrowRight,
} from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardLayout from '../components/layout/DashboardLayout';
import StatCard from '../components/dashboard/StatCard';
import EventItem from '../components/dashboard/EventItem';
import JobItem from '../components/dashboard/JobItem';
import MentorCard from '../components/mentors/MentorCard';
import { PageLoader } from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';
import dashboardService from '../api/dashboardService';
import useAuthStore from '../store/authStore';

const StudentDashboard = () => {
  const { user } = useAuthStore();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      try {
        const response = await dashboardService.getStudentDashboard();
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
              Welcome back, {user?.name?.split(' ')[0]}! 🎓
            </h1>
            <p className="text-gray-500 mt-1">
              Here's what's happening in your network
            </p>
          </div>
          <Link to="/mentors" className="btn-primary flex items-center gap-2">
            <Search className="h-4 w-4" />
            Find Mentors
          </Link>
        </div>

        {/* Profile Completeness Warning */}
        {data?.stats?.profileCompleteness < 60 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="font-medium text-amber-800">
                Your profile is {data?.stats?.profileCompleteness}% complete
              </p>
              <p className="text-sm text-amber-600 mt-0.5">
                Complete your profile to get better mentor suggestions
              </p>
            </div>
            <Link to="/profile" className="btn-primary text-sm shrink-0">
              Complete Profile
            </Link>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={Users}
            label="Connections"
            value={data?.stats?.connections}
            color="bg-primary-600"
          />
          <StatCard
            icon={TrendingUp}
            label="Pending"
            value={data?.stats?.pending}
            color="bg-amber-500"
          />
          <StatCard
            icon={MessageSquare}
            label="Unread Msgs"
            value={data?.stats?.unreadMessages}
            color="bg-emerald-500"
          />
          <StatCard
            icon={Bell}
            label="Notifications"
            value={data?.stats?.unreadNotifications}
            color="bg-violet-500"
          />
        </div>

        {/* Suggested Mentors */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Suggested Mentors
            </h2>
            <Link
              to="/mentors"
              className="text-sm text-primary-600 hover:underline flex items-center gap-1"
            >
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          {data?.suggestedMentors?.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No mentors yet"
              description="Be the first to connect with a mentor"
              action={<Link to="/mentors" className="btn-primary">Browse Mentors</Link>}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {data?.suggestedMentors?.map(({ user: mentor, profile }) => (
                <MentorCard key={mentor._id} user={mentor} profile={profile} />
              ))}
            </div>
          )}
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

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

          {/* Recent Jobs */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Recent Jobs</h2>
              <Link to="/jobs" className="text-sm text-primary-600 hover:underline">
                View all
              </Link>
            </div>
            {data?.recentJobs?.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">
                No jobs posted yet
              </p>
            ) : (
              <div className="space-y-3">
                {data?.recentJobs?.map((job) => (
                  <JobItem key={job._id} job={job} />
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;