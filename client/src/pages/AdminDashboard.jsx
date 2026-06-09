import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, Briefcase, Calendar, MessageSquare,
  TrendingUp, Clock, CheckCircle, XCircle,
  GraduationCap, UserCheck,
} from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardLayout from '../components/layout/DashboardLayout';
import Avatar from '../components/common/Avatar';
import Badge from '../components/common/Badge';
import { PageLoader } from '../components/common/Loader';
import adminService from '../api/adminService';

// ─── Stat Card ─────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, sub, color }) => (
  <div className="card flex items-center gap-4">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
      <Icon className="h-6 w-6 text-white" />
    </div>
    <div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
      {sub && <p className="text-xs text-emerald-600 font-medium">{sub}</p>}
    </div>
  </div>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState(null);
  const [pendingJobs, setPendingJobs] = useState([]);
  const [pendingEvents, setPendingEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      try {
        const [statsRes, activityRes, jobsRes, eventsRes] = await Promise.all([
          adminService.getStats(),
          adminService.getActivity(),
          adminService.getPendingJobs(),
          adminService.getPendingEvents(),
        ]);
        if (!cancelled) {
          setStats(statsRes.data);
          setActivity(activityRes.data);
          setPendingJobs(jobsRes.data);
          setPendingEvents(eventsRes.data);
        }
      } catch {
        if (!cancelled) toast.error('Failed to load dashboard data');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const handleApproveJob = async (id) => {
    try {
      await adminService.approveJob(id);
      setPendingJobs((prev) => prev.filter((j) => j._id !== id));
      toast.success('Job approved');
    } catch { toast.error('Failed to approve job'); }
  };

  const handleRejectJob = async (id) => {
    try {
      await adminService.rejectJob(id);
      setPendingJobs((prev) => prev.filter((j) => j._id !== id));
      toast.success('Job rejected');
    } catch { toast.error('Failed to reject job'); }
  };

  const handleApproveEvent = async (id) => {
    try {
      await adminService.approveEvent(id);
      setPendingEvents((prev) => prev.filter((e) => e._id !== id));
      toast.success('Event approved');
    } catch { toast.error('Failed to approve event'); }
  };

  const handleRejectEvent = async (id) => {
    try {
      await adminService.rejectEvent(id);
      setPendingEvents((prev) => prev.filter((e) => e._id !== id));
      toast.success('Event rejected');
    } catch { toast.error('Failed to reject event'); }
  };

  if (isLoading) return <PageLoader />;

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500 mt-1">Platform overview and moderation</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={Users}
            label="Total Users"
            value={stats?.users?.total || 0}
            sub={`+${stats?.users?.newThisMonth || 0} this month`}
            color="bg-primary-600"
          />
          <StatCard
            icon={GraduationCap}
            label="Students"
            value={stats?.users?.students || 0}
            color="bg-indigo-500"
          />
          <StatCard
            icon={UserCheck}
            label="Mentors"
            value={stats?.users?.mentors || 0}
            color="bg-emerald-500"
          />
          <StatCard
            icon={TrendingUp}
            label="Connections"
            value={stats?.platform?.totalConnections || 0}
            color="bg-amber-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            icon={Briefcase}
            label="Active Jobs"
            value={stats?.platform?.totalJobs || 0}
            color="bg-rose-500"
          />
          <StatCard
            icon={Calendar}
            label="Active Events"
            value={stats?.platform?.totalEvents || 0}
            color="bg-violet-500"
          />
          <StatCard
            icon={MessageSquare}
            label="Messages Sent"
            value={stats?.platform?.totalMessages || 0}
            color="bg-sky-500"
          />
        </div>

        {/* Pending Approvals Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Pending Jobs */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Pending Jobs
                {pendingJobs.length > 0 && (
                  <span className="ml-2 text-sm bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                    {pendingJobs.length}
                  </span>
                )}
              </h2>
              <Link to="/admin/jobs" className="text-sm text-primary-600 hover:underline">
                View all
              </Link>
            </div>

            {pendingJobs.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">
                No pending job approvals 🎉
              </p>
            ) : (
              <div className="space-y-3">
                {pendingJobs.slice(0, 5).map((job) => (
                  <div key={job._id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm truncate">{job.title}</p>
                      <p className="text-xs text-gray-500">{job.company} · by {job.postedBy?.name}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleApproveJob(job._id)}
                        className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-medium hover:bg-emerald-700"
                      >
                        <CheckCircle className="h-3.5 w-3.5" /> Approve
                      </button>
                      <button
                        onClick={() => handleRejectJob(job._id)}
                        className="flex items-center gap-1 px-2.5 py-1.5 bg-red-600 text-white rounded-lg text-xs font-medium hover:bg-red-700"
                      >
                        <XCircle className="h-3.5 w-3.5" /> Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pending Events */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Pending Events
                {pendingEvents.length > 0 && (
                  <span className="ml-2 text-sm bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                    {pendingEvents.length}
                  </span>
                )}
              </h2>
              <Link to="/admin/events" className="text-sm text-primary-600 hover:underline">
                View all
              </Link>
            </div>

            {pendingEvents.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">
                No pending event approvals 🎉
              </p>
            ) : (
              <div className="space-y-3">
                {pendingEvents.slice(0, 5).map((event) => (
                  <div key={event._id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm truncate">{event.title}</p>
                      <p className="text-xs text-gray-500">
                        {event.type} · by {event.organizer?.name}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleApproveEvent(event._id)}
                        className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-medium hover:bg-emerald-700"
                      >
                        <CheckCircle className="h-3.5 w-3.5" /> Approve
                      </button>
                      <button
                        onClick={() => handleRejectEvent(event._id)}
                        className="flex items-center gap-1 px-2.5 py-1.5 bg-red-600 text-white rounded-lg text-xs font-medium hover:bg-red-700"
                      >
                        <XCircle className="h-3.5 w-3.5" /> Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Recent Activity */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Registrations</h2>
            <Link to="/admin/users" className="text-sm text-primary-600 hover:underline">
              Manage users
            </Link>
          </div>

          {activity?.recentUsers?.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">No recent registrations</p>
          ) : (
            <div className="space-y-3">
              {activity?.recentUsers?.map((user) => (
                <div key={user._id} className="flex items-center gap-3">
                  <Avatar src={user.avatar} name={user.name} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant={user.role} size="xs">{user.role}</Badge>
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(user.createdAt).toLocaleDateString('en-IN')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;