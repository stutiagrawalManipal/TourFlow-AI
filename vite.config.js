import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: false,
    // Forward API calls to the backend (backend/server.js)
    proxy: {
      '/api': 'http://localhost:5000',
    },
  },
});
