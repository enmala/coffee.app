import { vi } from 'vitest';
import '@testing-library/jest-dom';

// Mock window.AudioContext
class AudioContextMock {
  constructor() {
    this.currentTime = 0;
  }
  createOscillator() {
    return {
      type: 'sine',
      frequency: {
        setValueAtTime: vi.fn(),
      },
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
    };
  }
  createGain() {
    return {
      gain: {
        setValueAtTime: vi.fn(),
      },
      connect: vi.fn(),
    };
  }
  get destination() {
    return {};
  }
  close() {
    return Promise.resolve();
  }
}

window.AudioContext = AudioContextMock;
window.webkitAudioContext = AudioContextMock;

// Mock navigator APIs
if (typeof navigator !== 'undefined') {
  Object.defineProperty(navigator, 'vibrate', {
    configurable: true,
    writable: true,
    value: vi.fn(),
  });

  Object.defineProperty(navigator, 'wakeLock', {
    configurable: true,
    writable: true,
    value: {
      request: vi.fn().mockResolvedValue({
        release: vi.fn().mockResolvedValue(),
      }),
    },
  });
}

// Mock window confirm/alert
window.confirm = vi.fn().mockReturnValue(true);
window.alert = vi.fn();

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock URL createObjectURL / revokeObjectURL for exports
window.URL.createObjectURL = vi.fn().mockReturnValue('mock-url');
window.URL.revokeObjectURL = vi.fn();

// Polyfill Blob.prototype.stream for jsdom (not provided by jsdom but available in browsers).
// This allows the native CompressionStream/DecompressionStream code paths in coffeeUtils.jsx
// to execute without falling back to the uncompressed base64 path.
if (typeof Blob.prototype.stream !== 'function') {
  Blob.prototype.stream = function () {
    const blob = this;
    return new ReadableStream({
      async start(controller) {
        const buffer = await blob.arrayBuffer();
        controller.enqueue(new Uint8Array(buffer));
        controller.close();
      },
    });
  };
}
