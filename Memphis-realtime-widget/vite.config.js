import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  root: path.resolve(__dirname, 'src'),
  plugins: [react()],
  server: {
    // Dev server runs on 5173 and proxies token requests to port 3001
    port: 5173,
    proxy: {
      '/token': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  },
  build: { outDir: path.resolve(__dirname, 'dist'), emptyOutDir: true }
});
