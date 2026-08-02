import { useState, useEffect, useMemo, useCallback } from 'react';
import { safeGetItem, safeSetItem } from '../utils/storageUtils';

export const DEFAULT_CATALOG_URL = 'https://raw.githubusercontent.com/enmala/barista-timer-recipes/main/catalog.json';
const LIBRARY_CACHE_KEY = 'coffee_recipes_library_cache_v1';

export function useRecipeLibrary({ catalogUrl = DEFAULT_CATALOG_URL, userRecipes = [] } = {}) {
  const [recipes, setRecipes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOffline, setIsOffline] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('Todos');
  const [fetchTrigger, setFetchTrigger] = useState(0);

  useEffect(() => {
    let ignore = false;

    async function loadCatalog() {
      const cachedData = safeGetItem(LIBRARY_CACHE_KEY, null, Array.isArray);

      if (typeof navigator !== 'undefined' && navigator.onLine === false) {
        if (cachedData && cachedData.length > 0) {
          if (!ignore) {
            setRecipes(cachedData);
            setIsOffline(true);
            setIsLoading(false);
          }
          return;
        }
      }

      try {
        const response = await fetch(catalogUrl, { cache: 'no-cache' });
        if (!response.ok) {
          throw new Error(`Error HTTP ${response.status}`);
        }

        const data = await response.json();
        if (!Array.isArray(data)) {
          throw new Error('Formato de catálogo no válido');
        }

        if (!ignore) {
          setRecipes(data);
          setError(null);
          setIsOffline(false);
          safeSetItem(LIBRARY_CACHE_KEY, data);
          setIsLoading(false);
        }
      } catch (err) {
        console.warn('[useRecipeLibrary] Error al descargar catálogo público:', err);

        if (!ignore) {
          if (cachedData && cachedData.length > 0) {
            setRecipes(cachedData);
            setIsOffline(true);
            setError(null);
          } else {
            setError('No se pudo cargar el catálogo de recetas. Por favor, verifica tu conexión a internet.');
          }
          setIsLoading(false);
        }
      }
    }

    loadCatalog();

    return () => {
      ignore = true;
    };
  }, [catalogUrl, fetchTrigger]);

  const reloadCatalog = useCallback(() => {
    setIsLoading(true);
    setError(null);
    setIsOffline(false);
    setFetchTrigger((prev) => prev + 1);
  }, []);

  const methodsList = useMemo(() => {
    const methodsSet = new Set(recipes.map((r) => r.method || 'Otros'));
    return ['Todos', ...Array.from(methodsSet).sort()];
  }, [recipes]);

  const filteredRecipes = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    return recipes.filter((recipe) => {
      const matchesMethod = selectedMethod === 'Todos' || (recipe.method || 'Otros') === selectedMethod;
      if (!matchesMethod) return false;

      if (!query) return true;

      const nameMatch = recipe.name && recipe.name.toLowerCase().includes(query);
      const methodMatch = recipe.method && recipe.method.toLowerCase().includes(query);
      const authorMatch = recipe.author && recipe.author.toLowerCase().includes(query);
      const descMatch = recipe.description && recipe.description.toLowerCase().includes(query);

      return nameMatch || methodMatch || authorMatch || descMatch;
    });
  }, [recipes, searchQuery, selectedMethod]);

  const isRecipeImported = useCallback(
    (recipe) => {
      if (!recipe || !Array.isArray(userRecipes)) return false;
      return userRecipes.some(
        (ur) => ur.id === recipe.id || ur.name.toLowerCase().trim() === recipe.name.toLowerCase().trim()
      );
    },
    [userRecipes]
  );

  return {
    recipes,
    filteredRecipes,
    methodsList,
    isLoading,
    error,
    isOffline,
    searchQuery,
    setSearchQuery,
    selectedMethod,
    setSelectedMethod,
    isRecipeImported,
    reloadCatalog
  };
}
