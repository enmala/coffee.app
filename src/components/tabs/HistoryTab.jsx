import { getMethodIcon, COFFEE_DESCRIPTORS } from '../../utils/coffeeUtils';

export default function HistoryTab({
  history,
  autoLogEnabled,
  setAutoLogEnabled,
  onClearHistory,
  editingHistoryId,
  setEditingHistoryId,
  editingHistoryNotes,
  setEditingHistoryNotes,
  editingHistoryRating,
  setEditingHistoryRating,
  editingHistoryDescriptors,
  setEditingHistoryDescriptors,
  onStartEditHistory,
  onDeleteHistoryEntry,
  onUpdateHistoryEntry,
  safeBack
}) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Historial</h2>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-1.5 cursor-pointer text-xs text-slate-500 dark:text-slate-400 select-none font-medium">
            <input
              type="checkbox"
              checked={autoLogEnabled}
              onChange={(e) => setAutoLogEnabled(e.target.checked)}
              className="rounded border-slate-300 dark:border-slate-700 text-amber-800 focus:ring-amber-500 w-3.5 h-3.5"
            />
            Reg. Auto.
          </label>
          {history.length > 0 && (
            <button
              onClick={onClearHistory}
              className="text-xs text-red-500 hover:text-red-700 dark:hover:text-red-400 underline cursor-pointer"
            >
              Limpiar todo
            </button>
          )}
        </div>
      </div>
      <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1 pb-32">
        {history.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-300 text-center py-8">
            No tienes preparaciones registradas aún. ¡Completa tu primer timer para inaugurar tu historial!
          </p>
        ) : (
          history.map((entry) => {
            const isEditingNote = editingHistoryId === entry.id;
            const dateFormatted = new Date(entry.date).toLocaleString([], {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            });

            return (
              <div key={entry.id} className="p-3 bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2 relative group">
                <div className="flex justify-between items-start">
                  <div className="text-left">
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 block font-semibold">{dateFormatted}</span>
                    <span className="font-bold text-slate-950 dark:text-slate-100 text-sm flex items-center gap-1.5">
                      <span className="w-5 h-5 flex items-center justify-center select-none">{getMethodIcon(entry.method)}</span>
                      {entry.recipeName}
                    </span>

                    {/* Display Star Rating */}
                    {entry.rating > 0 && (
                      <div className="flex items-center gap-0.5 text-amber-500 text-xs mt-0.5" title={`Puntuación: ${entry.rating}/5`}>
                        {'★'.repeat(entry.rating)}{'☆'.repeat(5 - entry.rating)}
                      </div>
                    )}

                    <p className="text-[11px] text-slate-500 dark:text-slate-300 mt-1">
                      {entry.coffee_g}g • {entry.grind_size || 'Molienda N/D'} • {entry.water_g}g agua
                    </p>

                    {entry.bean_name && (
                      <p className="text-[11px] text-amber-805 dark:text-amber-500 font-bold mt-0.5 flex items-center gap-1 select-none">
                        🫘 {entry.bean_name}
                      </p>
                    )}

                    {/* Display Flavor Tags */}
                    {entry.descriptors && entry.descriptors.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {entry.descriptors.map((desc) => (
                          <span key={desc} className="px-1.5 py-0.5 bg-amber-50 dark:bg-amber-950/20 text-amber-805 dark:text-amber-300 border border-amber-100 dark:border-amber-900/20 rounded-full text-[9px] font-bold font-sans">
                            {desc}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-1 opacity-60 group-hover:opacity-100 transition">
                    <button
                      onClick={() => onStartEditHistory(entry)}
                      className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-500 dark:text-slate-300 cursor-pointer"
                      title="Editar observaciones"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => onDeleteHistoryEntry(entry)}
                      className="p-1 hover:bg-red-50 dark:hover:bg-red-950/20 rounded text-red-500 dark:text-red-400 cursor-pointer"
                      title="Eliminar registro"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                {isEditingNote ? (
                  <div className="space-y-3 pt-1 text-left">
                    {/* Edit Rating */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Puntuación:</span>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setEditingHistoryRating(star)}
                            className="text-lg focus:outline-none cursor-pointer transition transform active:scale-125"
                            title={`Puntuar ${star} estrella${star > 1 ? 's' : ''}`}
                          >
                            <span className={star <= editingHistoryRating ? 'text-amber-500' : 'text-slate-300 dark:text-slate-700'}>
                              ★
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Edit Flavor Tags */}
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block">Descriptores de sabor:</span>
                      <div className="flex flex-wrap gap-1">
                        {COFFEE_DESCRIPTORS.map((desc) => {
                          const isSelected = editingHistoryDescriptors.includes(desc);
                          return (
                            <button
                              key={desc}
                              type="button"
                              onClick={() => {
                                setEditingHistoryDescriptors(prev =>
                                  prev.includes(desc) ? prev.filter(d => d !== desc) : [...prev, desc]
                                );
                              }}
                              className={`px-2 py-0.5 rounded-full text-[9px] font-bold border transition cursor-pointer ${
                                isSelected
                                  ? 'bg-amber-100 dark:bg-amber-950/40 border-amber-300 dark:border-amber-900/60 text-amber-900 dark:text-amber-300'
                                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                              }`}
                            >
                              {desc}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Edit Notes */}
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block">Observaciones:</span>
                      <textarea
                        value={editingHistoryNotes}
                        onChange={(e) => setEditingHistoryNotes(e.target.value)}
                        placeholder="Ej: Salió un poco dulce, moler más fino la próxima vez..."
                        className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
                        rows="2"
                      />
                    </div>

                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => {
                          setEditingHistoryId(null);
                          safeBack('edit-history');
                        }}
                        className="px-2 py-1 text-[10px] border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded font-semibold cursor-pointer"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={() => {
                          onUpdateHistoryEntry(entry.id, editingHistoryNotes, editingHistoryRating, editingHistoryDescriptors);
                          setEditingHistoryId(null);
                          safeBack('edit-history');
                        }}
                        className="px-2 py-1 text-[10px] bg-emerald-700 hover:bg-emerald-800 text-white rounded font-semibold cursor-pointer"
                      >
                        Guardar
                      </button>
                    </div>
                  </div>
                ) : entry.notes || entry.rating || (entry.descriptors && entry.descriptors.length > 0) ? (
                  <div className="space-y-1 bg-amber-500/5 dark:bg-amber-500/10 border-l-2 border-amber-600/50 p-2 rounded-r text-left">
                    {entry.notes && (
                      <p className="text-xs text-slate-600 dark:text-slate-300 italic">
                        "{entry.notes}"
                      </p>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setEditingHistoryId(entry.id);
                      setEditingHistoryNotes('');
                      setEditingHistoryRating(entry.rating || 0);
                      setEditingHistoryDescriptors(entry.descriptors || []);
                    }}
                    className="text-[10px] text-slate-400 dark:text-slate-500 hover:text-amber-800 dark:hover:text-amber-500 italic block pl-1 hover:underline cursor-pointer text-left"
                  >
                    + Registrar catación (puntuación y descriptores)
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
