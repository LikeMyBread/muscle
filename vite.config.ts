/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import type { Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'node:path';

function syncSourceAssets(): void {
  const rootDir = process.cwd();
  const publicManifest = path.resolve(rootDir, 'public/muscle/models/manifest.json');
  const srcManifest = path.resolve(rootDir, 'src/muscle/models/manifest.json');
  if (fs.existsSync(publicManifest)) {
    if (!fs.existsSync(srcManifest) || fs.readFileSync(srcManifest, 'utf8') !== fs.readFileSync(publicManifest, 'utf8')) {
      fs.mkdirSync(path.dirname(srcManifest), { recursive: true });
      fs.copyFileSync(publicManifest, srcManifest);
    }
  }

  const publicSharedCss = path.resolve(rootDir, 'public/styles/shared.css');
  const srcSharedCss = path.resolve(rootDir, 'src/shared/styles/shared.css');
  if (fs.existsSync(publicSharedCss)) {
    if (!fs.existsSync(srcSharedCss) || fs.readFileSync(srcSharedCss, 'utf8') !== fs.readFileSync(publicSharedCss, 'utf8')) {
      fs.mkdirSync(path.dirname(srcSharedCss), { recursive: true });
      fs.copyFileSync(publicSharedCss, srcSharedCss);
    }
  }
}

function muscleSpaFallback(): Plugin {
  return {
    name: 'muscle-spa-fallback',
    buildStart() {
      syncSourceAssets();
    },
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.method === 'GET') {
          if (req.url === '/' || req.url === '') {
            res.writeHead(302, { Location: '/muscle/' });
            res.end();
            return;
          }
          if (req.url?.startsWith('/muscle/models/')) {
            req.url = req.url.replace(/^\/muscle\/models\//, '/muscle/muscle/models/');
          }
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

      // Mirror models to dist/models so both /muscle/models and /muscle/muscle/models resolve
      const muscleModelsDir = path.resolve(distDir, 'muscle/models');
      const rootModelsDir = path.resolve(distDir, 'models');
      if (fs.existsSync(muscleModelsDir) && !fs.existsSync(rootModelsDir)) {
        fs.cpSync(muscleModelsDir, rootModelsDir, { recursive: true });
      }

      // Mirror styles and icons to dist/muscle/
      const rootStylesDir = path.resolve(distDir, 'styles');
      const muscleStylesDir = path.resolve(distDir, 'muscle/styles');
      if (fs.existsSync(rootStylesDir) && !fs.existsSync(muscleStylesDir)) {
        fs.cpSync(rootStylesDir, muscleStylesDir, { recursive: true });
      }

      const rootIconsDir = path.resolve(distDir, 'icons');
      const muscleIconsDir = path.resolve(distDir, 'muscle/icons');
      if (fs.existsSync(rootIconsDir) && !fs.existsSync(muscleIconsDir)) {
        fs.cpSync(rootIconsDir, muscleIconsDir, { recursive: true });
      }
    },
  };
}

export default defineConfig({
  base: '/muscle/',
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
