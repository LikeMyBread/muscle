/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import type { Plugin } from 'vite';
import react from '@vitejs/plugin-react';

function muscleSpaFallback(): Plugin {
  return {
    name: 'muscle-spa-fallback',
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        if (req.method === 'GET' && (req.url === '/muscle' || req.url === '/muscle/' || req.url?.startsWith('/muscle?'))) {
          req.url = req.url.replace(/^\/muscle\/?/, '/') || '/';
        }
        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), muscleSpaFallback()],
  resolve: {
    dedupe: ['react', 'react-dom', 'react/jsx-runtime', '@emotion/react', '@emotion/styled'],
  },
  server: {
    port: 5173,
  },
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx,js,jsx}'],
  },
});
