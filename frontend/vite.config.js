import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The frontend always calls /api on its own origin. In development Vite
// forwards those calls to the backend, so there is no CORS setup and the app
// also works from a phone on the same Wi-Fi (run `npm run dev -- --host`).
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': process.env.VITE_API_TARGET || 'http://localhost:8080',
    },
  },
});
