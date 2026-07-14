
export default function NotificationModal({ message, type = 'info', title, onClose }) {
  if (!message) return null;

  // Configuración según el tipo de alerta
  const typeConfig = {
    success: {
      icon: '✅',
      textColor: 'text-emerald-650 dark:text-emerald-400',
      bgColor: 'bg-emerald-50/50 dark:bg-emerald-950/20',
      borderColor: 'border-emerald-250/20 dark:border-emerald-900/30',
      btnColor: 'bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-700',
      defaultTitle: 'Éxito'
    },
    error: {
      icon: '❌',
      textColor: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-50/50 dark:bg-red-950/20',
      borderColor: 'border-red-200/20 dark:border-red-900/30',
      btnColor: 'bg-red-600 hover:bg-red-750 dark:bg-red-650 dark:hover:bg-red-750',
      defaultTitle: 'Error'
    },
    info: {
      icon: 'ℹ️',
      textColor: 'text-amber-800 dark:text-amber-500',
      bgColor: 'bg-amber-50/50 dark:bg-amber-950/20',
      borderColor: 'border-amber-200/20 dark:border-amber-900/30',
      btnColor: 'bg-amber-800 hover:bg-amber-900 dark:bg-amber-700 dark:hover:bg-amber-800',
      defaultTitle: 'Notificación'
    }
  };

  const config = typeConfig[type] || typeConfig.info;
  const displayTitle = title || config.defaultTitle;

  return (
    <div className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div 
        className="bg-white dark:bg-slate-900 rounded-2xl max-w-sm w-full p-6 shadow-xl border border-slate-100 dark:border-slate-800 space-y-4 text-center transition-all duration-300"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center text-2xl ${config.bgColor} border ${config.borderColor}`}>
          <span className="select-none">{config.icon}</span>
        </div>
        <div>
          <h3 className={`text-lg font-bold text-slate-900 dark:text-white`}>
            {displayTitle}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed whitespace-pre-line">
            {message}
          </p>
        </div>

        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className={`w-full py-2.5 text-white rounded-xl font-bold text-xs transition shadow-sm cursor-pointer ${config.btnColor}`}
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
}
