/**
 * Utility functions for safe localStorage operations and JSON parsing.
 * Prevents application crashes when localStorage is full, restricted (e.g. private browsing),
 * unavailable, or contains corrupted JSON data.
 */

/**
 * Safely reads and parses a JSON value from localStorage.
 * @template T
 * @param {string} key - localStorage key
 * @param {T} fallbackValue - Value returned if key doesn't exist, read fails, or validation fails
 * @param {function(any): boolean} [validator] - Optional validation function to check parsed data structure
 * @returns {T}
 */
export function safeGetItem(key, fallbackValue, validator = null) {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return fallbackValue;
    }
    const item = window.localStorage.getItem(key);
    if (item === null || item === undefined) {
      return fallbackValue;
    }
    let parsed;
    let parseFailed = false;
    try {
      parsed = JSON.parse(item);
    } catch (e) {
      parseFailed = true;
      if (typeof fallbackValue === 'string') {
        parsed = item;
      } else {
        console.warn(`[storageUtils] Error al leer/parsear localStorage clave "${key}":`, e);
        return fallbackValue;
      }
    }
    if (validator && typeof validator === 'function') {
      if (!validator(parsed)) {
        if (parseFailed) {
          console.warn(`[storageUtils] Error al leer/parsear localStorage clave "${key}": validación fallida`);
        }
        return fallbackValue;
      }
    }
    return parsed;
  } catch (error) {
    console.warn(`[storageUtils] Error al leer/parsear localStorage clave "${key}":`, error);
    return fallbackValue;
  }
}

/**
 * Safely writes a value to localStorage.
 * @param {string} key - localStorage key
 * @param {any} value - Value to serialize and store
 * @returns {boolean} True if write succeeded, false otherwise
 */
export function safeSetItem(key, value) {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return false;
    }
    const serialized = typeof value === 'string' ? value : JSON.stringify(value);
    window.localStorage.setItem(key, serialized);
    return true;
  } catch (error) {
    console.warn(`[storageUtils] Error al guardar en localStorage clave "${key}":`, error);
    return false;
  }
}

/**
 * Safely removes an item from localStorage.
 * @param {string} key - localStorage key
 * @returns {boolean} True if removal succeeded, false otherwise
 */
export function safeRemoveItem(key) {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return false;
    }
    window.localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.warn(`[storageUtils] Error al eliminar clave "${key}" de localStorage:`, error);
    return false;
  }
}
