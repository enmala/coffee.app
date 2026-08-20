import { CloseIcon } from '../icons/SvgIcons';
import { STEP_INSTRUCTION_SUGGESTIONS } from '../../constants/defaultData';

export default function StepFormModal({
  isOpen,
  editingStepIndex,
  stepInput,
  setStepInput,
  stepTitleError,
  setStepTitleError,
  onClose,
  onSave
}) {
  if (!isOpen) return null;

  const handleSelectSuggestion = (suggestionText) => {
    setStepInput((prev) => {
      const current = prev?.instruction ? prev.instruction.trim() : '';
      if (!current) {
        return { ...prev, instruction: suggestionText };
      }
      const separator = /[.!?]$/.test(current) ? ' ' : '. ';
      return { ...prev, instruction: `${current}${separator}${suggestionText}` };
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center p-0 md:p-4">
      {/* Backdrop Blur Overlay */}
      <div
        className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        data-testid="step-form-backdrop"
      />

      {/* Bottom Sheet Modal Container */}
      <div className="relative w-full bg-white dark:bg-slate-900 rounded-t-3xl md:rounded-2xl shadow-2xl p-5 border-t md:border border-slate-200 dark:border-slate-800 z-10 max-w-md max-h-[90vh] overflow-y-auto transform transition-transform animate-slide-up space-y-4 text-left">
        {/* Drag handle bar / Indicator (mobile only) */}
        <div className="mx-auto w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full md:hidden mb-1" />

        <div className="flex justify-between items-center pb-1 border-b border-slate-100 dark:border-slate-800">
          <span className="text-xs font-bold text-amber-900 dark:text-amber-400 flex items-center gap-1.5">
            <span>⚡</span> {editingStepIndex !== null ? `Editando Paso ${editingStepIndex + 1}` : 'Agregar Paso de Preparación'}
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar modal de paso"
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-semibold p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <CloseIcon className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3">
          {/* Título del paso */}
          <div>
            <label htmlFor="step-title-input" className="block text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1 pl-0.5">
              Título del paso *
            </label>
            <input
              id="step-title-input"
              type="text"
              placeholder="Título del paso"
              value={stepInput.title}
              onChange={(e) => {
                setStepInput({ ...stepInput, title: e.target.value });
                if (e.target.value.trim() && setStepTitleError) setStepTitleError(false);
              }}
              className={`w-full p-2.5 border rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition ${
                stepTitleError ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 dark:border-slate-700'
              }`}
            />
            {stepTitleError && (
              <p className="text-[10px] text-red-500 font-bold mt-1 pl-1">
                El título del paso es obligatorio.
              </p>
            )}
          </div>

          {/* Agua y Duración */}
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label htmlFor="step-water-input" className="block text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1 pl-0.5">
                Agua a verter (g)
              </label>
              <input
                id="step-water-input"
                type="number"
                placeholder="Agua (g)"
                value={stepInput.water_g || ''}
                onChange={(e) => setStepInput({ ...stepInput, water_g: parseFloat(e.target.value) || 0 })}
                className="w-full p-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                min="0"
                step="1"
              />
            </div>
            <div>
              <label htmlFor="step-duration-input" className="block text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1 pl-0.5">
                Duración (segundos)
              </label>
              <input
                id="step-duration-input"
                type="number"
                placeholder="Tiempo (s)"
                value={stepInput.duration_s || ''}
                onChange={(e) => setStepInput({ ...stepInput, duration_s: parseInt(e.target.value) || 0 })}
                className="w-full p-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                min="0"
                step="1"
              />
            </div>
          </div>

          {/* Instrucción multilínea */}
          <div>
            <div className="flex justify-between items-center mb-1 pl-0.5">
              <label htmlFor="step-instruction-input" className="block text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">
                Instrucción / Descripción (Opcional)
              </label>
            </div>
            <textarea
              id="step-instruction-input"
              rows={3}
              placeholder="Instrucción corta"
              value={stepInput.instruction}
              onChange={(e) => setStepInput({ ...stepInput, instruction: e.target.value })}
              className="w-full p-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none transition leading-relaxed placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />

            {/* Chips de sugerencias rápidas */}
            <div className="mt-1.5">
              <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400 mb-1 pl-0.5">
                Sugerencias rápidas:
              </span>
              <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar -mx-0.5 px-0.5">
                {STEP_INSTRUCTION_SUGGESTIONS.map((sug, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectSuggestion(sug.text)}
                    className="shrink-0 text-[11px] font-medium py-1 px-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-amber-100/70 dark:hover:bg-amber-950/40 text-slate-700 dark:text-slate-300 hover:text-amber-900 dark:hover:text-amber-400 rounded-full border border-slate-200/80 dark:border-slate-700/80 transition cursor-pointer active:scale-95"
                    title={`Insertar: "${sug.text}"`}
                  >
                    {sug.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl font-bold text-xs transition cursor-pointer text-center"
          >
            Cancelar edición
          </button>
          <button
            type="button"
            onClick={onSave}
            className={`flex-[1.5] py-2.5 text-white rounded-xl text-xs font-bold cursor-pointer transition shadow-sm ${
              editingStepIndex !== null
                ? 'bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-700'
                : 'bg-amber-800 hover:bg-amber-900 dark:bg-amber-700 dark:hover:bg-amber-800'
            }`}
          >
            {editingStepIndex !== null ? '✓ Guardar Cambios en Paso' : '+ Agregar Paso a la lista'}
          </button>
        </div>
      </div>
    </div>
  );
}
