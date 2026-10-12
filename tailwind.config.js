/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#0C2438',       // Bleu nuit
          green: '#12B981',      // Vert sécurité
          light: '#F3F6F8',      // Gris clair
          warning: '#F59E0B',    // Orange de vigilance
          danger: '#DC2626',     // Rouge d'urgence
          surface: '#15334D',    // Bleu nuit intermédiaire
          card: '#0F2B43',       // Bleu nuit sombre pour cartes
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
