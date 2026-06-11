import { Calendar, MapPin, ExternalLink } from 'lucide-react';

const typeEmoji = {
  webinar: '🎥',
  workshop: '🛠️',
  meetup: '🤝',
  seminar: '📚',
  other: '📅',
};

const EventItem = ({ event }) => {
  const eventDate = new Date(event.date);

  return (
    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
      <div className="text-2xl shrink-0">
        {typeEmoji[event.type] || '📅'}
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 text-sm truncate">
          {event.title}
        </p>

        <div className="flex items-center gap-3 mt-1 flex-wrap">
          <span className="text-xs text-gray-500 flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {eventDate.toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </span>

          <span className="text-xs text-gray-500 flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {event.location || 'Online'}
          </span>
        </div>
      </div>

      {event.link && (
        <a
          href={event.link}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 p-1.5 rounded-lg hover:bg-white text-gray-400 hover:text-primary-600 transition-colors"
        >
          <ExternalLink className="h-4 w-4" />
        </a>
      )}
    </div>
  );
};

export default EventItem;