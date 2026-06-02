import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Configuración de Vite para Ecosalud Frontend.
 *
 * Puntos clave:
 * - La variable VITE_API_URL define la URL del backend (ver .env.example).
 * - El splitting de chunks reduce el bundle inicial cargado por el navegador.
 * - En Vercel el routing SPA está gestionado por vercel.json (rewrite a index.html).
 */
export default defineConfig({
  plugins: [react()],

  build: {
    // Directorio de salida (Vercel lo detecta automáticamente)
    outDir: 'dist',

    // Separar librerías grandes en chunks independientes para mejor caché
    rollupOptions: {
      output: {
        manualChunks: {
          // React core en su propio chunk
          'react-vendor': ['react', 'react-dom'],
          // MUI en su propio chunk (es la dependencia más grande)
          'mui-vendor': ['@mui/material', '@mui/icons-material'],
          // React Router separado
          'router-vendor': ['react-router-dom'],
        },
      },
    },

    // Umbral de advertencia de chunk size (en KB)
    chunkSizeWarningLimit: 600,
  },

  // Servidor de desarrollo local
  server: {
    port: 5173,
    // Proxy opcional: redirige /api al backend local para evitar CORS en dev
    // proxy: {
    //   '/api': { target: 'http://localhost:8080', changeOrigin: true },
    // },
  },
});
