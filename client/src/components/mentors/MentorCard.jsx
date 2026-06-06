import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Briefcase, Clock, UserPlus, UserCheck, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Avatar from '../common/Avatar';
import Badge from '../common/Badge';
import connectionService from '../../api/connectionService';

const MentorCard = ({ user, profile }) => {
  const [status, setStatus] = useState('none');
  const [connectionId, setConnectionId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isActing, setIsActing] = useState(false);

  const availabilityColor = {
    available: 'success', busy: 'warning', unavailable: 'danger',
  };
  const availabilityLabel = {
    available: '🟢 Available', busy: '🟡 Busy', unavailable: '🔴 Unavailable',
  };

  // Load connection status on mount
  useEffect(() => {
    const loadStatus = async () => {
      try {
        const response = await connectionService.getConnectionStatus(user._id);
        setStatus(response.data.status);
        setConnectionId(response.data.connectionId);
      } catch {
        setStatus('none');
      } finally {
        setIsLoading(false);
      }
    };
    loadStatus();
  }, [user._id]);

  const handleConnect = async () => {
    setIsActing(true);
    try {
      const response = await connectionService.sendRequest(user._id, '');
      setStatus('pending');
      setConnectionId(response.data._id);
      toast.success('Connection request sent!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send request');
    } finally {
      setIsActing(false);
    }
  };

  const handleWithdraw = async () => {
    setIsActing(true);
    try {
      await connectionService.removeConnection(connectionId);
      setStatus('none');
      setConnectionId(null);
      toast.success('Request withdrawn');
    } catch {
      toast.error('Failed to withdraw request');
    } finally {
      setIsActing(false);
    }
  };

  const renderConnectButton = () => {
    if (isLoading) return (
      <button disabled className="btn-secondary text-sm flex-1 flex items-center justify-center gap-1">
        <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading
      </button>
    );

    if (status === 'accepted') return (
      <button disabled className="btn-secondary text-sm flex-1 flex items-center justify-center gap-1 text-emerald-600 border-emerald-200">
        <UserCheck className="h-3.5 w-3.5" /> Connected
      </button>
    );

    if (status === 'pending') return (
      <button
        onClick={handleWithdraw}
        disabled={isActing}
        className="btn-secondary text-sm flex-1 flex items-center justify-center gap-1 text-amber-600 border-amber-200 hover:bg-amber-50"
      >
        {isActing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
        Pending · Withdraw
      </button>
    );

    return (
      <button
        onClick={handleConnect}
        disabled={isActing}
        className="btn-primary text-sm flex-1 flex items-center justify-center gap-1"
      >
        {isActing
          ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
          : <UserPlus className="h-3.5 w-3.5" />
        }
        Connect
      </button>
    );
  };

  return (
    <div className="card hover:shadow-md transition-shadow duration-200 flex flex-col">
      <div className="flex items-start gap-4 mb-4">
        <Avatar src={user.avatar} name={user.name} size="lg" />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">{user.name}</h3>
          {(profile?.currentPosition || profile?.currentCompany) && (
            <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
              <Briefcase className="h-3 w-3 shrink-0" />
              <span className="truncate">
                {[profile.currentPosition, profile.currentCompany].filter(Boolean).join(' @ ')}
              </span>
            </p>
          )}
          {profile?.location && (
            <p className="text-sm text-gray-400 flex items-center gap-1 mt-0.5">
              <MapPin className="h-3 w-3 shrink-0" />
              <span className="truncate">{profile.location}</span>
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 mb-3 flex-wrap">
        {profile?.availability && (
          <Badge variant={availabilityColor[profile.availability]} size="sm">
            {availabilityLabel[profile.availability]}
          </Badge>
        )}
        {profile?.yearsOfExperience && (
          <span className="text-xs text-gray-500 flex items-center gap-1">
            <Clock className="h-3 w-3" /> {profile.yearsOfExperience} yrs exp
          </span>
        )}
      </div>

      {profile?.skills?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {profile.skills.slice(0, 4).map((skill) => (
            <Badge key={skill} variant="primary" size="xs">{skill}</Badge>
          ))}
          {profile.skills.length > 4 && (
            <Badge variant="default" size="xs">+{profile.skills.length - 4}</Badge>
          )}
        </div>
      )}

      {profile?.bio && (
        <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-1">{profile.bio}</p>
      )}

      <div className="flex gap-2 mt-auto">
        <Link
          to={`/profile/view/${user._id}`}
          className="btn-secondary text-sm flex-1 text-center"
        >
          View Profile
        </Link>
        {renderConnectButton()}
      </div>
    </div>
  );
};

export default MentorCard;