import { Link } from 'react-router-dom';
import { MapPin, Briefcase, Clock, Users } from 'lucide-react';
import Avatar from '../common/Avatar';
import Badge from '../common/Badge';
import Button from '../common/Button';

const MentorCard = ({ user, profile, onConnect }) => {
  const availabilityColor = {
    available:   'success',
    busy:        'warning',
    unavailable: 'danger',
  };

  const availabilityLabel = {
    available:   '🟢 Available',
    busy:        '🟡 Busy',
    unavailable: '🔴 Unavailable',
  };

  return (
    <div className="card hover:shadow-md transition-shadow duration-200 flex flex-col">

      {/* Header */}
      <div className="flex items-start gap-4 mb-4">
        <Avatar src={user.avatar} name={user.name} size="lg" />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">{user.name}</h3>
          {(profile?.currentPosition || profile?.currentCompany) && (
            <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
              <Briefcase className="h-3 w-3 shrink-0" />
              <span className="truncate">
                {[profile.currentPosition, profile.currentCompany]
                  .filter(Boolean).join(' @ ')}
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

      {/* Availability + Experience */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        {profile?.availability && (
          <Badge variant={availabilityColor[profile.availability]} size="sm">
            {availabilityLabel[profile.availability]}
          </Badge>
        )}
        {profile?.yearsOfExperience && (
          <span className="text-xs text-gray-500 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {profile.yearsOfExperience} yrs exp
          </span>
        )}
      </div>

      {/* Skills */}
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

      {/* Bio */}
      {profile?.bio && (
        <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-1">
          {profile.bio}
        </p>
      )}

      {/* Actions */}
      <div className="flex gap-2 mt-auto">
        <Link
          to={`/profile/view/${user._id}`}
          className="btn-secondary text-sm flex-1 text-center"
        >
          View Profile
        </Link>
        <Button
          size="sm"
          className="flex-1"
          onClick={() => onConnect && onConnect(user._id)}
        >
          <Users className="h-3.5 w-3.5 mr-1" />
          Connect
        </Button>
      </div>

    </div>
  );
};

export default MentorCard;