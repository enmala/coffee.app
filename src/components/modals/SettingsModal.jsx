import { GearIcon, SunIcon, MoonIcon } from '../icons/SvgIcons';

export default function SettingsModal({
  isOpen,
  onClose,
  theme,
  setTheme,
  voiceGuidanceEnabled,
  setVoiceGuidanceEnabled,
  soundEnabled,
  setSoundEnabled,
  vibrationEnabled,
  setVibrationEnabled,
  vibrationType,
  setVibrationType,
  onUnifiedImportJson,
  onOpenAbout
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-sm w-full p-6 shadow-xl max-h-[85vh] overflow-y-auto space-y-5 border border-slate-100 dark:border-slate-800 flex flex-col">
        <div className="flex justify-between items-start border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="text-left">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <GearIcon className="w-5 h-5 text-amber-800 dark:text-amber-500" /> Configuración
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Personaliza tu experiencia de preparación</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 dark:text-slate-300 hover:text-slate-600 dark:hover:text-slate-200 text-xl font-bold leading-none cursor-pointer"
          >
            &times;
          </button>
        </div>

        <div className="space-y-4 py-2">
          {/* Theme selector */}
          <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800/60">
            <div className="text-left">
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200 block">Tema Visual</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">Alterna entre modo claro y oscuro</span>
            </div>
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer text-xs font-bold flex items-center gap-1"
              title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            >
              <span className="flex items-center gap-1">{theme === 'dark' ? <><SunIcon className="w-3.5 h-3.5" /> Claro</> : <><MoonIcon className="w-3.5 h-3.5" /> Oscuro</>}</span>
            </button>
          </div>

          {/* Modo manos libres */}
          <div className="space-y-2.5 p-3 bg-amber-50 dark:bg-amber-950/20 rounded-xl border border-amber-200 dark:border-amber-500/20">
            <div className="flex items-center justify-between">
              <div className="text-left">
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200 block">Modo Manos Libres</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">Activa narración de pasos mientras el timer corre.</span>
              </div>
              <button
                type="button"
                onClick={() => setVoiceGuidanceEnabled(!voiceGuidanceEnabled)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  voiceGuidanceEnabled
                    ? 'bg-amber-800 text-white hover:bg-amber-900'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-700'
                }`}
              >
                {voiceGuidanceEnabled ? 'Activado' : 'Desactivado'}
              </button>
            </div>
          </div>

          {/* Sound Alerts */}
          <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800/60">
            <div className="text-left">
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200 block">Alertas de Sonido</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">Sonido al cambiar de paso</span>
            </div>
            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                soundEnabled 
                  ? 'bg-amber-800 text-white hover:bg-amber-900' 
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-700'
              }`}
            >
              {soundEnabled ? 'Activado' : 'Desactivado'}
            </button>
          </div>

          <div className="space-y-2.5 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800/60">
            <div className="flex items-center justify-between">
              <div className="text-left">
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200 block">Vibración Háptica</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">Vibrar en transiciones</span>
              </div>
              <button
                type="button"
                onClick={() => setVibrationEnabled(!vibrationEnabled)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  vibrationEnabled 
                    ? 'bg-amber-800 text-white hover:bg-amber-900' 
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-700'
                }`}
              >
                {vibrationEnabled ? 'Activado' : 'Desactivado'}
              </button>
            </div>
            
            {vibrationEnabled && (
              <div className="pt-2 border-t border-slate-200/50 dark:border-slate-700/50 flex items-center justify-between gap-2">
                <label className="text-xs text-slate-600 dark:text-slate-400 font-semibold">Duración:</label>
                <select
                  value={vibrationType}
                  onChange={(e) => setVibrationType(e.target.value)}
                  className="p-1 border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs focus:outline-none"
                >
                  <option value="short">Corta</option>
                  <option value="normal">Normal</option>
                  <option value="long">Larga</option>
                </select>
              </div>
            )}
          </div>

          {/* Importar Datos */}
          <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800/60">
            <div className="text-left">
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200 block">Importar Datos</span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Carga receta o grano desde archivo .json</span>
            </div>
            <label className="px-3 py-1.5 bg-amber-800 hover:bg-amber-900 dark:bg-amber-700 dark:hover:bg-amber-800 text-white text-xs font-bold rounded-lg cursor-pointer transition flex items-center justify-center shadow-sm select-none">
              Importar
              <input
                type="file"
                accept=".json"
                onChange={onUnifiedImportJson}
                className="hidden"
              />
            </label>
          </div>

          {/* About link */}
          <div className="flex justify-center pt-2">
            <button
              type="button"
              onClick={onOpenAbout}
              className="px-4 py-2 rounded-full text-xs font-medium text-amber-800 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition cursor-pointer flex items-center gap-1.5"
            >
              <span>ⓘ</span>
              <span>Acerca de la aplicación</span>
            </button>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={onClose}
            className="w-full py-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl font-bold text-xs transition cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
