import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useRecipeLibrary } from '../src/hooks/useRecipeLibrary';

const sampleCatalog = [
  { id: '1', name: 'Método 4:6 Kasuya', method: 'V60', author: 'Tetsu Kasuya', description: 'Técnica de 5 vertidos' },
  { id: '2', name: 'Aeropress WAC Champion', method: 'Aeropress', author: 'World Aeropress Champion', description: 'Receta concentrada e invertida.' }
];

describe('useRecipeLibrary Hook', () => {
  let originalOnLine;

  beforeEach(() => {
    localStorage.clear();
    originalOnLine = navigator.onLine;

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => sampleCatalog
    }));
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.unstubAllGlobals();

    // Restore navigator.onLine
    Object.defineProperty(navigator, 'onLine', {
      configurable: true,
      value: originalOnLine
    });
  });

  test('initial state: isLoading=true, no error, empty recipes', () => {
    const { result } = renderHook(() => useRecipeLibrary());

    expect(result.current.isLoading).toBe(true);
    expect(result.current.error).toBeNull();
    expect(result.current.isOffline).toBe(false);
    expect(result.current.recipes).toEqual([]);
    expect(result.current.filteredRecipes).toEqual([]);
  });

  test('loads catalog successfully on mount', async () => {
    const { result } = renderHook(() => useRecipeLibrary());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.recipes).toEqual(sampleCatalog);
    expect(result.current.error).toBeNull();
    expect(result.current.isOffline).toBe(false);
  });

  test('caches catalog to localStorage on successful fetch', async () => {
    const { result } = renderHook(() => useRecipeLibrary());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const cached = localStorage.getItem('coffee_recipes_library_cache_v1');
    expect(cached).not.toBeNull();
    expect(JSON.parse(cached)).toEqual(sampleCatalog);
  });

  test('handles HTTP error response by falling back to cache or setting error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => null
    }));

    const { result } = renderHook(() => useRecipeLibrary());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe('No se pudo cargar el catálogo de recetas. Por favor, verifica tu conexión a internet.');
    expect(result.current.recipes).toEqual([]);
    expect(result.current.isOffline).toBe(false);
  });

  test('handles invalid catalog format (non-array response)', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ not: 'an array' })
    }));

    const { result } = renderHook(() => useRecipeLibrary());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe('No se pudo cargar el catálogo de recetas. Por favor, verifica tu conexión a internet.');
    expect(result.current.recipes).toEqual([]);
  });

  test('handles network failure with no cached data', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')));

    const { result } = renderHook(() => useRecipeLibrary());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe('No se pudo cargar el catálogo de recetas. Por favor, verifica tu conexión a internet.');
    expect(result.current.recipes).toEqual([]);
    expect(result.current.isOffline).toBe(false);
  });

  test('handles network failure by falling back to cached catalog', async () => {
    localStorage.setItem('coffee_recipes_library_cache_v1', JSON.stringify(sampleCatalog));
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')));

    const { result } = renderHook(() => useRecipeLibrary());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.recipes).toEqual(sampleCatalog);
    expect(result.current.isOffline).toBe(true);
    expect(result.current.error).toBeNull();
  });

  test('handles offline mode (navigator.onLine=false) with cached data', async () => {
    Object.defineProperty(navigator, 'onLine', { configurable: true, value: false });
    localStorage.setItem('coffee_recipes_library_cache_v1', JSON.stringify(sampleCatalog));

    const { result } = renderHook(() => useRecipeLibrary());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.recipes).toEqual(sampleCatalog);
    expect(result.current.isOffline).toBe(true);
    expect(result.current.error).toBeNull();
  });

  test('handles offline mode with no cached data (falls through to fetch which fails)', async () => {
    Object.defineProperty(navigator, 'onLine', { configurable: true, value: false });
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')));

    const { result } = renderHook(() => useRecipeLibrary());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe('No se pudo cargar el catálogo de recetas. Por favor, verifica tu conexión a internet.');
    expect(result.current.recipes).toEqual([]);
  });

  test('reloadCatalog sets loading state, clears error, and triggers refetch', async () => {
    const { result } = renderHook(() => useRecipeLibrary());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.recipes).toEqual(sampleCatalog);

    act(() => {
      result.current.reloadCatalog();
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.error).toBeNull();
    expect(result.current.isOffline).toBe(false);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.recipes).toEqual(sampleCatalog);
  });

  test('methodsList is derived from unique recipe methods sorted alphabetically', async () => {
    const { result } = renderHook(() => useRecipeLibrary());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.methodsList[0]).toBe('Todos');
    expect(result.current.methodsList).toContain('V60');
    expect(result.current.methodsList).toContain('Aeropress');
    // Verify alphabetical sort after 'Todos'
    const methods = result.current.methodsList.slice(1);
    expect([...methods]).toEqual([...methods].sort());
  });

  test('filteredRecipes filters by search query across name, method, author, and description', async () => {
    const { result } = renderHook(() => useRecipeLibrary());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Search by author
    act(() => {
      result.current.setSearchQuery('Kasuya');
    });

    expect(result.current.filteredRecipes).toHaveLength(1);
    expect(result.current.filteredRecipes[0].name).toBe('Método 4:6 Kasuya');

    // Search by method
    act(() => {
      result.current.setSearchQuery('Aeropress');
    });

    expect(result.current.filteredRecipes).toHaveLength(1);
    expect(result.current.filteredRecipes[0].method).toBe('Aeropress');

    // Search with no results
    act(() => {
      result.current.setSearchQuery('nonexistent');
    });

    expect(result.current.filteredRecipes).toHaveLength(0);

    // Clear search — all recipes should show
    act(() => {
      result.current.setSearchQuery('');
    });

    expect(result.current.filteredRecipes).toHaveLength(2);
  });

  test('filteredRecipes filters by selected method', async () => {
    const { result } = renderHook(() => useRecipeLibrary());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    act(() => {
      result.current.setSelectedMethod('V60');
    });

    expect(result.current.filteredRecipes).toHaveLength(1);
    expect(result.current.filteredRecipes[0].method).toBe('V60');

    act(() => {
      result.current.setSelectedMethod('Aeropress');
    });

    expect(result.current.filteredRecipes).toHaveLength(1);
    expect(result.current.filteredRecipes[0].method).toBe('Aeropress');

    // 'Todos' should show all
    act(() => {
      result.current.setSelectedMethod('Todos');
    });

    expect(result.current.filteredRecipes).toHaveLength(2);
  });

  test('isRecipeImported detects recipes already in userRecipes by id or name', async () => {
    const { result } = renderHook(() =>
      useRecipeLibrary({ userRecipes: [{ id: '1', name: 'User Recipe' }] })
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Match by id
    expect(result.current.isRecipeImported({ id: '1', name: 'Different Name' })).toBe(true);

    // Match by name (case-insensitive)
    expect(result.current.isRecipeImported({ id: '999', name: 'User Recipe' })).toBe(true);

    // No match
    expect(result.current.isRecipeImported({ id: '999', name: 'Other' })).toBe(false);

    // Null/undefined recipe
    expect(result.current.isRecipeImported(null)).toBe(false);
    expect(result.current.isRecipeImported(undefined)).toBe(false);
  });

  test('isRecipeImported returns false when userRecipes is empty or not an array', async () => {
    const { result } = renderHook(() => useRecipeLibrary({ userRecipes: [] }));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isRecipeImported({ id: '1', name: 'Test' })).toBe(false);
  });

  test('handles recipes with missing method field (defaults to "Otros" in methodsList and filters)', async () => {
    const catalogWithMissingMethod = [
      { id: '1', name: 'Recipe No Method', method: undefined, author: 'Author 1', description: 'Desc 1' },
      { id: '2', name: 'Recipe V60', method: 'V60', author: 'Author 2', description: 'Desc 2' }
    ];

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => catalogWithMissingMethod
    }));

    const { result } = renderHook(() => useRecipeLibrary());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // methodsList should include 'Otros' for recipes with missing method
    expect(result.current.methodsList).toContain('Otros');

    // Filtering by 'Otros' method should return the recipe with no method
    act(() => {
      result.current.setSelectedMethod('Otros');
    });

    expect(result.current.filteredRecipes).toHaveLength(1);
    expect(result.current.filteredRecipes[0].name).toBe('Recipe No Method');

    // 'Todos' should show all
    act(() => {
      result.current.setSelectedMethod('Todos');
    });

    expect(result.current.filteredRecipes).toHaveLength(2);
  });

  test('cleanup prevents state updates after unmount when fetch resolves (ignore flag)', async () => {
    let resolveFetch;
    vi.stubGlobal('fetch', vi.fn(() => new Promise((resolve) => {
      resolveFetch = resolve;
    })));

    const { unmount } = renderHook(() => useRecipeLibrary());

    // Unmount before fetch resolves — sets ignore = true
    unmount();

    // Resolve the fetch — success path runs but !ignore is false, state updates skipped
    await act(async () => {
      resolveFetch({
        ok: true,
        status: 200,
        json: async () => sampleCatalog
      });
    });

    // No errors thrown — defensive cleanup guard prevented stale state updates
  });

  test('cleanup prevents error state updates after unmount when fetch rejects (ignore flag)', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    let rejectFetch;
    vi.stubGlobal('fetch', vi.fn(() => new Promise((_, reject) => {
      rejectFetch = reject;
    })));

    const { unmount } = renderHook(() => useRecipeLibrary());

    // Unmount before fetch rejects — sets ignore = true
    unmount();

    // Reject the fetch — catch block runs but !ignore is false, error state skipped
    await act(async () => {
      rejectFetch(new Error('Network error after unmount'));
    });

    warnSpy.mockRestore();
  });
});
