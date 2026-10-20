import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Ports can be changed in a .env file in the project root (see .env.example)
  const env = loadEnv(mode, process.cwd(), '');
  const backendPort = env.BACKEND_PORT || 5000;
  const frontendPort = Number(env.FRONTEND_PORT) || 3000;

  return {
    plugins: [react()],
    server: {
      port: frontendPort,
      open: false,
      // Forward API calls to the backend (backend/server.js)
      proxy: {
        '/api': `http://localhost:${backendPort}`,
      },
    },
  };
});
