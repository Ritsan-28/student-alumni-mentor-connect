import {
  MapPin,
  Briefcase,
  Clock,
  ExternalLink,
  Bookmark,
  BookmarkCheck,
} from 'lucide-react';
import Badge from '../common/Badge';
import Avatar from '../common/Avatar';

const typeColors = {
  'full-time': 'success',
  'part-time': 'warning',
  internship: 'primary',
  contract: 'default',
  remote: 'mentor',
};

const typeEmoji = {
  'full-time': '💼',
  'part-time': '⏰',
  internship: '🎓',
  contract: '📋',
  remote: '🌐',
};

const JobCard = ({ job, onSave, isSaved }) => {
  const isExpired =
    job.deadline && new Date(job.deadline) < new Date();

  const typeName = job.type
    ? job.type.charAt(0).toUpperCase() + job.type.slice(1)
    : 'Job';

  return (
    <div className="card hover:shadow-md transition-shadow duration-200 flex flex-col">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <Badge variant={typeColors[job.type] || 'default'} size="sm">
          {typeEmoji[job.type]} {typeName}
        </Badge>

        <button
          onClick={() => onSave && onSave(job._id)}
          className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
          title={isSaved ? 'Remove from saved' : 'Save job'}
        >
          {isSaved ? (
            <BookmarkCheck className="h-5 w-5 text-primary-600" />
          ) : (
            <Bookmark className="h-5 w-5 text-gray-400" />
          )}
        </button>
      </div>

      {/* Title + Company */}
      <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
        {job.title}
      </h3>

      <p className="text-primary-600 font-medium text-sm mb-3">
        {job.company}
      </p>

      {/* Description */}
      <p className="text-sm text-gray-500 line-clamp-3 mb-4 flex-1">
        {job.description}
      </p>

      {/* Details */}
      <div className="space-y-1.5 mb-4">
        {job.location && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="h-3.5 w-3.5 text-gray-400 shrink-0" />
            <span>{job.location}</span>
          </div>
        )}

        {job.salary && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Briefcase className="h-3.5 w-3.5 text-gray-400 shrink-0" />
            <span>{job.salary}</span>
          </div>
        )}

        {job.deadline && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="h-3.5 w-3.5 text-gray-400 shrink-0" />
            <span className={isExpired ? 'text-red-500' : ''}>
              {isExpired ? 'Expired: ' : 'Apply by: '}
              {new Date(job.deadline).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </span>
          </div>
        )}
      </div>

      {/* Skills */}
      {job.skills?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {job.skills.slice(0, 4).map((skill) => (
            <Badge key={skill} variant="default" size="xs">
              {skill}
            </Badge>
          ))}

          {job.skills.length > 4 && (
            <Badge variant="default" size="xs">
              +{job.skills.length - 4}
            </Badge>
          )}
        </div>
      )}

      {/* Posted By */}
      {job.postedBy && (
        <div className="flex items-center gap-2 mb-4 pt-3 border-t border-gray-100">
          <Avatar
            src={job.postedBy.avatar}
            name={job.postedBy.name}
            size="xs"
          />

          <span className="text-xs text-gray-500">
            Posted by{' '}
            <span className="font-medium text-gray-700">
              {job.postedBy.name}
            </span>
          </span>
        </div>
      )}

      {/* Apply Button */}
      <div className="mt-auto">
        {isExpired ? (
          <button
            disabled
            className="btn-secondary text-sm w-full opacity-50 cursor-not-allowed"
          >
            Application Closed
          </button>
        ) : (
          <a
            href={job.applyLink}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary text-sm w-full flex items-center justify-center gap-1.5"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Apply Now
          </a>
        )}
      </div>
    </div>
  );
};

export default JobCard;