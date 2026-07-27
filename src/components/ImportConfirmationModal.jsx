import { getMethodIcon } from '../utils/coffeeUtils';

export default function ImportConfirmationModal({ recipe, existingRecipes = [], onConfirm, onCancel }) {
  if (!recipe) return null;

  const isDuplicateName = existingRecipes.some(
    (r) => r.name.toLowerCase().trim() === recipe.name.toLowerCase().trim()
  );

  // Calcular totales
  const totalWater = recipe.steps.reduce((acc, step) => acc + (Number(step.water_g) || 0), 0);
  const totalDuration = recipe.steps.reduce((acc, step) => acc + (Number(step.duration_s) || 0), 0);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm p-4 animate-fade-in">
      <div 
        className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-2xl p-6 max-h-[90vh] flex flex-col transition-all duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera */}
        <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-xl font-bold text-amber-950 dark:text-amber-500 flex items-center gap-2">
            <span>Importar Receta</span>
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
            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg text-amber-900 dark:text-amber-400">
              {getMethodIcon(recipe.method)}
            </div>
            <div>
              <h4 className="text-lg font-bold text-slate-900 dark:text-slate-100 leading-tight">
                {recipe.name}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 capitalize mt-0.5">
                Método: {recipe.method}
              </p>
            </div>
          </div>

          {/* Advertencia de duplicado */}
          {isDuplicateName && (
            <div className="p-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-300/40 dark:border-amber-700/30 rounded-xl flex gap-2 items-center text-amber-800 dark:text-amber-400 text-xs">
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current shrink-0" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
              </svg>
              <span>Ya tienes una receta con este nombre. Se guardará con un número correlativo (ej. "{recipe.name} (1)").</span>
            </div>
          )}

          {/* Parámetros físicos */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800/80">
              <span className="block text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase">Café</span>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{recipe.coffee_g}g</span>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800/80">
              <span className="block text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase">Molienda</span>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate block">{recipe.grind_size || 'N/A'}</span>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800/80">
              <span className="block text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase">Temperatura</span>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{recipe.water_temp_c || 'N/A'}°C</span>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800/80">
              <span className="block text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase">Agua Total</span>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{totalWater}g</span>
            </div>
          </div>

          {/* Pasos de la receta */}
          <div>
            <h5 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase mb-2 tracking-wider">
              Pasos de Preparación ({recipe.steps.length}) • Tiempo total: {formatTime(totalDuration)}
            </h5>
            <div className="border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
              {recipe.steps.map((step, index) => (
                <div key={index} className="p-3 hover:bg-slate-50 dark:hover:bg-slate-800/30 flex justify-between gap-4 transition-colors">
                  <div className="space-y-0.5 min-w-0">
                    <span className="inline-block text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold px-1.5 py-0.5 rounded mr-2">
                      #{step.step_number}
                    </span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">{step.title}</span>
                    {step.instruction && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-xs pl-8">
                        {step.instruction}
                      </p>
                    )}
                  </div>
                  <div className="text-right shrink-0 flex flex-col justify-center text-xs font-semibold text-slate-600 dark:text-slate-400">
                    {step.water_g > 0 && <div>💧 {step.water_g}g</div>}
                    <div>⏱️ {step.duration_s}s</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex gap-3 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 shrink-0">
          <button
            onClick={onCancel}
            className="flex-1 py-3 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl active:scale-[0.98] transition-all text-center"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3 px-4 bg-amber-700 hover:bg-amber-800 text-white font-bold rounded-xl shadow-md active:scale-[0.98] transition-all text-center"
          >
            Guardar Receta
          </button>
        </div>
      </div>
    </div>
  );
}
