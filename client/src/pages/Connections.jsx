import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, UserCheck, Clock, X, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardLayout from '../components/layout/DashboardLayout';
import Avatar from '../components/common/Avatar';
import Badge from '../components/common/Badge';
import EmptyState from '../components/common/EmptyState';
import { PageLoader } from '../components/common/Loader';
import connectionService from '../api/connectionService';

const Connections = () => {
  const [connections, setConnections] = useState([]);
  const [pending, setPending] = useState({ received: [], sent: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('connections');
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = () => setRefreshKey((k) => k + 1);

  useEffect(() => {
    let cancelled = false;
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [connRes, pendRes] = await Promise.all([
          connectionService.getMyConnections(),
          connectionService.getPendingRequests(),
        ]);
        if (!cancelled) {
          setConnections(connRes.data);
          setPending(pendRes.data);
        }
      } catch {
        if (!cancelled) toast.error('Failed to load connections');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    loadData();
    return () => { cancelled = true; };
  }, [refreshKey]);

  const handleAccept = async (connectionId) => {
    try {
      await connectionService.acceptRequest(connectionId);
      toast.success('Connection accepted!');
      refresh();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to accept');
    }
  };

  const handleDecline = async (connectionId) => {
    try {
      await connectionService.declineRequest(connectionId);
      toast.success('Request declined');
      refresh();
    } catch {
      toast.error('Failed to decline');
    }
  };

  const handleRemove = async (connectionId) => {
    try {
      await connectionService.removeConnection(connectionId);
      toast.success('Connection removed');
      refresh();
    } catch {
      toast.error('Failed to remove');
    }
  };

  if (isLoading) return <PageLoader />;

  const tabs = [
    { key: 'connections', label: 'My Connections', count: connections.length },
    { key: 'received',    label: 'Received',        count: pending.received.length },
    { key: 'sent',        label: 'Sent',             count: pending.sent.length },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Connections</h1>
          <p className="text-gray-500 mt-1">Manage your network and connection requests</p>
        </div>

        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`
                flex-1 flex items-center justify-center gap-2 py-2 px-3
                rounded-lg text-sm font-medium transition-all duration-200
                ${activeTab === tab.key
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
                }
              `}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={`
                  text-xs rounded-full px-1.5 py-0.5 font-semibold
                  ${activeTab === tab.key
                    ? 'bg-primary-100 text-primary-700'
                    : 'bg-gray-200 text-gray-600'
                  }
                `}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {activeTab === 'connections' && (
          connections.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No connections yet"
              description="Start by finding mentors and sending connection requests"
              action={<Link to="/mentors" className="btn-primary">Find Mentors</Link>}
            />
          ) : (
            <div className="space-y-3">
              {connections.map(({ connectionId, user, connectedAt }) => (
                <div key={connectionId} className="card flex items-center gap-4">
                  <Avatar src={user.avatar} name={user.name} size="md" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900">{user.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge variant={user.role} size="xs">{user.role}</Badge>
                      <span className="text-xs text-gray-400">
                        Connected {new Date(connectedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Link to={`/profile/view/${user._id}`} className="btn-secondary text-xs">
                      View
                    </Link>
                    <button
                      onClick={() => handleRemove(connectionId)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {activeTab === 'received' && (
          pending.received.length === 0 ? (
            <EmptyState
              icon={Clock}
              title="No pending requests"
              description="You have no incoming connection requests"
            />
          ) : (
            <div className="space-y-3">
              {pending.received.map((conn) => (
                <div key={conn._id} className="card">
                  <div className="flex items-center gap-4">
                    <Avatar src={conn.sender.avatar} name={conn.sender.name} size="md" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900">{conn.sender.name}</p>
                      <Badge variant={conn.sender.role} size="xs">{conn.sender.role}</Badge>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleAccept(conn._id)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
                      >
                        <Check className="h-3.5 w-3.5" /> Accept
                      </button>
                      <button
                        onClick={() => handleDecline(conn._id)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                      >
                        <X className="h-3.5 w-3.5" /> Decline
                      </button>
                    </div>
                  </div>
                  {conn.message && (
                    <p className="mt-3 text-sm text-gray-500 bg-gray-50 rounded-lg p-3 italic">
                      "{conn.message}"
                    </p>
                  )}
                </div>
              ))}
            </div>
          )
        )}

        {activeTab === 'sent' && (
          pending.sent.length === 0 ? (
            <EmptyState
              icon={UserCheck}
              title="No sent requests"
              description="You haven't sent any connection requests yet"
              action={<Link to="/mentors" className="btn-primary">Find Mentors</Link>}
            />
          ) : (
            <div className="space-y-3">
              {pending.sent.map((conn) => (
                <div key={conn._id} className="card flex items-center gap-4">
                  <Avatar src={conn.receiver.avatar} name={conn.receiver.name} size="md" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900">{conn.receiver.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge variant={conn.receiver.role} size="xs">{conn.receiver.role}</Badge>
                      <span className="text-xs text-amber-600 font-medium">⏳ Pending</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemove(conn._id)}
                    className="btn-secondary text-xs text-red-600 border-red-200 hover:bg-red-50"
                  >
                    Withdraw
                  </button>
                </div>
              ))}
            </div>
          )
        )}

      </div>
    </DashboardLayout>
  );
};

export default Connections;