/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

/**
 * Configuración de Vitest para el frontend de Ecosalud.
 *
 * Separada de vite.config.ts para no interferir con el build de producción.
 * El bundler de pruebas usa esbuild (no Rolldown), compatible con Vite 8.
 */
export default defineConfig({
  plugins: [react()],

  test: {
    // Expone describe/it/expect/vi sin importar explícitamente
    globals: true,

    // Simula el DOM del navegador
    environment: 'jsdom',

    // Archivo de configuración global de los tests
    setupFiles: ['./src/test/setup.ts'],

    // Patrón de archivos de test
    include: ['src/__tests__/**/*.test.{ts,tsx}'],

    // Trata archivos de imagen como assets (devuelve la URL como string)
    assetsInclude: ['**/*.jpg', '**/*.jpeg', '**/*.png', '**/*.svg', '**/*.webp'],

    // ── Cobertura de código ───────────────────────────────────────────────────
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],

      // Solo mide la cobertura de los módulos core (excluye páginas admin complejas)
      include: [
        'src/application/**/*.ts',
        'src/presentation/context/AuthContext.tsx',
        'src/presentation/hooks/**/*.ts',
        // Sólo el repo de auth — AppointmentRepository y axiosClient
        // son infraestructura genérica que se testea con tests de integración E2E
        'src/infrastructure/repositories/AuthRepository.ts',
        'src/presentation/components/common/ScrollToTop.tsx',
        'src/presentation/pages/auth/**/*.tsx',
      ],

      // Excluye archivos que solo contienen tipos o setup de tests
      exclude: [
        'src/**/__tests__/**',
        'src/test/**',
      ],

      // Umbrales mínimos de cobertura (falla si no se alcanzan)
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 75,
        statements: 80,
      },
    },
  },
});
