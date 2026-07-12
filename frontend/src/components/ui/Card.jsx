// ─────────────────────────────────────────────────────────────────────────────
// Card — Surface container with padding options and hover
// ─────────────────────────────────────────────────────────────────────────────

const PADDING = {
  none: '',
  sm: 'p-4',
  md: 'p-5',
  lg: 'p-6',
  xl: 'p-8',
};

const Card = ({
  children,
  padding = 'lg',
  hover = false,
  className = '',
  ...rest
}) => {
  const paddingClass = PADDING[padding] || PADDING.lg;
  const hoverClass = hover ? 'hover:shadow-md transition-shadow' : '';

  return (
    <div
      className={`bg-white rounded-xl border border-slate-200 shadow-sm ${paddingClass} ${hoverClass} ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
};

export default Card;
