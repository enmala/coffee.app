import { getGrindLabel, getRecipeCategory } from '../../utils/coffeeUtils';

export default function RecipeFormModal({
  editingRecipeId,
  newRecipe,
  setNewRecipe,
  beans,
  editingStepIndex,
  setEditingStepIndex,
  totalStepsTime,
  totalStepsWater,
  handleSaveRecipe,
  handleOpenStepEditor,
  handleCloseStepEditor,
  handleMoveStep,
  handleCancelForm
}) {
  const grindLabel = getGrindLabel(newRecipe);

  return (
    <div>
      <div className="flex justify-between items-center mb-4 border-b border-slate-200 dark:border-slate-800 pb-2">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          {editingRecipeId ? 'Editar Receta' : 'Nueva Receta'}
        </h2>
      </div>

      <form onSubmit={handleSaveRecipe} className="space-y-4">
        <div>
          <label htmlFor="recipe-name-input" className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">Nombre de la receta</label>
          <input
            id="recipe-name-input"
            type="text"
            value={newRecipe.name}
            onChange={(e) => setNewRecipe({ ...newRecipe, name: e.target.value })}
            className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
            placeholder="Ej: Mi V60 Balanceado"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">Método</label>
            <select
              value={newRecipe.method}
              onChange={(e) => setNewRecipe({ ...newRecipe, method: e.target.value })}
              className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <optgroup label="Métodos de Café">
                <option value="V60">V60</option>
                <option value="Aeropress">Aeropress</option>
                <option value="Chemex">Chemex</option>
                <option value="Hario Switch">Hario Switch</option>
                <option value="Moka">Moka</option>
                <option value="Origami">Origami</option>
                <option value="Prensa Francesa">Prensa Francesa</option>
              </optgroup>
              <optgroup label="Métodos de Té">
                <option value="Matcha">Matcha</option>
                <option value="Sencha">Sencha (Té Verde)</option>
                <option value="Gongfu">Gongfu (Té)</option>
                <option value="Té Negro / Herbal">Té Negro / Herbal</option>
              </optgroup>
              <option value="Otro">Otro</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">{grindLabel}</label>
            <input
              type="text"
              value={newRecipe.grind_size}
              onChange={(e) => setNewRecipe({ ...newRecipe, grind_size: e.target.value })}
              className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="Ej: Fina, Media, 15 clicks"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">{getRecipeCategory(newRecipe) === 'tea' ? 'Té / Insumo Inicial' : 'Café Inicial'} (g)</label>
            <input
              type="number"
              value={newRecipe.coffee_g}
              onChange={(e) => setNewRecipe({ ...newRecipe, coffee_g: parseFloat(e.target.value) || 0 })}
              className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              min="0.1"
              step="0.1"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">Temperatura (°C)</label>
            <input
              type="number"
              value={newRecipe.water_temp_c}
              onChange={(e) => setNewRecipe({ ...newRecipe, water_temp_c: parseInt(e.target.value) || 0 })}
              className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              min="1"
            />
          </div>
        </div>

        <div>
          <label htmlFor="recipe-bean-input" className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">Grano de Café (Opcional)</label>
          <select
            id="recipe-bean-input"
            value={newRecipe.bean_id || ''}
            onChange={(e) => setNewRecipe({ ...newRecipe, bean_id: e.target.value })}
            className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="">-- Sin grano asociado --</option>
            {beans.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name} {b.roaster ? `(${b.roaster})` : ''}
              </option>
            ))}
          </select>
          {beans.length === 0 && (
            <p className="text-[10px] text-amber-805 dark:text-amber-500 mt-1 font-semibold">
              No tienes granos registrados. Puedes agregarlos en la pestaña "Granos".
            </p>
          )}
        </div>

        <div className="border-t border-slate-200 dark:border-slate-800 pt-3 mt-2 text-left">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              Pasos Añadidos ({newRecipe.steps.length})
            </h3>
            {newRecipe.steps.length > 0 && (
              <span className="text-xs font-semibold text-amber-900 dark:text-amber-400 bg-amber-100/60 dark:bg-amber-955/20 px-2 py-0.5 rounded-lg border border-amber-200/20">
                ⏱️ {totalStepsTime}s • 💧 {totalStepsWater}g
              </span>
            )}
          </div>

          {newRecipe.steps.length > 0 && (
            <ul className="mb-4 bg-slate-50 dark:bg-slate-800 rounded-xl p-2.5 divide-y divide-slate-200/80 dark:divide-slate-800/80 border border-slate-200/40 dark:border-slate-800/60">
              {newRecipe.steps.map((s, idx) => (
                <li key={idx} className={`py-2 px-2.5 flex justify-between items-center rounded-lg transition ${editingStepIndex === idx ? 'bg-amber-100/40 dark:bg-amber-900/10 border border-amber-500/20' : 'hover:bg-slate-100/50 dark:hover:bg-slate-800/30'}`}>
                  <div
                    className="flex-1 cursor-pointer pr-3 select-none text-left"
                    onClick={() => handleOpenStepEditor(idx)}
                    title="Haz clic para editar este paso"
                  >
                    <span className="font-bold text-sm text-slate-900 dark:text-white block">
                      {s.step_number}. {s.title}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 block mt-0.5">
                      ⏱️ {s.duration_s}s • 💧 {s.water_g}g {s.instruction ? `• "${s.instruction}"` : ''}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleMoveStep(idx, 'up')}
                      disabled={idx === 0}
                      className="p-1 hover:bg-slate-200/60 dark:hover:bg-slate-700 disabled:opacity-20 rounded-lg text-xs cursor-pointer font-bold transition text-slate-500 dark:text-slate-400"
                      title="Mover arriba"
                    >
                      ▲
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMoveStep(idx, 'down')}
                      disabled={idx === newRecipe.steps.length - 1}
                      className="p-1 hover:bg-slate-200/60 dark:hover:bg-slate-700 disabled:opacity-20 rounded-lg text-xs cursor-pointer font-bold transition text-slate-500 dark:text-slate-400"
                      title="Mover abajo"
                    >
                      ▼
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setNewRecipe(prev => {
                          const updatedSteps = prev.steps.filter((_, i) => i !== idx).map((step, i) => ({
                            ...step,
                            step_number: i + 1
                          }));
                          return { ...prev, steps: updatedSteps };
                        });
                        if (editingStepIndex === idx) {
                          handleCloseStepEditor();
                        } else if (editingStepIndex > idx) {
                          setEditingStepIndex(editingStepIndex - 1);
                        }
                      }}
                      className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-955/20 rounded-lg font-bold text-xs cursor-pointer transition"
                      title="Eliminar paso"
                    >
                      ✕
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <button
            type="button"
            onClick={() => handleOpenStepEditor(null)}
            className="w-full py-3 border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-amber-500 dark:hover:border-amber-600 rounded-xl text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-amber-800 dark:hover:text-amber-500 hover:bg-amber-50/10 dark:hover:bg-amber-955/5 transition cursor-pointer flex items-center justify-center gap-1.5"
          >
            + Agregar Paso
          </button>
        </div>

        <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={handleCancelForm}
            className="flex-1 py-2.5 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-655 dark:text-slate-350 rounded-xl font-bold text-sm transition cursor-pointer text-center"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="flex-1 py-2.5 bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white rounded-xl font-bold text-sm transition shadow-sm cursor-pointer text-center"
          >
            Guardar Receta
          </button>
        </div>
      </form>
    </div>
  );
}
