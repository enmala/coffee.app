import { MapPinIcon, GearIcon, MountainIcon } from './icons/SvgIcons';

export default function ImportBeanConfirmationModal({ bean, existingBeans = [], onConfirm, onCancel }) {
  if (!bean) return null;

  const isDuplicateName = existingBeans.some(
    (b) => b.name.toLowerCase().trim() === bean.name.toLowerCase().trim()
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm p-4 animate-fade-in">
      <div 
        className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-2xl p-6 max-h-[90vh] flex flex-col transition-all duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera */}
        <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-xl font-bold text-amber-950 dark:text-amber-500 flex items-center gap-2">
            <span>Importar Grano de Café</span>
          </h3>
          <button 
            onClick={onCancel}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-2xl font-semibold leading-none p-1"
            aria-label="Cerrar modal"
          >
            &times;
          </button>
        </div>

        {/* Contenido (Scrollable) */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-4 text-left">
          <div className="p-4 bg-amber-50/50 dark:bg-amber-950/10 border border-amber-900/10 rounded-xl flex items-start gap-3">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg text-amber-900 dark:text-amber-400 text-2xl">
              🫘
            </div>
            <div>
              <h4 className="text-lg font-bold text-slate-900 dark:text-slate-100 leading-tight">
                {bean.name}
              </h4>
              {bean.roaster && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-semibold">
                  Tostador: {bean.roaster}
                </p>
              )}
            </div>
          </div>

          {/* Advertencia de duplicado */}
          {isDuplicateName && (
            <div className="p-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-300/40 dark:border-amber-700/30 rounded-xl flex gap-2 items-center text-amber-800 dark:text-amber-400 text-xs">
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current shrink-0" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
              </svg>
              <span>Ya tienes un grano registrado con este nombre. Se guardará con un número correlativo (ej. "{bean.name} (1)").</span>
            </div>
          )}

          {/* Atributos técnicos en grid */}
          <div>
            <h5 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase mb-2 tracking-wider">
              Atributos Técnicos
            </h5>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {bean.origin && (
                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800/80">
                  <span className="block text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase">Origen</span>
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate block">📍 {bean.origin}</span>
                </div>
              )}
              {bean.region && (
                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800/80">
                  <span className="block text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase">Región</span>
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate flex items-center gap-1"><MapPinIcon className="w-3.5 h-3.5 text-slate-500 inline" /> {bean.region}</span>
                </div>
              )}
              {bean.farm && (
                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800/80">
                  <span className="block text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase">Finca</span>
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate block">🏡 {bean.farm}</span>
                </div>
              )}
              {bean.producer && (
                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800/80">
                  <span className="block text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase">Productor</span>
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate block">🧑‍🌾 {bean.producer}</span>
                </div>
              )}
              {bean.process && (
                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800/80">
                  <span className="block text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase">Proceso</span>
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate flex items-center gap-1"><GearIcon className="w-3.5 h-3.5 text-slate-500 inline" /> {bean.process}</span>
                </div>
              )}
              {bean.roast_level && (
                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800/80">
                  <span className="block text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase">Tueste</span>
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate block">🔥 {bean.roast_level}</span>
                </div>
              )}
              {bean.variety && (
                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800/80">
                  <span className="block text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase">Variedad</span>
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate block">🌱 {bean.variety}</span>
                </div>
              )}
              {bean.altitude && (
                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800/80">
                  <span className="block text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase">Altitud</span>
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate flex items-center gap-1"><MountainIcon className="w-3.5 h-3.5 text-slate-500 inline" /> {bean.altitude}</span>
                </div>
              )}
              {bean.harvest_year && (
                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800/80">
                  <span className="block text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase">Año Cosecha</span>
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate block">🌾 {bean.harvest_year}</span>
                </div>
              )}
              {bean.sca_score && (
                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800/80">
                  <span className="block text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase">Puntaje SCA</span>
                  <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 truncate block">🏆 {bean.sca_score}</span>
                </div>
              )}
            </div>
          </div>

          {/* Notas de cata */}
          {bean.tasting_notes && bean.tasting_notes.length > 0 && (
            <div>
              <h5 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase mb-2 tracking-wider">
                Notas de Cata
              </h5>
              <div className="flex flex-wrap gap-1.5 p-3 bg-slate-50 dark:bg-slate-800/20 border border-slate-100 dark:border-slate-800/60 rounded-xl">
                {bean.tasting_notes.map((note) => (
                  <span key={note} className="px-3 py-1 bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-300 border border-amber-250/20 rounded-full text-xs font-bold shadow-sm">
                    {note}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Notas generales */}
          {bean.notes && (
            <div>
              <h5 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase mb-2 tracking-wider">
                Notas Generales
              </h5>
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800/60 rounded-xl italic text-sm text-slate-700 dark:text-slate-300">
                "{bean.notes}"
              </div>
            </div>
          )}

          {bean.roast_date && (
            <div className="text-xs text-slate-400 dark:text-slate-500 text-right pt-1">
              Fecha de tueste: {bean.roast_date}
            </div>
          )}
        </div>

        {/* Botones de acción */}
        <div className="flex gap-3 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 shrink-0">
          <button
            onClick={onCancel}
            className="flex-1 py-3 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl active:scale-[0.98] transition-all text-center cursor-pointer"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3 px-4 bg-amber-700 hover:bg-amber-800 text-white font-bold rounded-xl shadow-md active:scale-[0.98] transition-all text-center cursor-pointer"
          >
            Guardar Grano
          </button>
        </div>
      </div>
    </div>
  );
}
