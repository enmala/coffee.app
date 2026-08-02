import { getMethodIcon, calculateRatio } from '../../utils/coffeeUtils';

export default function RecipeLibraryTab({
  recipes = [],
  filteredRecipes = [],
  methodsList = ['Todos'],
  isLoading = false,
  error = null,
  isOffline = false,
  searchQuery = '',
  setSearchQuery = () => {},
  selectedMethod = 'Todos',
  setSelectedMethod = () => {},
  isRecipeImported = () => false,
  onSelectRecipe = () => {},
  onImportRecipe = () => {},
  onClose = () => {},
  onReload = () => {}
}) {
  return (
    <div className="space-y-6">
      {/* Header de la Biblioteca */}
      <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={onClose}
            className="p-1 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white rounded-lg transition cursor-pointer"
            title="Volver a mis recetas"
            aria-label="Volver a mis recetas"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
          </button>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>📖 Biblioteca Pública</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Descubre e importa recetas de la comunidad a tu catálogo personal.
            </p>
          </div>
        </div>
      </div>

      {/* Banner de aviso offline */}
      {isOffline && (
        <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 rounded-xl flex items-center justify-between text-xs text-amber-900 dark:text-amber-300">
          <div className="flex items-center gap-2">
            <span>⚡</span>
            <span><strong>Modo offline:</strong> Mostrando el catálogo guardado en caché local.</span>
          </div>
          <button
            onClick={onReload}
            className="px-2 py-1 bg-amber-200/60 dark:bg-amber-900/40 hover:bg-amber-200 text-amber-950 dark:text-amber-200 rounded font-semibold transition cursor-pointer"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* Buscador de la Biblioteca */}
      <div className="relative">
        <input
          type="text"
          placeholder="Buscar por nombre, método, autor o descripción..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-3 py-2 pl-9 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
        />
        <svg className="absolute left-3 top-2.5 w-4 h-4 text-slate-500 dark:text-slate-400 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
      </div>

      {/* Filtros rápidos por Método */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {methodsList.map((method) => {
          const isSelected = selectedMethod === method;
          return (
            <button
              key={method}
              onClick={() => setSelectedMethod(method)}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-amber-800 text-white dark:bg-amber-700'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
              }`}
            >
              {method === 'Todos' ? (
                '🌐 Todos'
              ) : (
                <>
                  <span className="w-4 h-4 flex items-center justify-center select-none">{getMethodIcon(method)}</span>
                  <span>{method}</span>
                </>
              )}
            </button>
          );
        })}
      </div>

      {/* Estado de carga */}
      {isLoading ? (
        <div className="py-12 text-center text-slate-500 dark:text-slate-400 text-sm space-y-2">
          <div className="inline-block w-6 h-6 border-2 border-amber-800 border-t-transparent dark:border-amber-500 dark:border-t-transparent rounded-full animate-spin"></div>
          <p>Cargando biblioteca pública de recetas...</p>
        </div>
      ) : error && filteredRecipes.length === 0 ? (
        /* Estado de error sin recetas */
        <div className="p-8 bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-800 rounded-2xl text-center space-y-3">
          <p className="text-sm text-slate-600 dark:text-slate-300">{error}</p>
          <button
            onClick={onReload}
            className="px-4 py-2 bg-amber-800 hover:bg-amber-900 dark:bg-amber-700 dark:hover:bg-amber-800 text-white text-xs font-bold rounded-xl transition cursor-pointer"
          >
            Reintentar descarga
          </button>
        </div>
      ) : filteredRecipes.length === 0 ? (
        /* Sin resultados de búsqueda */
        <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-8">
          {recipes.length === 0
            ? 'No se encontraron recetas en la biblioteca pública.'
            : 'No se encontraron recetas que coincidan con la búsqueda.'}
        </p>
      ) : (
        /* Listado de tarjetas de recetas de la biblioteca */
        <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-3">
          {filteredRecipes.map((recipe) => {
            const imported = isRecipeImported(recipe);
            const totalWater = recipe.steps ? recipe.steps.reduce((acc, s) => acc + (Number(s.water_g) || 0), 0) : 0;
            const ratio = calculateRatio(recipe.coffee_g, totalWater);

            return (
              <div
                key={recipe.id}
                onClick={() => onSelectRecipe(recipe)}
                className="p-4 bg-slate-50 dark:bg-slate-800/30 hover:bg-amber-50/20 dark:hover:bg-amber-900/10 border border-slate-200 dark:border-slate-800 hover:border-amber-200 dark:hover:border-amber-800/30 rounded-2xl cursor-pointer transition flex flex-col justify-between space-y-3 group"
              >
                <div className="space-y-1.5">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-1.5">
                      <span className="text-base select-none">{getMethodIcon(recipe.method)}</span>
                      <h3 className="font-bold text-slate-900 dark:text-white text-sm leading-tight group-hover:text-amber-800 dark:group-hover:text-amber-400 transition">
                        {recipe.name}
                      </h3>
                    </div>
                    {imported && (
                      <span className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-900/40 rounded-full text-[10px] font-bold shrink-0">
                        ✓ En tu catálogo
                      </span>
                    )}
                  </div>

                  {recipe.author && (
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                      Por: {recipe.author}
                    </p>
                  )}

                  {recipe.description && (
                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 italic">
                      "{recipe.description}"
                    </p>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between">
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 space-x-1">
                    <span>{recipe.coffee_g}g</span>
                    <span>•</span>
                    <span>{recipe.method}</span>
                    {ratio && (
                      <>
                        <span>•</span>
                        <span className="font-semibold text-amber-800 dark:text-amber-300">Ratio {ratio}</span>
                      </>
                    )}
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (imported) {
                        onSelectRecipe(recipe);
                      } else {
                        onImportRecipe(recipe);
                      }
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                      imported
                        ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                        : 'bg-amber-800 hover:bg-amber-900 dark:bg-amber-700 dark:hover:bg-amber-800 text-white shadow-xs'
                    }`}
                  >
                    {imported ? 'Ver Resumen' : '+ Importar'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
