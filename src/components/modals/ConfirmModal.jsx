import { useEffect, useId, useRef } from 'react';
import { TrashIcon, WarningTriangleIcon } from '../icons/SvgIcons';

const FOCUSABLE_SELECTOR =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

export default function ConfirmModal({
  isOpen = true,
  title,
  message,
  confirmText = 'Sí, Eliminar',
  cancelText = 'Cancelar',
  confirmVariant = 'danger',
  icon = 'trash',
  onConfirm,
  onCancel,
  children
}) {
  const titleId = useId();
  const descId = useId();
  const modalRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    const previouslyFocused = document.activeElement;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const focusEls = Array.from(
      modalRef.current.querySelectorAll(FOCUSABLE_SELECTOR)
    );
    focusEls[0].focus();

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (onCancel) onCancel();
        return;
      }
      if (e.key === 'Tab') {
        const first = focusEls[0];
        const last = focusEls[focusEls.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
      previouslyFocused.focus();
    };
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const renderIcon = () => {
    if (icon === 'trash') {
      return (
        <div className="flex justify-center text-red-500 dark:text-red-400 my-1">
          <TrashIcon className="w-10 h-10" />
        </div>
      );
    }
    if (icon === 'warning') {
      return (
        <div className="flex justify-center text-amber-500 dark:text-amber-400 my-1">
          <WarningTriangleIcon className="w-10 h-10" />
        </div>
      );
    }
    return icon ? <div className="flex justify-center my-1">{icon}</div> : null;
  };

  const confirmBtnClasses = confirmVariant === 'warning'
    ? 'bg-amber-600 hover:bg-amber-700 text-white'
    : 'bg-red-600 hover:bg-red-700 text-white';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? titleId : undefined}
      aria-describedby={message ? descId : undefined}
      className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in"
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        className="bg-white dark:bg-slate-900 rounded-2xl max-w-sm w-full p-6 shadow-xl border border-slate-100 dark:border-slate-800 space-y-4 text-center"
      >
        {renderIcon()}

        <div>
          {title && (
            <h3 id={titleId} className="text-lg font-bold text-slate-900 dark:text-white">
              {title}
            </h3>
          )}
          {message && (
            <div id={descId} className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              {message}
            </div>
          )}
        </div>

        {children}

        <div className="flex gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl font-bold text-xs transition cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`flex-1 py-2 ${confirmBtnClasses} rounded-xl font-bold text-xs transition shadow-sm cursor-pointer`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}