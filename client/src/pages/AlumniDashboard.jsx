import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, MessageSquare, Briefcase,
  Calendar, Plus,
} from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardLayout from '../components/layout/DashboardLayout';
import StatCard from '../components/dashboard/StatCard';
import EventItem from '../components/dashboard/EventItem';
import JobItem from '../components/dashboard/JobItem';
import Avatar from '../components/common/Avatar';
import Badge from '../components/common/Badge';
import { PageLoader } from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';
import dashboardService from '../api/dashboardService';
import useAuthStore from '../store/authStore';

const AlumniDashboard = () => {
  const { user } = useAuthStore();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      try {
        const response = await dashboardService.getAlumniDashboard();
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
              Welcome back, {user?.name?.split(' ')[0]}! 👔
            </h1>
            <p className="text-gray-500 mt-1">
              Give back to your community
            </p>
          </div>
          <div className="flex gap-3">
            <Link to="/jobs/create" className="btn-secondary flex items-center gap-2 text-sm">
              <Plus className="h-4 w-4" /> Post Job
            </Link>
            <Link to="/events/create" className="btn-primary flex items-center gap-2 text-sm">
              <Plus className="h-4 w-4" /> Create Event
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Users}         label="Connections"    value={data?.stats?.connections}     color="bg-primary-600" />
          <StatCard icon={Briefcase}     label="Jobs Posted"    value={data?.stats?.jobsPosted}       color="bg-rose-500" />
          <StatCard icon={Calendar}      label="Events Created" value={data?.stats?.eventsCreated}    color="bg-violet-500" />
          <StatCard icon={MessageSquare} label="Unread Msgs"   value={data?.stats?.unreadMessages}   color="bg-emerald-500" />
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Recent Connections */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">My Network</h2>
              <Link to="/connections" className="text-sm text-primary-600 hover:underline">
                View all
              </Link>
            </div>
            {data?.recentConnections?.length === 0 ? (
              <EmptyState
                icon={Users}
                title="No connections yet"
                description="Start connecting with students and peers"
                action={<Link to="/mentors" className="btn-primary">Find People</Link>}
              />
            ) : (
              <div className="space-y-3">
                {data?.recentConnections?.map(({ connectionId, user: connUser }) => (
                  <div key={connectionId} className="flex items-center gap-3">
                    <Avatar src={connUser.avatar} name={connUser.name} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm">{connUser.name}</p>
                      <Badge variant={connUser.role} size="xs">{connUser.role}</Badge>
                    </div>
                    <Link
                      to={`/profile/view/${connUser._id}`}
                      className="text-xs text-primary-600 hover:underline"
                    >
                      View
                    </Link>
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
              <p className="text-sm text-gray-400 text-center py-6">No upcoming events</p>
            ) : (
              <div className="space-y-3">
                {data?.upcomingEvents?.map((event) => (
                  <EventItem key={event._id} event={event} />
                ))}
              </div>
            )}
          </div>

          {/* My Posted Jobs */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">My Posted Jobs</h2>
              <Link to="/jobs/create" className="text-sm text-primary-600 hover:underline flex items-center gap-1">
                <Plus className="h-3.5 w-3.5" /> Post New
              </Link>
            </div>
            {data?.myJobs?.length === 0 ? (
              <EmptyState
                icon={Briefcase}
                title="No jobs posted"
                description="Share opportunities with students"
                action={<Link to="/jobs/create" className="btn-primary">Post a Job</Link>}
              />
            ) : (
              <div className="space-y-3">
                {data?.myJobs?.map((job) => (
                  <JobItem key={job._id} job={job} />
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
                description="Organize events for the community"
                action={<Link to="/events/create" className="btn-primary">Create Event</Link>}
              />
            ) : (
              <div className="space-y-3">
                {data?.myEvents?.map((event) => (
                  <EventItem key={event._id} event={event} />
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
};

export default AlumniDashboard;