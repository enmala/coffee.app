import { useState, useMemo } from 'react';
import { PencilIcon, TrashIcon, MapPinIcon, GearIcon, MountainIcon, ShareIcon, HomeIcon, UserIcon, FireIcon, PlantIcon, CalendarIcon, TrophyIcon } from '../icons/SvgIcons';

export default function BeansTab({
  beans,
  beanSearchQuery,
  setBeanSearchQuery,
  onAddBean,
  onEditBean,
  onDeleteBean,
  onShareBean
}) {
  const [menuOpenBeanId, setMenuOpenBeanId] = useState(null);

  const filteredBeans = useMemo(() => {
    const query = beanSearchQuery.toLowerCase().trim();
    if (!query) return beans;
    return beans.filter(b => 
      b.name.toLowerCase().includes(query) ||
      (b.roaster && b.roaster.toLowerCase().includes(query)) ||
      (b.origin && b.origin.toLowerCase().includes(query)) ||
      (b.region && b.region.toLowerCase().includes(query)) ||
      (b.farm && b.farm.toLowerCase().includes(query)) ||
      (b.producer && b.producer.toLowerCase().includes(query)) ||
      (b.variety && b.variety.toLowerCase().includes(query))
    );
  }, [beans, beanSearchQuery]);

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
      <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-3">
        {filteredBeans.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-300 text-center py-8 font-sans">
            {beans.length === 0 
              ? 'No tienes granos registrados aún. ¡Registra uno nuevo para empezar!'
              : 'No se encontraron granos que coincidan con la búsqueda.'}
          </p>
        ) : (
          filteredBeans.map((bean) => (
            <div key={bean.id} className={`p-4 bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-2 text-left relative group ${menuOpenBeanId === bean.id ? 'z-30' : ''}`}>
              <div className="flex justify-between items-start">
                <div className="pr-2 min-w-0 flex-1">
                  <h3 className="font-bold text-slate-900 dark:text-white text-base leading-tight truncate">{bean.name}</h3>
                  {bean.roaster && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate">{bean.roaster}</p>
                  )}
                </div>
                
                {/* Menú contextual */}
                <div className="relative shrink-0">
                  <button
                    data-menu-trigger={bean.id}
                    onClick={() => setMenuOpenBeanId(menuOpenBeanId === bean.id ? null : bean.id)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-700/60 transition cursor-pointer font-bold text-xs"
                    title="Más opciones"
                    aria-label="Más opciones"
                  >
                    •••
                  </button>

                  {menuOpenBeanId === bean.id && (
                    <div
                      data-menu-content={bean.id}
                      className="absolute right-0 top-full mt-1 w-36 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-50 py-1 text-xs animate-fade-in"
                    >
                      <button
                        onClick={() => { onEditBean(bean); setMenuOpenBeanId(null); }}
                        className="w-full text-left px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-700/70 text-slate-700 dark:text-slate-200 flex items-center gap-2 cursor-pointer"
                        title="Editar grano"
                      >
                        <PencilIcon className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" /> Editar
                      </button>
                      <button
                        onClick={() => { onShareBean(bean.id); setMenuOpenBeanId(null); }}
                        className="w-full text-left px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-700/70 text-slate-700 dark:text-slate-200 flex items-center gap-2 cursor-pointer"
                        title="Compartir grano"
                      >
                        <ShareIcon className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" /> Compartir
                      </button>
                      <button
                        onClick={() => { onDeleteBean(bean); setMenuOpenBeanId(null); }}
                        className="w-full text-left px-3 py-2 hover:bg-red-50 dark:hover:bg-red-950/30 text-red-600 dark:text-red-400 flex items-center gap-2 border-t border-slate-100 dark:border-slate-700/60 cursor-pointer"
                        title="Eliminar grano"
                      >
                        <TrashIcon className="w-3.5 h-3.5 text-red-500" /> Eliminar
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Atributos técnicos en badges con iconos SVG */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {bean.origin && (
                  <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded text-[10px] font-semibold flex items-center gap-1">
                    <MapPinIcon className="w-2.5 h-2.5 inline" /> {bean.origin}
                  </span>
                )}
                {bean.region && (
                  <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded text-[10px] font-semibold flex items-center gap-1">
                    <MapPinIcon className="w-2.5 h-2.5 inline" /> Región: {bean.region}
                  </span>
                )}
                {bean.farm && (
                  <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded text-[10px] font-semibold flex items-center gap-1">
                    <HomeIcon className="w-2.5 h-2.5 inline" /> Finca: {bean.farm}
                  </span>
                )}
                {bean.producer && (
                  <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded text-[10px] font-semibold flex items-center gap-1">
                    <UserIcon className="w-2.5 h-2.5 inline" /> Productor: {bean.producer}
                  </span>
                )}
                {bean.process && (
                  <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded text-[10px] font-semibold flex items-center gap-1">
                    <GearIcon className="w-2.5 h-2.5 inline" /> {bean.process}
                  </span>
                )}
                {bean.roast_level && (
                  <span className="px-2 py-0.5 bg-amber-50 dark:bg-amber-950/20 text-amber-900 dark:text-amber-300 border border-amber-200/30 rounded text-[10px] font-semibold flex items-center gap-1">
                    <FireIcon className="w-2.5 h-2.5 inline text-amber-600 dark:text-amber-400" /> Tueste {bean.roast_level}
                  </span>
                )}
                {bean.variety && (
                  <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded text-[10px] font-semibold flex items-center gap-1">
                    <PlantIcon className="w-2.5 h-2.5 inline text-emerald-600 dark:text-emerald-400" /> {bean.variety}
                  </span>
                )}
                {bean.altitude && (
                  <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded text-[10px] font-semibold flex items-center gap-1">
                    <MountainIcon className="w-2.5 h-2.5 inline" /> {bean.altitude}
                  </span>
                )}
                {bean.harvest_year && (
                  <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded text-[10px] font-semibold flex items-center gap-1">
                    <CalendarIcon className="w-2.5 h-2.5 inline" /> Cosecha: {bean.harvest_year}
                  </span>
                )}
                {bean.sca_score && (
                  <span className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300 border border-emerald-200/20 rounded text-[10px] font-bold flex items-center gap-1">
                    <TrophyIcon className="w-2.5 h-2.5 inline text-emerald-600 dark:text-emerald-400" /> SCA: {bean.sca_score}
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
