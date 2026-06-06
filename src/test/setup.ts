/**
 * Configuración global ejecutada antes de cada suite de tests.
 * - Extiende los matchers de Vitest con los de @testing-library/jest-dom
 * - Silencia advertencias de React en la consola
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

// ── Variables de entorno para tests ───────────────────────────────────────
// Se setean aquí para que axiosClient las lea correctamente
(import.meta as { env: Record<string, string> }).env.VITE_API_URL =
  'http://localhost:8080/api';

// ── Limpieza de localStorage entre tests ──────────────────────────────────
afterEach(() => {
  localStorage.clear();
});

// ── Silenciar advertencias esperadas de React ─────────────────────────────
const originalError = console.error.bind(console);
beforeAll(() => {
  console.error = (...args: unknown[]) => {
    const msg = typeof args[0] === 'string' ? args[0] : '';
    // Filtra warnings conocidos de React Testing Library / MUI
    if (
      msg.includes('Warning: ReactDOM.render is no longer supported') ||
      msg.includes('Warning: An update to') ||
      msg.includes('inside a test was not wrapped in act')
    ) return;
    originalError(...args);
  };
});

afterAll(() => {
  console.error = originalError;
});
