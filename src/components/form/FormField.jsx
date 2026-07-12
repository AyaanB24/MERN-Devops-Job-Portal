// ─────────────────────────────────────────────────────────────────────────────
// FormField — Unified field supporting input/textarea/select
// ─────────────────────────────────────────────────────────────────────────────

const FormField = ({
  label,
  error,
  hint,
  required = false,
  type = 'input', // 'input' | 'textarea' | 'select'
  id,
  options = [],
  rows = 4,
  maxLength,
  className = '',
  children,
  ...rest
}) => {
  const baseInputClass = 'w-full px-4 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition';
  const borderClass = error ? 'border-red-300' : 'border-slate-300';

  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-slate-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}

      {type === 'textarea' && (
        <textarea
          id={id}
          rows={rows}
          maxLength={maxLength}
          className={`${baseInputClass} ${borderClass} resize-none`}
          {...rest}
        />
      )}

      {type === 'select' && (
        <select
          id={id}
          className={`${baseInputClass} ${borderClass} bg-white`}
          {...rest}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      )}

      {type === 'input' && (
        <input
          id={id}
          className={`${baseInputClass} ${borderClass}`}
          {...rest}
        />
      )}

      {children}

      {hint && !error && (
        <p className="mt-1 text-xs text-slate-400">{hint}</p>
      )}
      {error && (
        <p className="mt-1 text-xs text-red-600">{error}</p>
      )}
      {maxLength && type === 'textarea' && (
        <p className="mt-1 text-xs text-slate-400 text-right">
          {(rest.value || '').length}/{maxLength}
        </p>
      )}
    </div>
  );
};

export default FormField;
