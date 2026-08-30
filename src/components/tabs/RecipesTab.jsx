import { getMethodIcon } from '../../utils/coffeeUtils';
import { ChevronRightIcon, ChevronDownIcon, PencilIcon, TrashIcon, ShareIcon, DocumentDuplicateIcon, ArchiveIcon, ArchiveRestoreIcon, InboxEmptyIcon } from '../icons/SvgIcons';

export default function RecipesTab({
  groupedRecipes,
  collapsedMethods,
  toggleMethodCollapse,
  menuOpenRecipeId,
  setMenuOpenRecipeId,
  onNewRecipe,
  onOpenLibrary,
  onSelectSummary,
  onStartTimerImmediate,
  onEditRecipe,
  onShareRecipe,
  onDuplicateRecipe,
  onDeleteRecipe,
  onToggleFavorite,
  recipeFilterMode,
  setRecipeFilterMode,
  activeCount = 0,
  archivedCount = 0,
  totalCount = 0,
  onArchiveRecipe,
  onUnarchiveRecipe
}) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Tus Recetas</h2>

        <div className="flex gap-2">
          {onOpenLibrary && (
            <button
              onClick={onOpenLibrary}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-lg transition cursor-pointer border border-slate-200 dark:border-slate-700"
            >
              📖 Biblioteca
            </button>
          )}
          <button
            onClick={onNewRecipe}
            className="px-3 py-1.5 bg-amber-800 hover:bg-amber-900 dark:bg-amber-700 dark:hover:bg-amber-800 text-white text-xs font-bold rounded-lg transition cursor-pointer"
          >
            + Nueva Receta
          </button>
        </div>
      </div>

      {/* Chips de filtro de archivado — siempre visibles para permitir navegación entre vistas */}
      <div className="flex flex-wrap gap-1.5 pb-1">
        <button
            onClick={() => setRecipeFilterMode('active')}
            className={`px-2 md:px-3 py-1 rounded-full text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              recipeFilterMode === 'active'
                ? 'bg-amber-800 text-white dark:bg-amber-700'
                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
            title="Ver recetas activas"
            aria-label="Ver recetas activas"
          >
            <span className="w-3.5 h-3.5 flex items-center justify-center">☕</span>
            <span>Activas</span>
            {activeCount > 0 && <span className="bg-white/20 dark:bg-slate-950/30 px-1 py-0.25 rounded-full text-[10px] font-bold">{activeCount}</span>}
          </button>
          <button
            onClick={() => setRecipeFilterMode('archived')}
            className={`px-2 md:px-3 py-1 rounded-full text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              recipeFilterMode === 'archived'
                ? 'bg-amber-800 text-white dark:bg-amber-700'
                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
            title="Ver recetas archivadas"
            aria-label="Ver recetas archivadas"
          >
            <ArchiveIcon className="w-3.5 h-3.5" />
            <span>Archivadas</span>
            <span className="bg-white/20 dark:bg-slate-950/30 px-1 py-0.25 rounded-full text-[10px] font-bold">{archivedCount}</span>
          </button>
          <button
            onClick={() => setRecipeFilterMode('all')}
            className={`px-2 md:px-3 py-1 rounded-full text-xs font-semibold transition cursor-pointer hidden sm:flex items-center gap-1.5 ${
              recipeFilterMode === 'all'
                ? 'bg-amber-800 text-white dark:bg-amber-700'
                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
            title="Ver todas las recetas"
            aria-label="Ver todas las recetas"
          >
            <span className="w-3.5 h-3.5 flex items-center justify-center">🌐</span>
            <span>Todas</span>
            <span className="bg-white/20 dark:bg-slate-950/30 px-1 py-0.25 rounded-full text-[10px] font-bold">{totalCount}</span>
          </button>
        </div>

      <div className="space-y-5">
        {Object.keys(groupedRecipes).length === 0 ? (
          <div className="text-center py-8 space-y-3">
            <div className="flex justify-center">
              {recipeFilterMode === 'active' && archivedCount > 0
                ? <InboxEmptyIcon className="w-10 h-10 text-slate-300 dark:text-slate-500" />
                : <ArchiveIcon className="w-10 h-10 text-slate-300 dark:text-slate-500" />
              }
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-300">
              {recipeFilterMode === 'active' && archivedCount > 0
                ? 'No tienes recetas activas. Todas están archivadas.'
                : recipeFilterMode === 'archived'
                ? 'No tienes recetas archivadas todavía.'
                : 'No tienes recetas guardadas.'
              }
            </p>
            {recipeFilterMode === 'active' && archivedCount > 0 && (
              <button
                onClick={() => setRecipeFilterMode('archived')}
                className="px-3 py-1.5 bg-amber-800 hover:bg-amber-900 dark:bg-amber-700 dark:hover:bg-amber-800 text-white text-xs font-bold rounded-lg transition cursor-pointer"
              >
                Ver Archivadas
              </button>
            )}
          </div>
        ) : (
          Object.keys(groupedRecipes).map((method) => {
            const isCollapsed = !!collapsedMethods[method];
            return (
              <div 
                key={method} 
                className="space-y-2"
              >
                <h3
                  onClick={() => toggleMethodCollapse(method)}
                  className="text-xs font-extrabold text-slate-400 dark:text-slate-300 hover:text-amber-800 dark:hover:text-amber-500 uppercase tracking-wider pl-1 pt-1 flex justify-between items-center cursor-pointer select-none transition-colors duration-200"
                >
                  <span className="flex items-center gap-1.5">
                    <span className="text-sm select-none">{getMethodIcon(method)}</span>
                    <span>{method} ({groupedRecipes[method].length})</span>
                  </span>
                  <span className="text-[10px] transform transition-transform duration-200 mr-1">
                    {isCollapsed ? <ChevronRightIcon className="w-3.5 h-3.5" /> : <ChevronDownIcon className="w-3.5 h-3.5" />}
                  </span>
                </h3>

                {!isCollapsed && (
                  <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-3">
                    {groupedRecipes[method].map((recipe) => (
                      <div
                        key={recipe.id}
                        onClick={() => onSelectSummary(recipe)}
                        className={`p-3 bg-slate-50 dark:bg-slate-800/30 hover:bg-amber-50/20 dark:hover:bg-amber-900/10 border ${
                          recipe.is_favorite ? 'border-amber-300/80 dark:border-amber-600/60 bg-amber-50/40 dark:bg-amber-950/20' : 'border-slate-200 dark:border-slate-800'
                        } ${recipe.is_archived
                          ? 'opacity-75 border-2 border-dashed border-slate-300 dark:border-slate-600'
                          : ''
                        } hover:border-amber-200 dark:hover:border-amber-800/30 rounded-xl cursor-pointer transition flex justify-between items-center group relative ${recipe.id === menuOpenRecipeId ? 'z-30' : ''}`}
                      >
                        {recipe.is_archived && (
                          <span className="absolute top-2 right-2 text-[9px] bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-1.5 py-0.25 rounded font-medium z-10">
                            📦 Archivada
                          </span>
                        )}
                        <div className="space-y-1 min-w-0 flex-1 pr-2">
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (onToggleFavorite) onToggleFavorite(recipe.id);
                              }}
                              className="p-1 -ml-1 text-slate-400 hover:text-amber-500 dark:text-slate-500 dark:hover:text-amber-400 transition cursor-pointer shrink-0"
                              title={recipe.is_favorite ? "Quitar de favoritas" : "Marcar como favorita"}
                              aria-label={recipe.is_favorite ? "Quitar de favoritas" : "Marcar como favorita"}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={recipe.is_favorite ? "currentColor" : "none"} stroke="currentColor" strokeWidth={recipe.is_favorite ? "0" : "1.5"} className={`w-4 h-4 ${recipe.is_favorite ? "text-amber-500 dark:text-amber-400" : ""}`}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
                              </svg>
                            </button>
                            <span className="font-semibold text-slate-950 dark:text-slate-100 text-sm truncate">{recipe.name}</span>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-300 pl-4">
                            {recipe.coffee_g}g • {recipe.grind_size || 'Molienda N/D'} • {recipe.water_temp_c}°C
                          </p>
                          <p className="text-[10px] text-amber-800 dark:text-amber-300 font-medium pl-4">
                            {recipe.steps.length} pasos • {recipe.steps.reduce((acc, s) => acc + s.water_g, 0)}g agua
                          </p>
                        </div>

                        <div className={`relative shrink-0 ${recipe.is_archived ? 'mt-6' : ''}`}>
                          <div className="flex gap-1 transition items-center opacity-85 group-hover:opacity-100">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onStartTimerImmediate(recipe);
                              }}
                              className="p-2 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/20 dark:hover:bg-amber-950/40 text-amber-800 dark:text-amber-500 rounded-xl transition cursor-pointer flex items-center justify-center border border-amber-200/10 dark:border-amber-900/10"
                              title="Iniciar preparación inmediatamente (auto-start)"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                                <path fillRule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clipRule="evenodd" />
                              </svg>
                            </button>

                            <button
                              data-menu-trigger={recipe.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                setMenuOpenRecipeId(menuOpenRecipeId === recipe.id ? null : recipe.id);
                              }}
                              className="p-1.5 text-slate-400 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-700/60 transition cursor-pointer font-bold text-xs"
                              title="Más opciones"
                              aria-label="Más opciones"
                            >
                              •••
                            </button>
                          </div>
                          {menuOpenRecipeId === recipe.id && (
                            <div
                              data-menu-content={recipe.id}
                              onClick={(e) => e.stopPropagation()}
                              className="absolute right-0 top-full mt-1 w-36 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-50 py-1 text-xs animate-fade-in"
                            >
                              <button
                                onClick={(e) => { e.stopPropagation(); onEditRecipe(recipe); setMenuOpenRecipeId(null); }}
                                className="w-full text-left px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-700/70 text-slate-700 dark:text-slate-200 flex items-center gap-2 cursor-pointer"
                              >
                                <PencilIcon className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" /> Editar
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); onShareRecipe(recipe); setMenuOpenRecipeId(null); }}
                                className="w-full text-left px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-700/70 text-slate-700 dark:text-slate-200 flex items-center gap-2 cursor-pointer"
                              >
                                <ShareIcon className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" /> Compartir
                              </button>
                              {onDuplicateRecipe && (
                                <button
                                  onClick={(e) => { e.stopPropagation(); onDuplicateRecipe(recipe); setMenuOpenRecipeId(null); }}
                                  className="w-full text-left px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-700/70 text-slate-700 dark:text-slate-200 flex items-center gap-2 cursor-pointer"
                                >
                                  <DocumentDuplicateIcon className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" /> Duplicar
                                </button>
                              )}
                              {recipe.is_archived ? (
                                <button
                                  onClick={(e) => { e.stopPropagation(); if (onUnarchiveRecipe) onUnarchiveRecipe(recipe.id); setMenuOpenRecipeId(null); }}
                                  className="w-full text-left px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-700/70 text-slate-700 dark:text-slate-200 flex items-center gap-2 cursor-pointer"
                                >
                                  <ArchiveRestoreIcon className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" /> Desarchivar
                                </button>
                              ) : (
                                <button
                                  onClick={(e) => { e.stopPropagation(); if (onArchiveRecipe) onArchiveRecipe(recipe.id, recipe.name); setMenuOpenRecipeId(null); }}
                                  className="w-full text-left px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-700/70 text-slate-700 dark:text-slate-200 flex items-center gap-2 cursor-pointer"
                                >
                                  <ArchiveIcon className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" /> Archivar
                                </button>
                              )}
                              <button
                                onClick={(e) => { e.stopPropagation(); onDeleteRecipe(recipe, e); setMenuOpenRecipeId(null); }}
                                className="w-full text-left px-3 py-2 hover:bg-red-50 dark:hover:bg-red-950/30 text-red-600 dark:text-red-400 flex items-center gap-2 border-t border-slate-100 dark:border-slate-700/60 cursor-pointer"
                              >
                                <TrashIcon className="w-3.5 h-3.5 text-red-500" /> Eliminar
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
