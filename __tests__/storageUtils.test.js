import { describe, test, expect, beforeEach, vi } from 'vitest';
import { safeGetItem, safeSetItem, safeRemoveItem } from '../src/utils/storageUtils';

describe('storageUtils Utility Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  describe('safeGetItem', () => {
    test('returns parsed JSON value when key exists and JSON is valid', () => {
      localStorage.setItem('test_key', JSON.stringify({ a: 1, b: 'hello' }));
      const result = safeGetItem('test_key', {});
      expect(result).toEqual({ a: 1, b: 'hello' });
    });

    test('returns fallbackValue when key does not exist', () => {
      const result = safeGetItem('non_existent_key', 'fallback');
      expect(result).toBe('fallback');
    });

    test('returns plain string when item was stored unquoted without JSON syntax', () => {
      localStorage.setItem('raw_string_key', 'dark');
      const result = safeGetItem('raw_string_key', 'light', (val) => typeof val === 'string');
      expect(result).toBe('dark');
    });

    test('returns fallbackValue and logs warning when JSON is corrupted', () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      localStorage.setItem('corrupted_key', '{ invalid json... }');

      const result = safeGetItem('corrupted_key', ['fallback_item']);
      expect(result).toEqual(['fallback_item']);
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error al leer/parsear localStorage clave "corrupted_key"'),
        expect.any(SyntaxError)
      );
    });

    test('validates data using validator function and returns fallback if validator fails', () => {
      localStorage.setItem('array_key', JSON.stringify('not an array'));
      
      const isArrayValidator = (val) => Array.isArray(val);
      const result = safeGetItem('array_key', ['default'], isArrayValidator);
      
      expect(result).toEqual(['default']);
    });

    test('passes data when validator function succeeds', () => {
      localStorage.setItem('valid_array', JSON.stringify([1, 2, 3]));
      
      const isArrayValidator = (val) => Array.isArray(val);
      const result = safeGetItem('valid_array', [], isArrayValidator);
      
      expect(result).toEqual([1, 2, 3]);
    });

    test('handles window.localStorage throw / access denial gracefully', () => {
      const getItemSpy = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('SecurityError: Access is denied');
      });
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const result = safeGetItem('secret_key', 'fallback_on_error');
      expect(result).toBe('fallback_on_error');
      expect(consoleWarnSpy).toHaveBeenCalled();

      getItemSpy.mockRestore();
    });
  });

  describe('safeSetItem', () => {
    test('successfully serializes and writes value to localStorage', () => {
      const success = safeSetItem('test_set', { name: 'V60', rating: 5 });
      expect(success).toBe(true);
      expect(JSON.parse(localStorage.getItem('test_set'))).toEqual({ name: 'V60', rating: 5 });
    });

    test('stores plain string directly without extra JSON quotes if passed string', () => {
      const success = safeSetItem('test_str', 'dark');
      expect(success).toBe(true);
      expect(localStorage.getItem('test_str')).toBe('dark');
    });

    test('catches QuotaExceededError when storage is full and triggers onError callback', () => {
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        const error = new Error('QuotaExceededError');
        error.name = 'QuotaExceededError';
        throw error;
      });
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const onErrorSpy = vi.fn();

      const success = safeSetItem('full_key', { data: 'big_payload' }, onErrorSpy);
      expect(success).toBe(false);
      expect(onErrorSpy).toHaveBeenCalledWith(expect.any(Error));
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error al guardar en localStorage clave "full_key"'),
        expect.any(Error)
      );

      setItemSpy.mockRestore();
    });
  });

  describe('safeRemoveItem', () => {
    test('removes item from localStorage safely', () => {
      localStorage.setItem('remove_me', 'value');
      const success = safeRemoveItem('remove_me');
      expect(success).toBe(true);
      expect(localStorage.getItem('remove_me')).toBeNull();
    });

    test('handles exceptions thrown during removeItem', () => {
      const removeItemSpy = vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
        throw new Error('Access denied');
      });
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const success = safeRemoveItem('error_key');
      expect(success).toBe(false);
      expect(consoleWarnSpy).toHaveBeenCalled();

      removeItemSpy.mockRestore();
    });
  });
});
