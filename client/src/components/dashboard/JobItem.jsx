import { MapPin, ExternalLink } from 'lucide-react';
import Badge from '../common/Badge';

const typeColors = {
  'full-time': 'success',
  'part-time': 'warning',
  'internship': 'primary',
  'contract': 'default',
  'remote': 'mentor',
};

const JobItem = ({ job }) => (
  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
    <div className="flex-1 min-w-0">
      <p className="font-medium text-gray-900 text-sm truncate">{job.title}</p>
      <p className="text-xs text-primary-600 font-medium">{job.company}</p>

      <div className="flex items-center gap-2 mt-1 flex-wrap">
        <Badge variant={typeColors[job.type] || 'default'} size="xs">
          {job.type}
        </Badge>

        {job.location && (
          <span className="text-xs text-gray-500 flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {job.location}
          </span>
        )}
      </div>
    </div>

    <a
      href={job.applyLink}
      target="_blank"
      rel="noopener noreferrer"
      className="shrink-0 p-1.5 rounded-lg hover:bg-white text-gray-400 hover:text-primary-600 transition-colors"
    >
      <ExternalLink className="h-4 w-4" />
    </a>
  </div>
);

export default JobItem;