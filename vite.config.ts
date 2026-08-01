import {defineConfig} from 'vite';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'path';

export default defineConfig(() => {
  return {
    plugins: [tailwindcss()],
    server: {
      port: 3000,
      host: '0.0.0.0',
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
    build: {
      target: 'esnext',
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'index.html'),
          imageToCode: resolve(__dirname, 'tools/image-to-code/index.html'),
          handwritingToText: resolve(__dirname, 'tools/handwriting-to-text/index.html'),
          hindiHandwritingToText: resolve(__dirname, 'tools/hindi-handwriting-to-text/index.html'),
          toolsArchive: resolve(__dirname, 'tools/index.html'),
          pricing: resolve(__dirname, 'pricing/index.html'),
          dashboard: resolve(__dirname, 'dashboard/index.html')
        }
      }
    }
  };
});
