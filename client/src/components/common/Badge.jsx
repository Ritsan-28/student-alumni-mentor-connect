// Versatile badge component for roles, statuses, skills, etc.
const Badge = ({
  children,
  variant = 'default',
  size = 'sm',
  className = '',
}) => {
  const variants = {
    default:     'bg-gray-100 text-gray-700',
    primary:     'bg-primary-100 text-primary-700',
    success:     'bg-emerald-100 text-emerald-700',
    warning:     'bg-amber-100 text-amber-700',
    danger:      'bg-red-100 text-red-700',
    student:     'bg-indigo-100 text-indigo-700',
    alumni:      'bg-sky-100 text-sky-700',
    mentor:      'bg-emerald-100 text-emerald-700',
    admin:       'bg-violet-100 text-violet-700',
    available:   'bg-emerald-100 text-emerald-700',
    busy:        'bg-amber-100 text-amber-700',
    unavailable: 'bg-red-100 text-red-700',
  };

  const sizes = {
    xs: 'px-1.5 py-0.5 text-xs',
    sm: 'px-2.5 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
  };

  return (
    <span
      className={`
        inline-flex items-center rounded-full font-medium
        ${variants[variant] || variants.default}
        ${sizes[size]}
        ${className}
      `}
    >
      {children}
    </span>
  );
};

export default Badge;