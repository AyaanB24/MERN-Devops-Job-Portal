// ─────────────────────────────────────────────────────────────────────────────
// Badge — Color-coded pill with sizes
// ─────────────────────────────────────────────────────────────────────────────

const COLORS = {
  gray: 'bg-slate-100 text-slate-700',
  blue: 'bg-blue-100 text-blue-700',
  green: 'bg-emerald-100 text-emerald-700',
  amber: 'bg-amber-100 text-amber-700',
  red: 'bg-red-100 text-red-700',
  purple: 'bg-purple-100 text-purple-700',
  cyan: 'bg-cyan-100 text-cyan-700',
  emerald: 'bg-emerald-100 text-emerald-700',
  violet: 'bg-violet-100 text-violet-700',
};

const SIZES = {
  sm: 'text-[10px] px-2 py-0.5',
  md: 'text-xs px-2.5 py-1',
  lg: 'text-sm px-3 py-1.5',
};

const Badge = ({
  children,
  color = 'gray',
  size = 'md',
  capitalize = true,
  className = '',
}) => {
  const colorClass = COLORS[color] || COLORS.gray;
  const sizeClass = SIZES[size] || SIZES.md;
  const capClass = capitalize ? 'capitalize' : '';

  return (
    <span className={`inline-block font-semibold rounded-full ${colorClass} ${sizeClass} ${capClass} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;
