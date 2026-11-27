import { defineConfig, loadEnv } from 'vite';
import { renderHead } from './scripts/seo-html.mjs';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => ({
  plugins: [react(), {
    name: 'portfolio-seo',
    transformIndexHtml(html, context) {
      const env = loadEnv(mode, process.cwd(), 'VITE_');
      return html.replace(/<!--seo:start-->[\s\S]*?<!--seo:end-->/, renderHead(context.path === '/index.html' ? '/' : context.path || '/', process.env.VITE_SITE_URL || env.VITE_SITE_URL));
    },
  }],
  resolve: {
    alias: {
      '@components': path.resolve(__dirname, './components'),
    },
  },
}));
