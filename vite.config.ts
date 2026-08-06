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
          geminiImageToPrompt: resolve(__dirname, 'tools/gemini-image-to-prompt/index.html'),
          htmlToImage: resolve(__dirname, 'tools/html-to-image/index.html'),
          pricing: resolve(__dirname, 'pricing/index.html'),
          dashboard: resolve(__dirname, 'dashboard/index.html'),
          terms: resolve(__dirname, 'terms.html'),
          privacyPolicy: resolve(__dirname, 'privacy-policy.html'),
          about: resolve(__dirname, 'about.html'),
          contact: resolve(__dirname, 'contact.html'),
          disclaimer: resolve(__dirname, 'disclaimer.html'),
          refundPolicy: resolve(__dirname, 'refund-policy.html')
        }
      }
    }
  };
});
