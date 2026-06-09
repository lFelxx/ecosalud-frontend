/**
 * Configuración global ejecutada antes de cada suite de tests.
 * - Extiende los matchers de Vitest con los de @testing-library/jest-dom
 * - Silencia advertencias de React / MUI / jsdom en la consola
 * - Mockes de APIs del navegador que jsdom no implementa completamente
 */

import '@testing-library/jest-dom';
import { vi, beforeAll, afterAll, afterEach } from 'vitest';

// ── Mocks de APIs del navegador ────────────────────────────────────────────

// window.scrollTo no está implementado en jsdom
Object.defineProperty(window, 'scrollTo', {
  value: vi.fn(),
  writable: true,
});

// requestAnimationFrame ejecuta el callback de forma síncrona en tests
global.requestAnimationFrame = (cb: FrameRequestCallback): number => {
  cb(0);
  return 0;
};

// ── Limpieza de localStorage entre tests ──────────────────────────────────
afterEach(() => {
  localStorage.clear();
});

// ── Silenciar advertencias esperadas de React / jsdom ─────────────────────
const originalError = console.error.bind(console);
const originalWarn = console.warn.bind(console);

beforeAll(() => {
  console.error = (...args: unknown[]) => {
    const msg = typeof args[0] === 'string' ? args[0] : String(args[0]);
    if (
      msg.includes('Warning: ReactDOM.render is no longer supported') ||
      msg.includes('Warning: An update to') ||
      msg.includes('inside a test was not wrapped in act')
    ) return;
    originalError(...args);
  };

  // El interceptor 401 de axiosClient hace window.location.href = '/login'.
  // jsdom no implementa navegación completa y lo reporta en stderr.
  // Lo suprimimos porque el comportamiento está verificado por pruebas unitarias.
  console.warn = (...args: unknown[]) => {
    const msg = typeof args[0] === 'string' ? args[0] : String(args[0]);
    if (msg.includes('Not implemented: navigation')) return;
    originalWarn(...args);
  };
});

afterAll(() => {
  console.error = originalError;
  console.warn = originalWarn;
});
