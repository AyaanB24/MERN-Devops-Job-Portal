// ─────────────────────────────────────────────────────────────────────────────
// Input — Text input with label, error, required indicator, icon support
// ─────────────────────────────────────────────────────────────────────────────

const Input = ({
  label,
  error,
  required = false,
  icon: Icon,
  id,
  type = 'text',
  className = '',
  ...rest
}) => {
  const baseInputClass = 'w-full px-4 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition';
  const borderClass = error ? 'border-red-300' : 'border-slate-300';
  const iconPadding = Icon ? 'pl-10' : '';

  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-slate-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Icon className="w-4 h-4 text-slate-400" />
          </div>
        )}
        <input
          id={id}
          type={type}
          className={`${baseInputClass} ${borderClass} ${iconPadding}`}
          {...rest}
        />
      </div>
      {error && (
        <p className="mt-1 text-xs text-red-600">{error}</p>
      )}
    </div>
  );
};

export default Input;
