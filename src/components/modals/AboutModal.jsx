import { version } from '../../../package.json';

export default function AboutModal({ isOpen, onClose, isTwa }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-sm w-full p-6 shadow-xl max-h-[85vh] overflow-y-auto space-y-5 border border-slate-100 dark:border-slate-800 flex flex-col">
        <div className="flex justify-between items-start border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="text-left">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>☕</span> Barista Timer
            </h3>
            <span className="inline-block text-[10px] bg-amber-50 dark:bg-amber-950/20 text-amber-900 dark:text-amber-300 border border-amber-200 dark:border-amber-900/30 px-2 py-0.5 rounded font-bold uppercase tracking-wider mt-1">v{version}</span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 dark:text-slate-300 hover:text-slate-600 dark:hover:text-slate-200 text-xl font-bold leading-none cursor-pointer"
          >
            &times;
          </button>
        </div>

        <div className="space-y-3 text-sm text-slate-600 dark:text-slate-350 text-left">
          <p>
            Tu compañero de barra para café de especialidad. Crea, guarda y cronometra tus recetas de extracción paso a paso, con alertas, historial y soporte offline.
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Hecho con ☕ por <a className="text-amber-800 dark:text-amber-550 dark:hover:text-amber-405 hover:underline font-semibold">Enrique Maldonado</a>
          </p>
        </div>

        <div className="space-y-3 pt-2">
          <a
            href="https://github.com/enmala/coffee.app"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-2.5 bg-slate-900 hover:bg-slate-950 dark:bg-slate-800 dark:hover:bg-slate-700 text-white rounded-xl font-bold text-xs transition shadow-sm cursor-pointer"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            <span>Repositorio en GitHub</span>
          </a>

          {!isTwa && (
            <a
              href="https://ko-fi.com/enmala"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-bold text-xs transition shadow-sm cursor-pointer"
            >
              <span>☕</span>
              <span>Apoya el proyecto en Ko-fi</span>
            </a>
          )}
        </div>

        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={onClose}
            className="w-full py-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-650 dark:text-slate-300 rounded-xl font-bold text-xs transition cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
