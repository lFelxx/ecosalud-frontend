/**
 * Servidor MSW para el entorno Node.js (Vitest).
 *
 * setupServer de 'msw/node' intercepta XMLHttpRequest y fetch a nivel
 * de proceso — sin service worker, compatible con jsdom.
 *
 * Uso en cada test file:
 *   import { server } from '../../../test/mswServer';
 *   beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
 *   afterEach(() => server.resetHandlers());
 *   afterAll(() => server.close());
 */

import { setupServer } from 'msw/node';
import { handlers } from './mswHandlers';

export const server = setupServer(...handlers);
