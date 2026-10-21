import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiUrl = env.VITE_API_URL || process.env.VITE_API_URL

  if (command === 'build') {
    if (!apiUrl) {
      console.warn(
        '\n\x1b[33m⚠️  [XamSafe Build Warning] VITE_API_URL n\'est pas définie pour ce build.\n' +
        '   Le frontend sera généré en mode hors ligne strict (heuristique souveraine).\n' +
        '   Pour connecter le moteur backend en production Vercel, définissez VITE_API_URL=https://votre-backend.onrender.com dans vos variables d\'environnement.\x1b[0m\n'
      )
    } else if (!apiUrl.startsWith('https://')) {
      console.warn(
        `\n\x1b[31m⚠️  [XamSafe Build Security Warning] VITE_API_URL (${apiUrl}) n'utilise pas HTTPS !\n` +
        '   En production, toutes les communications d\'API doivent impérativement être sécurisées via HTTPS.\x1b[0m\n'
      )
    }
  }

  return {
    plugins: [react()],
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/test/setup.ts',
    },
  }
})
