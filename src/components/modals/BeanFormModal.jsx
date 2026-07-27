export default function BeanFormModal({
  isOpen,
  editingBeanId,
  newBean,
  setNewBean,
  customTastingNote,
  setCustomTastingNote,
  DEFAULT_TASTING_NOTES,
  handleSaveBean,
  handleCancelBean,
  handleAddTastingNote,
  handleRemoveTastingNote
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <form
        onSubmit={handleSaveBean}
        className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-xl max-h-[85vh] overflow-y-auto space-y-4 border border-slate-100 dark:border-slate-800 text-left"
      >
        <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            {editingBeanId ? 'Editar Grano de Café' : 'Nuevo Grano de Café'}
          </h3>
          <button
            type="button"
            onClick={handleCancelBean}
            className="text-slate-400 dark:text-slate-300 hover:text-slate-600 dark:hover:text-slate-200 text-xl font-bold leading-none cursor-pointer"
          >
            &times;
          </button>
        </div>

        <div className="space-y-3">
          {/* Nombre */}
          <div className="space-y-1">
            <label htmlFor="bean-name-input" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Nombre del Grano*</label>
            <input
              id="bean-name-input"
              type="text"
              required
              placeholder="Ej: Etiopía Sidamo, Geisha Colombia..."
              value={newBean.name}
              onChange={(e) => setNewBean({ ...newBean, name: e.target.value })}
              className="w-full p-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>

          {/* Tostaduría y País/Origen */}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label htmlFor="bean-roaster-input" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Tostaduría</label>
              <input
                id="bean-roaster-input"
                type="text"
                placeholder="Ej: Nomad, Blue Bottle..."
                value={newBean.roaster}
                onChange={(e) => setNewBean({ ...newBean, roaster: e.target.value })}
                className="w-full p-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="bean-origin-input" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">País/Origen</label>
              <input
                id="bean-origin-input"
                type="text"
                placeholder="Ej: Etiopía, Colombia..."
                value={newBean.origin}
                onChange={(e) => setNewBean({ ...newBean, origin: e.target.value })}
                className="w-full p-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Región y Finca */}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label htmlFor="bean-region-input" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Región</label>
              <input
                id="bean-region-input"
                type="text"
                placeholder="Ej: Sidama, Huila, Tarrazú..."
                value={newBean.region || ''}
                onChange={(e) => setNewBean({ ...newBean, region: e.target.value })}
                className="w-full p-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="bean-farm-input" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Finca</label>
              <input
                id="bean-farm-input"
                type="text"
                placeholder="Ej: Finca El Paraíso..."
                value={newBean.farm || ''}
                onChange={(e) => setNewBean({ ...newBean, farm: e.target.value })}
                className="w-full p-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Productor y Variedad */}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label htmlFor="bean-producer-input" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Productor</label>
              <input
                id="bean-producer-input"
                type="text"
                placeholder="Ej: Diego Bermúdez..."
                value={newBean.producer || ''}
                onChange={(e) => setNewBean({ ...newBean, producer: e.target.value })}
                className="w-full p-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="bean-variety-input" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Variedad</label>
              <input
                id="bean-variety-input"
                type="text"
                placeholder="Ej: Caturra, Castillo, Geisha..."
                value={newBean.variety}
                onChange={(e) => setNewBean({ ...newBean, variety: e.target.value })}
                className="w-full p-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Proceso de Beneficio y Nivel de Tueste */}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label htmlFor="bean-process-input" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Proceso de Beneficio</label>
              <select
                id="bean-process-input"
                value={newBean.process}
                onChange={(e) => setNewBean({ ...newBean, process: e.target.value })}
                className="w-full p-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
              >
                <option value="Lavado">Lavado</option>
                <option value="Natural">Natural</option>
                <option value="Honey">Honey</option>
                <option value="Anaeróbico">Anaeróbico</option>
                <option value="Miel">Miel</option>
                <option value="Otro">Otro / Mezcla</option>
              </select>
            </div>
            <div className="space-y-1">
              <label htmlFor="bean-roast-level-input" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Nivel de Tueste</label>
              <select
                id="bean-roast-level-input"
                value={newBean.roast_level}
                onChange={(e) => setNewBean({ ...newBean, roast_level: e.target.value })}
                className="w-full p-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
              >
                <option value="Claro">Claro</option>
                <option value="Medio-Claro">Medio-Claro</option>
                <option value="Medio">Medio</option>
                <option value="Medio-Oscuro">Medio-Oscuro</option>
                <option value="Oscuro">Oscuro</option>
              </select>
            </div>
          </div>

          {/* Año de Cosecha y Fecha de Tueste */}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label htmlFor="bean-harvest-year-input" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Año de Cosecha</label>
              <input
                id="bean-harvest-year-input"
                type="text"
                placeholder="Ej: 2025 o 2025/2026..."
                value={newBean.harvest_year || ''}
                onChange={(e) => setNewBean({ ...newBean, harvest_year: e.target.value })}
                className="w-full p-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="bean-roast-date-input" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Fecha de Tueste</label>
              <input
                id="bean-roast-date-input"
                type="date"
                value={newBean.roast_date}
                onChange={(e) => setNewBean({ ...newBean, roast_date: e.target.value })}
                className="w-full p-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Puntuación SCA y Altitud */}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label htmlFor="bean-sca-score-input" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Puntuación SCA</label>
              <input
                id="bean-sca-score-input"
                type="number"
                step="0.25"
                min="0"
                max="100"
                placeholder="Ej: 85.5"
                value={newBean.sca_score}
                onChange={(e) => setNewBean({ ...newBean, sca_score: e.target.value })}
                className="w-full p-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="bean-altitude-input" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Altitud</label>
              <input
                id="bean-altitude-input"
                type="text"
                placeholder="Ej: 1900 msnm"
                value={newBean.altitude}
                onChange={(e) => setNewBean({ ...newBean, altitude: e.target.value })}
                className="w-full p-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Perfil de sabor / Notas de Cata */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Descriptores de Sabor (Notas de Cata)</label>
            
            {/* Chips añadidos */}
            {newBean.tasting_notes.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2 bg-slate-50 dark:bg-slate-800/40 p-2 rounded-xl border border-slate-100 dark:border-slate-800">
                {newBean.tasting_notes.map((note) => (
                  <span key={note} className="px-2 py-0.5 bg-amber-50 dark:bg-amber-950/20 text-amber-900 dark:text-amber-300 border border-amber-200/30 rounded-full text-[10px] font-bold flex items-center gap-1">
                    {note}
                    <button
                      type="button"
                      onClick={() => handleRemoveTastingNote(note)}
                      className="text-slate-405 hover:text-red-500 font-extrabold focus:outline-none"
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Predefinidos */}
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 dark:text-slate-500 block font-semibold">Sugeridos (haz clic para añadir):</span>
              <div className="flex flex-wrap gap-1 max-h-[75px] overflow-y-auto border border-slate-100 dark:border-slate-800/60 p-1.5 rounded-lg bg-slate-50/50 dark:bg-slate-800/10">
                {DEFAULT_TASTING_NOTES.map((note) => {
                  const isAdded = newBean.tasting_notes.includes(note);
                  return (
                    <button
                      key={note}
                      type="button"
                      disabled={isAdded}
                      onClick={() => handleAddTastingNote(note)}
                      className={`px-2 py-0.5 rounded-full text-[9px] font-bold border transition cursor-pointer ${
                        isAdded
                          ? 'bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-600 border-slate-200 dark:border-slate-700/50'
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-amber-50 dark:hover:bg-amber-950/20'
                      }`}
                    >
                      {note}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Entrada personalizada */}
            <div className="flex gap-1.5 pt-1">
              <input
                type="text"
                placeholder="Agregar nota personalizada..."
                value={customTastingNote}
                onChange={(e) => setCustomTastingNote(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTastingNote(customTastingNote);
                  }
                }}
                className="flex-1 p-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
              <button
                type="button"
                onClick={() => handleAddTastingNote(customTastingNote)}
                className="px-3 bg-amber-800 hover:bg-amber-900 dark:bg-amber-700 dark:hover:bg-amber-800 text-white rounded-xl text-xs font-bold transition cursor-pointer"
              >
                +
              </button>
            </div>
          </div>

          {/* Notas generales */}
          <div className="space-y-1">
            <label htmlFor="bean-notes-input" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Notas Generales</label>
            <textarea
              id="bean-notes-input"
              placeholder="Ej: Tueste artesanal para filtro, cuerpo medio, acidez brillante..."
              value={newBean.notes}
              onChange={(e) => setNewBean({ ...newBean, notes: e.target.value })}
              className="w-full p-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
              rows="3"
            />
          </div>
        </div>

        <div className="flex gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={handleCancelBean}
            className="flex-1 py-2.5 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl font-bold text-sm transition cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="flex-1 py-2.5 bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white rounded-xl font-bold text-sm transition shadow-sm cursor-pointer"
          >
            Guardar Grano
          </button>
        </div>
      </form>
    </div>
  );
}
