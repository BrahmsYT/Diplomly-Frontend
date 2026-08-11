import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode, command }) => {
  const env = loadEnv(mode, process.cwd(), '');

  // Backend portu backend/.env faylindaki PORT ile eyni olmalidir.
  // Deyisdirmek ucun frontend/.env faylinda BACKEND_PORT teyin edin.
  // Bu deyisen YALNIZ dev serveri ucundur - brauzere catmir.
  const backendPort = env.BACKEND_PORT ?? '4001';

  /**
   * Production build-de Vite proxy islemir - `dist/` sadece statik fayllardir.
   * Ona gore brauzer backend-in tam unvanini bilmelidir (VITE_API_URL).
   *
   * Bu deyisen unudulsa build ugurla kecer, amma sayt aciland  butun sorğular
   * oz domenine gedib 404 alar - sebebi gorunmeyen xeta. Ona gore build
   * merhelesinde derhal dayandiririq.
   *
   * Istisna: frontend ve backend eyni domendedirse (nginx reverse proxy),
   * bos deyer duzgundur - bu halda VITE_SAME_ORIGIN=true teyin edin.
   */
  if (command === 'build' && !env.VITE_API_URL && env.VITE_SAME_ORIGIN !== 'true') {
    throw new Error(
      [
        '',
        'VITE_API_URL təyin edilməyib — production build dayandırıldı.',
        '',
        'Backend ayrı domendədirsə (Render + Vercel):',
        '  Vercel → Settings → Environment Variables →',
        '  VITE_API_URL = https://<servis>.onrender.com     (sonda / olmasın)',
        '',
        'Frontend və backend eyni domendədirsə (reverse proxy):',
        '  VITE_SAME_ORIGIN=true',
        '',
      ].join('\n'),
    );
  }

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
