import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  // Backend portu backend/.env faylindaki PORT ile eyni olmalidir.
  // Deyisdirmek ucun frontend/.env faylinda BACKEND_PORT teyin edin.
  const backendPort = env.BACKEND_PORT ?? '4001';

  return {
  plugins: [react()],
  server: {
    port: 5173,
    // Backend ayrica port-da islese de, frontend-den sorğular
    // /api prefiksi ile gedir ve bu proxy onlari yonlendirir.
    // Beləliklə brauzerdə CORS problemi yaranmır.
    proxy: {
      '/api': {
        target: `http://localhost:${backendPort}`,
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  };
});
