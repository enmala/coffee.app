
export default function NotificationModal({ message, type = 'info', title, onClose }) {
  if (!message) return null;

  // Iconos SVG inline por tipo de alerta
  const SuccessIcon = () => (
    <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
  const ErrorIcon = () => (
    <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
  const InfoIcon = () => (
    <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4M12 8h.01" />
    </svg>
  );

  // Configuración según el tipo de alerta
  const typeConfig = {
    success: {
      Icon: SuccessIcon,
      textColor: 'text-emerald-700 dark:text-emerald-300',
      bgColor: 'bg-emerald-50/50 dark:bg-emerald-950/20',
      borderColor: 'border-emerald-200/20 dark:border-emerald-900/30',
      btnColor: 'bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-700',
      defaultTitle: 'Éxito'
    },
    error: {
      Icon: ErrorIcon,
      textColor: 'text-red-600 dark:text-red-300',
      bgColor: 'bg-red-50/50 dark:bg-red-950/20',
      borderColor: 'border-red-200/20 dark:border-red-900/30',
      btnColor: 'bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700',
      defaultTitle: 'Error'
    },
    info: {
      Icon: InfoIcon,
      textColor: 'text-amber-800 dark:text-amber-300',
      bgColor: 'bg-amber-50/50 dark:bg-amber-950/20',
      borderColor: 'border-amber-200/20 dark:border-amber-900/30',
      btnColor: 'bg-amber-800 hover:bg-amber-900 dark:bg-amber-700 dark:hover:bg-amber-800',
      defaultTitle: 'Notificación'
    }
  };

  const config = typeConfig[type] || typeConfig.info;
  const displayTitle = title || config.defaultTitle;
  const { Icon } = config;

  return (
    <div className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div 
        className="bg-white dark:bg-slate-900 rounded-2xl max-w-sm w-full p-6 shadow-xl border border-slate-100 dark:border-slate-800 space-y-4 text-center transition-all duration-300"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center ${config.bgColor} border ${config.borderColor} ${config.textColor}`}>
          <Icon />
        </div>
        <div>
          <h3 className={`text-lg font-bold text-slate-900 dark:text-white`}>
            {displayTitle}
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed whitespace-pre-line">
            {message}
          </p>
        </div>

        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className={`w-full py-2.5 text-white rounded-xl font-bold text-sm transition shadow-sm cursor-pointer ${config.btnColor}`}
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
}
