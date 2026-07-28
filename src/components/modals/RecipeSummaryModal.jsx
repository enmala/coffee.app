import { useState } from 'react';
import { getIngredientLabel, getGrindLabel } from '../../utils/coffeeUtils';
import { MapPinIcon, GearIcon, MountainIcon, PencilIcon, ClipboardIcon, ClockIcon } from '../icons/SvgIcons';

export default function RecipeSummaryModal({
  summaryRecipe,
  beans,
  onClose,
  onShare,
  onDelete,
  onEdit,
  onDuplicate,
  onStartTimer,
  formatSecondsToMinutes,
  onToggleFavorite
}) {
  const [isRecipeNameExpanded, setIsRecipeNameExpanded] = useState(false);
  const [isBeanExpanded, setIsBeanExpanded] = useState(false);

  if (!summaryRecipe) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-sm w-full shadow-xl max-h-[85vh] border border-slate-100 dark:border-slate-800 flex flex-col overflow-hidden text-left">
        {/* Header Fijo */}
        <div className="p-5 pb-3 border-b border-slate-200 dark:border-slate-800 flex justify-between items-start shrink-0 bg-white dark:bg-slate-900">
          <div className="min-w-0 flex-1">
            <div className="flex items-start gap-1.5 min-w-0">
              <h3 className={`font-bold text-base text-slate-900 dark:text-white ${isRecipeNameExpanded ? 'whitespace-normal break-words leading-snug' : 'truncate'}`}>
                {summaryRecipe.name}
              </h3>
              {summaryRecipe.name.length > 18 && (
                <button
                  onClick={() => setIsRecipeNameExpanded(!isRecipeNameExpanded)}
                  className="p-0.5 mt-0.5 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 shrink-0 transition cursor-pointer"
                  title={isRecipeNameExpanded ? "Contraer nombre" : "Expandir nombre"}
                  aria-label={isRecipeNameExpanded ? "Contraer nombre" : "Expandir nombre"}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`w-4 h-4 transition-transform duration-200 ${isRecipeNameExpanded ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </button>
              )}
            </div>
            <span className="inline-block text-[10px] bg-amber-50 dark:bg-amber-950/20 text-amber-900 dark:text-amber-300 border border-amber-200 dark:border-amber-900/30 px-2 py-0.5 rounded font-bold uppercase tracking-wider mt-1">{summaryRecipe.method}</span>
          </div>
          <div className="flex items-center gap-1 shrink-0 ml-2">
            <button
              onClick={() => onToggleFavorite && onToggleFavorite(summaryRecipe.id)}
              className="p-1.5 text-slate-500 dark:text-slate-300 hover:text-amber-500 dark:hover:text-amber-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              title={summaryRecipe.is_favorite ? "Quitar de favoritas" : "Marcar como favorita"}
              aria-label={summaryRecipe.is_favorite ? "Quitar de favoritas" : "Marcar como favorita"}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={summaryRecipe.is_favorite ? "currentColor" : "none"} stroke="currentColor" strokeWidth={summaryRecipe.is_favorite ? "0" : "1.5"} className={`w-5 h-5 ${summaryRecipe.is_favorite ? "text-amber-500 dark:text-amber-400" : ""}`}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
              </svg>
            </button>

            <button
              onClick={() => onShare(summaryRecipe.id)}
              className="p-1.5 text-slate-500 dark:text-slate-300 hover:text-amber-800 dark:hover:text-amber-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              title="Compartir receta"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 overflow-visible">
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
              </svg>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-500 dark:text-slate-300 hover:text-slate-700 dark:hover:text-slate-100 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              title="Cerrar"
            >
              <span className="hidden">×</span>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <button onClick={onClose} className="hidden">Cerrar</button>
          </div>
        </div>

        {/* Cuerpo Scrollable Único */}
        <div className="p-5 py-4 overflow-y-auto flex-1 space-y-4">
          {/* Parámetros Físicos */}
          <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800/80">
            <div>
              <span className="text-slate-500 dark:text-slate-300 block font-semibold text-[10px] uppercase">{getIngredientLabel(summaryRecipe)}</span>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{summaryRecipe.coffee_g}g</span>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-300 block font-semibold text-[10px] uppercase">{getGrindLabel(summaryRecipe)}</span>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate block">{summaryRecipe.grind_size || 'N/D'}</span>
            </div>
            <div className="mt-1">
              <span className="text-slate-500 dark:text-slate-300 block font-semibold text-[10px] uppercase">Temperatura</span>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{summaryRecipe.water_temp_c}°C</span>
            </div>
            <div className="mt-1">
              <span className="text-slate-500 dark:text-slate-300 block font-semibold text-[10px] uppercase">Agua Total</span>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                {summaryRecipe.steps.reduce((acc, s) => acc + s.water_g, 0)}g
              </span>
            </div>
            <div className="col-span-2 mt-2 pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between">
              <span className="text-slate-500 dark:text-slate-300 font-semibold text-[10px] uppercase">Tiempo Total Estimado</span>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {formatSecondsToMinutes(summaryRecipe.steps.reduce((acc, s) => acc + s.duration_s, 0))}
              </span>
            </div>
          </div>

          {/* Acordeón de Grano de Café */}
          {summaryRecipe.bean_id && beans.find(b => b.id === summaryRecipe.bean_id) && (
            (() => {
              const bean = beans.find(b => b.id === summaryRecipe.bean_id);
              return (
                <div className="border border-amber-200/20 rounded-xl overflow-hidden bg-amber-50/30 dark:bg-amber-950/5">
                  <button
                    onClick={() => setIsBeanExpanded(!isBeanExpanded)}
                    className="w-full flex justify-between items-center p-3 text-xs text-left cursor-pointer transition-all hover:bg-amber-50/50 dark:hover:bg-amber-950/15"
                  >
                    <div className="space-y-0.5">
                      <div className="font-extrabold text-[10px] text-amber-800 dark:text-amber-500 uppercase tracking-wider flex items-center gap-1">
                        <span>🫘</span> Grano de Café
                      </div>
                      <div className="font-bold text-slate-800 dark:text-slate-200">
                        {bean.name} {bean.roaster && <span className="text-[11px] font-normal text-slate-500 dark:text-slate-400 inline-block ml-1">({bean.roaster})</span>}
                      </div>
                    </div>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className={`w-4 h-4 text-slate-405 transition-transform duration-200 ${isBeanExpanded ? 'rotate-180' : ''}`}
                    >
                      <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                    </svg>
                  </button>
                  {isBeanExpanded && (
                    <div className="px-3 pb-3 pt-1.5 border-t border-amber-200/10 dark:border-amber-900/10 space-y-2 text-[11px] animate-fade-in">
                      <div className="flex flex-wrap gap-1">
                        {bean.origin && <span className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[9px] px-1.5 py-0.5 rounded font-medium text-slate-600 dark:text-slate-300">📍 {bean.origin}</span>}
                        {bean.region && <span className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[9px] px-1.5 py-0.5 rounded font-medium text-slate-600 dark:text-slate-300 flex items-center gap-1"><MapPinIcon className="w-2.5 h-2.5 inline" /> {bean.region}</span>}
                        {bean.farm && <span className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[9px] px-1.5 py-0.5 rounded font-medium text-slate-600 dark:text-slate-300">🏡 {bean.farm}</span>}
                        {bean.producer && <span className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[9px] px-1.5 py-0.5 rounded font-medium text-slate-600 dark:text-slate-300">🧑‍🌾 {bean.producer}</span>}
                        {bean.process && <span className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[9px] px-1.5 py-0.5 rounded font-medium text-slate-600 dark:text-slate-300 flex items-center gap-1"><GearIcon className="w-2.5 h-2.5 inline" /> {bean.process}</span>}
                        {bean.roast_level && <span className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[9px] px-1.5 py-0.5 rounded font-medium text-slate-600 dark:text-slate-300">🔥 Tueste {bean.roast_level}</span>}
                        {bean.variety && <span className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[9px] px-1.5 py-0.5 rounded font-medium text-slate-600 dark:text-slate-300">🌱 {bean.variety}</span>}
                        {bean.altitude && <span className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[9px] px-1.5 py-0.5 rounded font-medium text-slate-600 dark:text-slate-300 flex items-center gap-1"><MountainIcon className="w-2.5 h-2.5 inline" /> {bean.altitude}</span>}
                        {bean.harvest_year && <span className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[9px] px-1.5 py-0.5 rounded font-medium text-slate-600 dark:text-slate-300">🌾 {bean.harvest_year}</span>}
                        {bean.sca_score && <span className="bg-emerald-100/50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-400 text-[9px] px-1.5 py-0.5 rounded font-bold border border-emerald-250/10">🏆 SCA {bean.sca_score}</span>}
                      </div>
                      {bean.tasting_notes && bean.tasting_notes.length > 0 && (
                        <div className="flex flex-wrap gap-0.5 pt-1.5 border-t border-amber-200/10 dark:border-amber-900/10">
                          {bean.tasting_notes.map(note => (
                            <span key={note} className="bg-amber-100/40 dark:bg-amber-900/10 text-amber-900 dark:text-amber-300 text-[8px] font-bold px-1.5 py-0.5 rounded-full border border-amber-200/10">
                              {note}
                            </span>
                          ))}
                        </div>
                      )}
                      {bean.notes && (
                        <div className="pt-1.5 border-t border-amber-200/10 dark:border-amber-900/10 text-[10px] text-slate-500 dark:text-slate-400 italic">
                          "{bean.notes}"
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })()
          )}

          {/* Pasos */}
          <div className="space-y-2">
            <h4 className="text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider pl-1">Pasos</h4>
            <div className="space-y-2">
              {summaryRecipe.steps.map((step, idx) => (
                <div key={idx} className="bg-slate-50 dark:bg-slate-800 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800/80 space-y-1 text-xs">
                  <div className="flex justify-between font-bold text-slate-700 dark:text-slate-300">
                    <span>Paso {step.step_number}: {step.title}</span>
                    <span className="text-amber-800 dark:text-amber-400 font-semibold">
                      {step.water_g > 0 ? `+${step.water_g}g` : 'Sin agua'} ({step.duration_s}s)
                    </span>
                  </div>
                  {step.instruction && (
                    <p className="text-slate-500 dark:text-slate-400 italic text-[11px]">"{step.instruction}"</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Fijo */}
        <div className="p-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex gap-2 shrink-0 bg-white dark:bg-slate-900">
          <button
            onClick={(e) => onDelete(summaryRecipe, e)}
            className="p-2 border border-red-200 dark:border-red-900/30 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-600 dark:text-red-400 rounded-xl transition cursor-pointer flex items-center justify-center shrink-0"
            title="Eliminar receta"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
            </svg>
          </button>
          <button
            onClick={() => onEdit(summaryRecipe)}
            className="flex-1 py-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1"
          >
            <PencilIcon className="w-3.5 h-3.5" /> Editar
          </button>
          <button
            onClick={() => onDuplicate && onDuplicate(summaryRecipe)}
            className="flex-1 py-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1"
            title="Duplicar esta receta como base para una nueva"
          >
            <ClipboardIcon className="w-3.5 h-3.5" /> Duplicar
          </button>
          <button
            onClick={() => onStartTimer(summaryRecipe)}
            className="flex-[1.5] py-2 bg-amber-800 hover:bg-amber-900 dark:bg-amber-700 dark:hover:bg-amber-800 text-white rounded-xl font-bold text-xs transition shadow-sm cursor-pointer flex items-center justify-center gap-1.5"
          >
            <ClockIcon className="w-4 h-4" /> Iniciar Timer
          </button>
        </div>
      </div>
    </div>
  );
}
