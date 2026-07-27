export default function BeansTab({
  beans,
  beanSearchQuery,
  setBeanSearchQuery,
  onAddBean,
  onEditBean,
  onDeleteBean,
  onShareBean
}) {
  const filteredBeans = beans.filter(b => 
    b.name.toLowerCase().includes(beanSearchQuery.toLowerCase()) ||
    (b.roaster && b.roaster.toLowerCase().includes(beanSearchQuery.toLowerCase())) ||
    (b.origin && b.origin.toLowerCase().includes(beanSearchQuery.toLowerCase())) ||
    (b.region && b.region.toLowerCase().includes(beanSearchQuery.toLowerCase())) ||
    (b.farm && b.farm.toLowerCase().includes(beanSearchQuery.toLowerCase())) ||
    (b.producer && b.producer.toLowerCase().includes(beanSearchQuery.toLowerCase())) ||
    (b.variety && b.variety.toLowerCase().includes(beanSearchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Tus Granos</h2>
        <div className="flex gap-2">
          <button
            onClick={onAddBean}
            className="px-3 py-1.5 bg-amber-800 hover:bg-amber-900 dark:bg-amber-700 dark:hover:bg-amber-800 text-white text-xs font-bold rounded-lg transition cursor-pointer"
          >
            + Agregar Grano
          </button>
        </div>
      </div>

      {/* Buscador de granos */}
      <div className="relative">
        <input
          type="text"
          placeholder="Buscar por nombre, origen, finca, productor, tostaduría..."
          value={beanSearchQuery}
          onChange={(e) => setBeanSearchQuery(e.target.value)}
          className="w-full px-3 py-2 pl-9 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
        />
        <svg className="absolute left-3 top-2.5 w-4 h-4 text-slate-500 dark:text-slate-300 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
      </div>

      {/* Listado de granos */}
      <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1 pb-32">
        {filteredBeans.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-300 text-center py-8 font-sans">
            {beans.length === 0 
              ? 'No tienes granos registrados aún. ¡Registra uno nuevo para empezar!'
              : 'No se encontraron granos que coincidan con la búsqueda.'}
          </p>
        ) : (
          filteredBeans.map((bean) => (
            <div key={bean.id} className="p-4 bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-2 text-left relative group">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base leading-tight">{bean.name}</h3>
                  {bean.roaster && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{bean.roaster}</p>
                  )}
                </div>
                
                {/* Botones de acción */}
                <div className="flex gap-2">
                  <button
                    onClick={() => onShareBean(bean.id)}
                    className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition text-slate-500 dark:text-slate-400 hover:text-amber-800 dark:hover:text-amber-500 cursor-pointer flex items-center justify-center"
                    title="Compartir grano"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 overflow-visible">
                      <circle cx="18" cy="5" r="3" />
                      <circle cx="6" cy="12" r="3" />
                      <circle cx="18" cy="19" r="3" />
                      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                    </svg>
                  </button>
                  <button
                    onClick={() => onEditBean(bean)}
                    className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition text-xs cursor-pointer"
                    title="Editar grano"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => onDeleteBean(bean)}
                    className="p-1 hover:bg-red-50 dark:hover:bg-red-950/20 rounded transition text-xs cursor-pointer"
                    title="Eliminar grano"
                  >
                    🗑️
                  </button>
                </div>
              </div>

              {/* Atributos técnicos en badges */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {bean.origin && (
                  <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded text-[10px] font-semibold">
                    📍 {bean.origin}
                  </span>
                )}
                {bean.region && (
                  <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded text-[10px] font-semibold">
                    🗺️ Región: {bean.region}
                  </span>
                )}
                {bean.farm && (
                  <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded text-[10px] font-semibold">
                    🏡 Finca: {bean.farm}
                  </span>
                )}
                {bean.producer && (
                  <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded text-[10px] font-semibold">
                    🧑‍🌾 Productor: {bean.producer}
                  </span>
                )}
                {bean.process && (
                  <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded text-[10px] font-semibold">
                    ⚙️ {bean.process}
                  </span>
                )}
                {bean.roast_level && (
                  <span className="px-2 py-0.5 bg-amber-50 dark:bg-amber-950/20 text-amber-900 dark:text-amber-300 border border-amber-200/30 rounded text-[10px] font-semibold">
                    🔥 Tueste {bean.roast_level}
                  </span>
                )}
                {bean.variety && (
                  <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded text-[10px] font-semibold">
                    🌱 {bean.variety}
                  </span>
                )}
                {bean.altitude && (
                  <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded text-[10px] font-semibold">
                    🏔️ {bean.altitude}
                  </span>
                )}
                {bean.harvest_year && (
                  <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded text-[10px] font-semibold">
                    🌾 Cosecha: {bean.harvest_year}
                  </span>
                )}
                {bean.sca_score && (
                  <span className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-805 dark:text-emerald-300 border border-emerald-200/20 rounded text-[10px] font-bold">
                    🏆 SCA: {bean.sca_score}
                  </span>
                )}
              </div>

              {/* Notas de cata */}
              {bean.tasting_notes && bean.tasting_notes.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-1.5">
                  {bean.tasting_notes.map((note) => (
                    <span key={note} className="px-2 py-0.5 bg-amber-50 dark:bg-amber-950/20 text-amber-900 dark:text-amber-300 border border-amber-200/20 rounded-full text-[9px] font-bold">
                      {note}
                    </span>
                  ))}
                </div>
              )}

              {/* Notas generales */}
              {bean.notes && (
                <p className="text-xs text-slate-600 dark:text-slate-400 pt-1.5 border-t border-slate-100 dark:border-slate-800 italic">
                  "{bean.notes}"
                </p>
              )}

              {bean.roast_date && (
                <div className="text-[9px] text-slate-400 dark:text-slate-500 pt-1 text-right">
                  Tostado el: {bean.roast_date}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
