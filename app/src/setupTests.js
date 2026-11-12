import '@testing-library/jest-dom';
import { beforeEach, afterEach, vi } from 'vitest';

/**
 * Configuración global de pruebas para Vitest + React Testing Library + JSDOM.
 * Provee mocks limpios para HTMLMediaElement (play / pause / load) ya que JSDOM
 * no implementa reproducción multimedia nativa.
 */
if (typeof window !== 'undefined' && window.HTMLMediaElement) {
  Object.defineProperty(window.HTMLMediaElement.prototype, 'play', {
    configurable: true,
    writable: true,
    value: vi.fn().mockImplementation(() => Promise.resolve()),
  });

  Object.defineProperty(window.HTMLMediaElement.prototype, 'pause', {
    configurable: true,
    writable: true,
    value: vi.fn(),
  });

  Object.defineProperty(window.HTMLMediaElement.prototype, 'load', {
    configurable: true,
    writable: true,
    value: vi.fn(),
  });
}

beforeEach(() => {
  if (typeof window !== 'undefined' && window.HTMLMediaElement) {
    window.HTMLMediaElement.prototype.play = vi
      .fn()
      .mockImplementation(() => Promise.resolve());
    window.HTMLMediaElement.prototype.pause = vi.fn();
  }
});

afterEach(() => {
  vi.restoreAllMocks();
});
