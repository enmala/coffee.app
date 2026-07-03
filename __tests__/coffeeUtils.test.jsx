import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { render } from '@testing-library/react';
import { getMethodIcon, playBeep, compressRecipe, decompressRecipe } from '../src/utils/coffeeUtils';

describe('coffeeUtils', () => {
  describe('getMethodIcon', () => {
    test('renders correct icon for V60', () => {
      const { container } = render(getMethodIcon('V60'));
      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    test('renders correct icon for Aeropress', () => {
      const { container } = render(getMethodIcon('Aeropress'));
      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    test('renders correct icon for Chemex', () => {
      const { container } = render(getMethodIcon('Chemex'));
      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    test('renders correct icon for Switch', () => {
      const { container } = render(getMethodIcon('Hario Switch'));
      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    test('renders correct icon for Moka', () => {
      const { container } = render(getMethodIcon('Moka'));
      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    test('renders correct icon for Origami', () => {
      const { container } = render(getMethodIcon('Origami'));
      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    test('renders correct icon for Prensa Francesa', () => {
      const { container } = render(getMethodIcon('Prensa Francesa'));
      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    test('renders fallback icon for unknown method', () => {
      const { container } = render(getMethodIcon('Desconocido'));
      expect(container.querySelector('svg')).toBeInTheDocument();
    });
  });

  describe('playBeep', () => {
    let originalAudioContext;
    let originalWebkitAudioContext;

    beforeEach(() => {
      originalAudioContext = window.AudioContext;
      originalWebkitAudioContext = window.webkitAudioContext;
    });

    afterEach(() => {
      window.AudioContext = originalAudioContext;
      window.webkitAudioContext = originalWebkitAudioContext;
    });

    test('instantiates AudioContext and starts oscillator', () => {
      vi.useFakeTimers();
      const mockCtx = new originalAudioContext();
      const mockConstructor = vi.fn().mockImplementation(() => mockCtx);
      window.AudioContext = mockConstructor;
      window.webkitAudioContext = undefined;

      playBeep();
      expect(mockConstructor).toHaveBeenCalled();
      vi.runAllTimers();
      vi.useRealTimers();
    });

    test('falls back to webkitAudioContext if AudioContext is undefined', () => {
      vi.useFakeTimers();
      const mockCtx = new originalWebkitAudioContext();
      const mockConstructor = vi.fn().mockImplementation(() => mockCtx);
      window.AudioContext = undefined;
      window.webkitAudioContext = mockConstructor;

      playBeep();
      expect(mockConstructor).toHaveBeenCalled();
      vi.runAllTimers();
      vi.useRealTimers();
    });

    test('returns immediately if no AudioContext is available', () => {
      window.AudioContext = undefined;
      window.webkitAudioContext = undefined;

      // Should not throw and should return undefined
      expect(playBeep()).toBeUndefined();
    });
  });

  describe('Recipe Compression & Decompression', () => {
    const testRecipe = {
      name: 'V60 Test Recipe',
      method: 'V60',
      coffee_g: 15,
      grind_size: 'Medio',
      water_temp_c: 94,
      steps: [
        { step_number: 1, title: 'Preinfusión', water_g: 50, duration_s: 30, instruction: 'Mojar todo' },
        { step_number: 2, title: 'Vertido 1', water_g: 100, duration_s: 60, instruction: 'Lento' }
      ]
    };

    test('should compress and decompress a recipe successfully maintaining data integrity', async () => {
      const compressed = await compressRecipe(testRecipe);
      expect(typeof compressed).toBe('string');
      expect(compressed.startsWith('c1_') || compressed.startsWith('r1_')).toBe(true);

      const decompressed = await decompressRecipe(compressed);
      expect(decompressed.name).toBe(testRecipe.name);
      expect(decompressed.method).toBe(testRecipe.method);
      expect(decompressed.coffee_g).toBe(testRecipe.coffee_g);
      expect(decompressed.grind_size).toBe(testRecipe.grind_size);
      expect(decompressed.water_temp_c).toBe(testRecipe.water_temp_c);
      expect(decompressed.steps.length).toBe(2);
      expect(decompressed.steps[0].title).toBe('Preinfusión');
      expect(decompressed.steps[0].water_g).toBe(50);
      expect(decompressed.steps[0].duration_s).toBe(30);
      expect(decompressed.steps[0].instruction).toBe('Mojar todo');
    });

    test('should work with UTF-8 characters like accents', async () => {
      const accentRecipe = {
        name: 'Café de Especialidad con Tildes y Eñes',
        method: 'Origami',
        coffee_g: 12,
        grind_size: 'Fina',
        water_temp_c: 90,
        steps: [
          { step_number: 1, title: 'Preinfusión de café', water_g: 30, duration_s: 30, instruction: 'Verter con cuidado' }
        ]
      };

      const compressed = await compressRecipe(accentRecipe);
      const decompressed = await decompressRecipe(compressed);
      expect(decompressed.name).toBe(accentRecipe.name);
      expect(decompressed.steps[0].title).toBe(accentRecipe.steps[0].title);
    });

    test('should throw error for invalid formatted string', async () => {
      await expect(decompressRecipe('invalid_string')).rejects.toThrow();
    });
  });
});
