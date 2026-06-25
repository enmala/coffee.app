import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { render } from '@testing-library/react';
import { getMethodIcon, playBeep } from '../src/utils/coffeeUtils';

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
});
