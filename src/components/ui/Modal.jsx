import { useEffect } from 'react';
import Button from './Button';

// ─────────────────────────────────────────────────────────────────────────────
// Modal — Dialog with overlay, title, body, footer
// ─────────────────────────────────────────────────────────────────────────────

const SIZES = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
};

const Modal = ({
  open,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  showCancel = true,
  cancelLabel = 'Cancel',
  confirmLabel,
  onConfirm,
  loading = false,
}) => {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  const sizeClass = SIZES[size] || SIZES.md;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className={`relative ${sizeClass} w-full bg-white rounded-2xl shadow-xl border border-slate-200`}>
        {title && (
          <div className="px-6 py-4 border-b border-slate-100">
            <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          </div>
        )}

        <div className="px-6 py-4">
          {children}
        </div>

        {(footer || confirmLabel || showCancel) && (
          <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3">
            {footer}
            {showCancel && (
              <Button variant="outline" size="sm" onClick={onClose}>
                {cancelLabel}
              </Button>
            )}
            {confirmLabel && (
              <Button variant="primary" size="sm" loading={loading} onClick={onConfirm}>
                {confirmLabel}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
