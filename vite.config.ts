/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import type { Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'node:path';

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

function spa404Fallback(): Plugin {
  return {
    name: 'spa-404-fallback',
    closeBundle() {
      const distDir = path.resolve(process.cwd(), 'dist');
      const indexPath = path.resolve(distDir, 'index.html');
      const notFoundPath = path.resolve(distDir, '404.html');
      if (fs.existsSync(indexPath)) {
        fs.copyFileSync(indexPath, notFoundPath);
      }
    },
  };
}

export default defineConfig({
  plugins: [react(), muscleSpaFallback(), spa404Fallback()],
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
