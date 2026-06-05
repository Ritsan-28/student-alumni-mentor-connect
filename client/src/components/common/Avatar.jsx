// Displays user avatar with fallback initials
const Avatar = ({
  src,
  name = '',
  size = 'md',
  online = false,
  className = '',
}) => {
  const sizes = {
    xs:  'w-7 h-7 text-xs',
    sm:  'w-9 h-9 text-sm',
    md:  'w-11 h-11 text-base',
    lg:  'w-16 h-16 text-xl',
    xl:  'w-24 h-24 text-3xl',
    '2xl': 'w-32 h-32 text-4xl',
  };

  // Generate initials from name
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  // Generate a consistent color from the name
  const colors = [
    'bg-indigo-500', 'bg-sky-500', 'bg-emerald-500',
    'bg-violet-500', 'bg-rose-500', 'bg-amber-500',
  ];
  const colorIndex = name.charCodeAt(0) % colors.length;
  const bgColor = colors[colorIndex] || 'bg-primary-500';

  return (
    <div className={`relative inline-flex shrink-0 ${className}`}>
      {src ? (
        <img
          src={src}
          alt={name}
          className={`${sizes[size]} rounded-full object-cover ring-2 ring-white`}
        />
      ) : (
        <div
          className={`
            ${sizes[size]} ${bgColor}
            rounded-full flex items-center justify-center
            text-white font-semibold ring-2 ring-white
          `}
        >
          {initials || '?'}
        </div>
      )}

      {/* Online indicator dot */}
      {online && (
        <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-white" />
      )}
    </div>
  );
};

export default Avatar;