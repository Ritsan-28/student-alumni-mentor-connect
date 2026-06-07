import { MapPin, Users, ExternalLink, Clock } from 'lucide-react';
import Badge from '../common/Badge';
import Avatar from '../common/Avatar';

const typeColors = {
  webinar: 'primary',
  workshop: 'success',
  meetup: 'warning',
  seminar: 'default',
  other: 'default',
};

const typeEmoji = {
  webinar: '🎥',
  workshop: '🛠️',
  meetup: '🤝',
  seminar: '📚',
  other: '📅',
};

const EventCard = ({ event, onRegister, isRegistered }) => {
  const eventDate = new Date(event.date);
  const isPast = eventDate < new Date();

  const typeName = event.type
    ? event.type.charAt(0).toUpperCase() + event.type.slice(1)
    : '';

  return (
    <div className="card hover:shadow-md transition-shadow duration-200 flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <Badge variant={typeColors[event.type] || 'default'} size="sm">
          {typeEmoji[event.type]} {typeName}
        </Badge>

        {isPast ? (
          <Badge variant="default" size="sm">
            Completed
          </Badge>
        ) : (
          <Badge variant="success" size="sm">
            Upcoming
          </Badge>
        )}
      </div>

      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
        {event.title}
      </h3>

      <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-1">
        {event.description}
      </p>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Clock className="h-4 w-4 text-gray-400 shrink-0" />
          <span>
            {eventDate.toLocaleDateString('en-IN', {
              weekday: 'short',
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </span>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-600">
          <MapPin className="h-4 w-4 text-gray-400 shrink-0" />
          <span>{event.location || 'Online'}</span>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Users className="h-4 w-4 text-gray-400 shrink-0" />
          <span>
            {event.attendees?.length || 0} registered
            {event.maxAttendees > 0 &&
              ` / ${event.maxAttendees} max`}
          </span>
        </div>
      </div>

      {event.organizer && (
        <div className="flex items-center gap-2 mb-4 pt-3 border-t border-gray-100">
          <Avatar
            src={event.organizer.avatar}
            name={event.organizer.name}
            size="xs"
          />
          <span className="text-xs text-gray-500">
            by{' '}
            <span className="font-medium text-gray-700">
              {event.organizer.name}
            </span>
          </span>
        </div>
      )}

      {event.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {event.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="default" size="xs">
              #{tag}
            </Badge>
          ))}
        </div>
      )}

      <div className="flex gap-2 mt-auto">
        {event.link && (
          <a
            href={event.link}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary text-sm flex items-center gap-1.5 flex-1 justify-center"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Join Link
          </a>
        )}

        {!isPast && (
          <button
            onClick={() => onRegister && onRegister(event._id)}
            className={`text-sm flex-1 rounded-lg px-4 py-2 font-medium transition-colors ${
              isRegistered
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200'
                : 'btn-primary'
            }`}
          >
            {isRegistered ? '✓ Registered' : 'Register'}
          </button>
        )}
      </div>
    </div>
  );
};

export default EventCard;