import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { render } from '@testing-library/react';
import {
  getMethodIcon,
  playBeep,
  speakText,
  resetSharedAudioContext,
  getIngredientLabel,
  getGrindLabel,
  calculateRatio,
  formatSecondsToMinutes,
  compressRecipe,
  decompressRecipe,
  compressBean,
  decompressBean,
  getVibrationPattern,
  triggerVibration
} from '../src/utils/coffeeUtils';

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

    test('renders fallback icon when method is undefined, null or empty', () => {
      const { container: c1 } = render(getMethodIcon(undefined));
      expect(c1.querySelector('svg')).toBeInTheDocument();
      const { container: c2 } = render(getMethodIcon(null));
      expect(c2.querySelector('svg')).toBeInTheDocument();
      const { container: c3 } = render(getMethodIcon(''));
      expect(c3.querySelector('svg')).toBeInTheDocument();
    });
  });

  describe('Helper formatting functions', () => {
    test('getIngredientLabel returns correct label based on category', () => {
      expect(getIngredientLabel({ category: 'tea' })).toBe('Té / Insumo');
      expect(getIngredientLabel({ category: 'coffee' })).toBe('Café');
      expect(getIngredientLabel()).toBe('Café');
    });

    test('getGrindLabel returns correct label based on category', () => {
      expect(getGrindLabel({ category: 'tea' })).toBe('Presentación');
      expect(getGrindLabel({ category: 'coffee' })).toBe('Molienda');
      expect(getGrindLabel()).toBe('Molienda');
    });

    test('calculateRatio computes coffee to water ratio correctly', () => {
      expect(calculateRatio(15, 255)).toBe('1:17');
      expect(calculateRatio(15, 250)).toBe('1:16.7');
      expect(calculateRatio(20, 300)).toBe('1:15');
      expect(calculateRatio(0, 250)).toBe('1:--');
      expect(calculateRatio(15, 0)).toBe('1:--');
      expect(calculateRatio(null, null)).toBe('1:--');
    });

    test('formatSecondsToMinutes formats seconds to m:ss string correctly', () => {
      expect(formatSecondsToMinutes(0)).toBe('0:00');
      expect(formatSecondsToMinutes(35)).toBe('0:35');
      expect(formatSecondsToMinutes(90)).toBe('1:30');
      expect(formatSecondsToMinutes(155)).toBe('2:35');
      expect(formatSecondsToMinutes(null)).toBe('0:00');
      expect(formatSecondsToMinutes(undefined)).toBe('0:00');
    });

    test('speakText invokes speechSynthesis when available', () => {
      const mockSpeak = vi.fn();
      const originalSpeechSynthesis = window.speechSynthesis;
      const originalUtterance = globalThis.SpeechSynthesisUtterance;

      window.speechSynthesis = { speak: mockSpeak, cancel: vi.fn() };
      globalThis.SpeechSynthesisUtterance = class MockUtterance {
        constructor(text) {
          this.text = text;
        }
      };

      speakText('Iniciando preparación');
      expect(mockSpeak).toHaveBeenCalled();

      window.speechSynthesis = originalSpeechSynthesis;
      globalThis.SpeechSynthesisUtterance = originalUtterance;
    });

    test('speakText returns early when speechSynthesis is unavailable', () => {
      const originalSynth = window.speechSynthesis;
      window.speechSynthesis = undefined;

      // Should not throw and should return undefined
      expect(speakText('test')).toBeUndefined();

      window.speechSynthesis = originalSynth;
    });

    test('speakText returns early when SpeechSynthesisUtterance is undefined', () => {
      const originalSynth = window.speechSynthesis;
      const originalUtterance = globalThis.SpeechSynthesisUtterance;

      window.speechSynthesis = { speak: vi.fn(), cancel: vi.fn() };
      globalThis.SpeechSynthesisUtterance = undefined;

      expect(speakText('test')).toBeUndefined();

      window.speechSynthesis = originalSynth;
      globalThis.SpeechSynthesisUtterance = originalUtterance;
    });

    test('speakText catches and warns when speechSynthesis.speak throws', () => {
      const originalSynth = window.speechSynthesis;
      const originalUtterance = globalThis.SpeechSynthesisUtterance;

      window.speechSynthesis = {
        speak: vi.fn().mockImplementation(() => {
          throw new Error('speech error');
        }),
        cancel: vi.fn()
      };
      globalThis.SpeechSynthesisUtterance = class MockUtterance {
        constructor(text) { this.text = text; }
      };

      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      speakText('test');
      expect(warnSpy).toHaveBeenCalledWith('La narración por voz falló:', expect.any(Error));
      warnSpy.mockRestore();

      window.speechSynthesis = originalSynth;
      globalThis.SpeechSynthesisUtterance = originalUtterance;
    });
  });

  describe('playBeep', () => {
    let originalAudioContext;
    let originalWebkitAudioContext;

    beforeEach(() => {
      originalAudioContext = window.AudioContext;
      originalWebkitAudioContext = window.webkitAudioContext;
      resetSharedAudioContext();
    });

    afterEach(() => {
      window.AudioContext = originalAudioContext;
      window.webkitAudioContext = originalWebkitAudioContext;
      resetSharedAudioContext();
    });

    test('instantiates AudioContext and starts oscillator', () => {
      vi.useFakeTimers();
      const mockCtx = new originalAudioContext();
      const mockConstructor = vi.fn().mockImplementation(function () { return mockCtx; });
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
      const mockConstructor = vi.fn().mockImplementation(function () { return mockCtx; });
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

    test('reuses the same AudioContext instance across calls', () => {
      vi.useFakeTimers();
      const mockCtx = new originalAudioContext();
      const mockConstructor = vi.fn().mockImplementation(function () { return mockCtx; });
      window.AudioContext = mockConstructor;
      window.webkitAudioContext = undefined;

      playBeep();
      playBeep();
      // El constructor sólo se invoca una vez: la segunda llamada reutiliza
      expect(mockConstructor).toHaveBeenCalledTimes(1);
      vi.runAllTimers();
      vi.useRealTimers();
    });

    test('resumes suspended AudioContext before playing', () => {
      vi.useFakeTimers();
      const mockCtx = new originalAudioContext();
      mockCtx.state = 'suspended';
      mockCtx.resume = vi.fn().mockResolvedValue(undefined);
      const mockConstructor = vi.fn().mockImplementation(function () { return mockCtx; });
      window.AudioContext = mockConstructor;
      window.webkitAudioContext = undefined;

      playBeep();
      expect(mockCtx.resume).toHaveBeenCalled();
      vi.runAllTimers();
      vi.useRealTimers();
    });

    test('catches and warns when AudioContext constructor throws', () => {
      window.AudioContext = vi.fn().mockImplementation(function () {
        throw new Error('AudioContext creation failed');
      });
      window.webkitAudioContext = undefined;

      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      playBeep();
      expect(warnSpy).toHaveBeenCalledWith(
        'La reproducción de audio falló o fue bloqueada por el navegador:',
        expect.any(Error)
      );

      warnSpy.mockRestore();
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

  describe('Bean Compression & Decompression', () => {
    const testBean = {
      name: 'Geisha de Panamá',
      roaster: 'Specialty Roasters',
      origin: 'Panamá',
      region: 'Chiriquí',
      farm: 'Finca Esmeralda',
      producer: 'Hacienda La Esmeralda',
      harvest_year: '2025',
      process: 'Honey',
      variety: 'Geisha',
      roast_level: 'Claro',
      roast_date: '2026-07-10',
      sca_score: 90.5,
      altitude: '1800 msnm',
      tasting_notes: ['Jazmín', 'Melocotón', 'Cítrico'],
      notes: 'Café excepcional con notas florales muy marcadas.'
    };

    test('should compress and decompress a bean successfully maintaining data integrity', async () => {
      const compressed = await compressBean(testBean);
      expect(typeof compressed).toBe('string');
      expect(compressed.startsWith('bc1_') || compressed.startsWith('br1_')).toBe(true);

      const decompressed = await decompressBean(compressed);
      expect(decompressed.name).toBe(testBean.name);
      expect(decompressed.roaster).toBe(testBean.roaster);
      expect(decompressed.origin).toBe(testBean.origin);
      expect(decompressed.region).toBe(testBean.region);
      expect(decompressed.farm).toBe(testBean.farm);
      expect(decompressed.producer).toBe(testBean.producer);
      expect(decompressed.harvest_year).toBe(testBean.harvest_year);
      expect(decompressed.process).toBe(testBean.process);
      expect(decompressed.variety).toBe(testBean.variety);
      expect(decompressed.roast_level).toBe(testBean.roast_level);
      expect(decompressed.roast_date).toBe(testBean.roast_date);
      expect(decompressed.sca_score).toBe(testBean.sca_score);
      expect(decompressed.altitude).toBe(testBean.altitude);
      expect(decompressed.tasting_notes).toEqual(testBean.tasting_notes);
      expect(decompressed.notes).toBe(testBean.notes);
    });

    test('should work with UTF-8 characters like accents and special characters', async () => {
      const specialBean = {
        name: 'Café Cariño de Ñuble',
        roaster: 'Tostaduría Cafeto',
        origin: 'Chile',
        process: 'Lavado',
        variety: 'Caturra',
        roast_level: 'Medio',
        roast_date: '2026-07-12',
        sca_score: 83.5,
        altitude: '1200m',
        tasting_notes: ['Limón', 'Mora'],
        notes: 'Una dulzura sutil.'
      };

      const compressed = await compressBean(specialBean);
      const decompressed = await decompressBean(compressed);
      expect(decompressed.name).toBe(specialBean.name);
      expect(decompressed.notes).toBe(specialBean.notes);
      expect(decompressed.tasting_notes).toEqual(specialBean.tasting_notes);
    });

    test('should throw error for empty or null bean string', async () => {
      await expect(decompressBean('')).rejects.toThrow("Cadena de grano vacía");
      await expect(decompressBean(null)).rejects.toThrow("Cadena de grano vacía");
    });

    test('should throw error for invalid formatted bean string', async () => {
      await expect(decompressBean('invalid_bean_string')).rejects.toThrow();
    });

    test('should throw error if decompressed bean does not have a name', async () => {
      const noNamePayload = 'br1_e30='; // base64 de '{}' es 'e30='
      await expect(decompressBean(noNamePayload)).rejects.toThrow("Estructura de grano de café inválida");
    });

    test('should decompress a bean even without a prefix', async () => {
      const rawBean = { n: 'Geisha' };
      const rawBase64 = btoa(JSON.stringify(rawBean));
      const decompressed = await decompressBean(rawBase64);
      expect(decompressed.name).toBe('Geisha');
    });

    test('should handle native DecompressionStream for bc1_ bean prefix if CompressionStream is available', async () => {
      const sampleBean = { name: 'Bean Deflate Test', roaster: 'Test Roaster' };
      const compressed = await compressBean(sampleBean);
      if (compressed.startsWith('bc1_')) {
        const decompressed = await decompressBean(compressed);
        expect(decompressed.name).toBe('Bean Deflate Test');
      }
    });

    test('should handle fallback when CompressionStream throws error in compressBean', async () => {
      const originalCS = globalThis.CompressionStream;
      globalThis.CompressionStream = vi.fn().mockImplementation(() => {
        throw new Error('CompressionStream error');
      });

      const sampleBean = { name: 'Fallback Bean Test' };
      const compressed = await compressBean(sampleBean);
      expect(compressed.startsWith('br1_')).toBe(true);
      const decompressed = await decompressBean(compressed);
      expect(decompressed.name).toBe('Fallback Bean Test');

      globalThis.CompressionStream = originalCS;
    });

    test('should throw custom error message on decoding malformed base64 bean payload', async () => {
      await expect(decompressBean('bc1_invalid!!!')).rejects.toThrow(/No se pudo descifrar el grano compartido/);
    });
  });

  describe('Recipe edge cases and error handling', () => {
    test('should throw error for empty or null recipe string in decompressRecipe', async () => {
      await expect(decompressRecipe('')).rejects.toThrow("Cadena vacía");
      await expect(decompressRecipe(null)).rejects.toThrow("Cadena vacía");
    });

    test('should throw error when recipe json structure is invalid (missing steps or name)', async () => {
      const invalidRecipePayload = 'r1_' + btoa(JSON.stringify({ n: 'No Steps' }));
      await expect(decompressRecipe(invalidRecipePayload)).rejects.toThrow("Estructura de receta inválida");
    });

    test('should throw custom error message on decoding malformed base64 recipe payload', async () => {
      await expect(decompressRecipe('c1_invalid!!!')).rejects.toThrow(/No se pudo descifrar la receta compartida/);
    });

    test('should handle fallback when CompressionStream throws error in compressRecipe', async () => {
      const originalCS = globalThis.CompressionStream;
      globalThis.CompressionStream = vi.fn().mockImplementation(() => {
        throw new Error('CompressionStream error');
      });

      const sampleRecipe = {
        name: 'Fallback Recipe Test',
        method: 'V60',
        coffee_g: 15,
        steps: [{ step_number: 1, title: 'Step 1', water_g: 100, duration_s: 30 }]
      };
      const compressed = await compressRecipe(sampleRecipe);
      expect(compressed.startsWith('r1_')).toBe(true);
      const decompressed = await decompressRecipe(compressed);
      expect(decompressed.name).toBe('Fallback Recipe Test');

      globalThis.CompressionStream = originalCS;
    });

    test('should apply default values for missing fields in decompressRecipe', async () => {
      // Recipe with only name and steps (missing method, coffee_g, grind_size, water_temp_c, step fields)
      const rawRecipe = { n: 'Minimal Recipe', s: [{ w: 50 }] };
      const rawBase64 = 'r1_' + btoa(JSON.stringify(rawRecipe));
      const decompressed = await decompressRecipe(rawBase64);

      expect(decompressed.name).toBe('Minimal Recipe');
      expect(decompressed.method).toBe('V60');
      expect(decompressed.coffee_g).toBe(0);
      expect(decompressed.grind_size).toBe('');
      expect(decompressed.water_temp_c).toBe(0);
      expect(decompressed.category).toBeUndefined();
      expect(decompressed.steps[0].title).toBe('Paso 1');
      expect(decompressed.steps[0].water_g).toBe(50);
      expect(decompressed.steps[0].duration_s).toBe(0);
      expect(decompressed.steps[0].instruction).toBe('');
      expect(decompressed.steps[0].step_number).toBe(1);
    });
  });

  describe('Vibration Helpers', () => {
    test('getVibrationPattern returns correct patterns for step transitions and completion', () => {
      expect(getVibrationPattern('short', false)).toEqual([75, 50, 75]);
      expect(getVibrationPattern('long', false)).toEqual([300, 150, 300]);
      expect(getVibrationPattern('normal', false)).toEqual([150, 100, 150]);

      expect(getVibrationPattern('short', true)).toBe(200);
      expect(getVibrationPattern('long', true)).toBe(800);
      expect(getVibrationPattern('normal', true)).toBe(400);
    });

    test('triggerVibration calls navigator.vibrate when enabled and supported', () => {
      const vibrateMock = vi.fn();
      vi.stubGlobal('navigator', { vibrate: vibrateMock });

      triggerVibration(true, 'short', false);
      expect(vibrateMock).toHaveBeenCalledWith([75, 50, 75]);

      triggerVibration(true, 'long', true);
      expect(vibrateMock).toHaveBeenCalledWith(800);

      vibrateMock.mockClear();
      triggerVibration(false, 'short', false);
      expect(vibrateMock).not.toHaveBeenCalled();

      vi.unstubAllGlobals();
    });
  });
});
