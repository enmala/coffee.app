/**
 * Utility functions for safe localStorage operations and JSON parsing.
 * Prevents application crashes when localStorage is full, restricted (e.g. private browsing),
 * unavailable, or contains corrupted JSON data.
 */

/**
 * Safely reads and parses a JSON value from localStorage.
 * Handles both JSON-serialized values (objects, arrays, booleans, numbers) and legacy unquoted plain strings.
 * 
 * Contract:
 * 1. If key doesn't exist or localStorage is unavailable/throws -> returns fallbackValue.
 * 2. Parses JSON string. If JSON parsing succeeds and validator passes (if provided) -> returns parsed value.
 * 3. If JSON parsing fails (e.g. unquoted plain strings stored via raw setItem like 'dark' or 'normal'):
 *    - If validator is provided: tests item against validator. Returns item if valid, fallbackValue otherwise.
 *    - If no validator is provided: if fallbackValue is a string, returns item; if fallbackValue is not a string, logs a warning and returns fallbackValue.
 *
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

    try {
      const parsed = JSON.parse(item);
      if (validator && typeof validator === 'function') {
        return validator(parsed) ? parsed : fallbackValue;
      }
      return parsed;
    } catch (parseError) {
      // JSON.parse failed (e.g. unquoted plain strings stored without JSON syntax, or corrupted JSON)
      if (validator && typeof validator === 'function') {
        if (validator(item)) {
          return item;
        }
        console.warn(`[storageUtils] Error al leer/parsear localStorage clave "${key}" (validación fallida):`, parseError);
        return fallbackValue;
      }

      // If no validator is provided, only treat as plain string if fallbackValue is a string
      if (typeof fallbackValue === 'string') {
        return item;
      }

      console.warn(`[storageUtils] Error al leer/parsear localStorage clave "${key}":`, parseError);
      return fallbackValue;
    }
  } catch (error) {
    console.warn(`[storageUtils] Error al leer/parsear localStorage clave "${key}":`, error);
    return fallbackValue;
  }
}

/**
 * Safely writes a value to localStorage.
 * @param {string} key - localStorage key
 * @param {any} value - Value to serialize and store
 * @param {function(Error): void} [onError] - Optional callback triggered when saving fails (e.g. QuotaExceededError)
 * @returns {boolean} True if write succeeded, false otherwise
 */
export function safeSetItem(key, value, onError = null) {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      if (onError && typeof onError === 'function') {
        onError(new Error('localStorage no disponible'));
      }
      return false;
    }
    const serialized = typeof value === 'string' ? value : JSON.stringify(value);
    window.localStorage.setItem(key, serialized);
    return true;
  } catch (error) {
    console.warn(`[storageUtils] Error al guardar en localStorage clave "${key}":`, error);
    if (onError && typeof onError === 'function') {
      onError(error);
    }
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
