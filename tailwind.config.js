/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Wine / burgundy — the platform's single accent, used sparingly.
        brand: {
          50: '#FAF1F2',
          100: '#F0DCDF',
          200: '#E0B9C0',
          300: '#CB8D97',
          400: '#AD5F6D',
          500: '#8F4150',
          600: '#722F3C',
          700: '#5C2530',
          800: '#481D26',
          900: '#34151B',
        },
        // Warm graphite neutrals — replaces Tailwind's default blue-tinted slate.
        slate: {
          50: '#F7F6F4',
          100: '#EEECE7',
          200: '#DDDAD2',
          300: '#C2BDB1',
          400: '#9B9487',
          500: '#777063',
          600: '#5A5449',
          700: '#433E36',
          800: '#2E2A25',
          900: '#1C1A16',
          950: '#131210',
        },
      },
      fontFamily: {
        sans: ['"Public Sans"', 'system-ui', 'sans-serif'],
        serif: ['"Source Serif 4"', 'Georgia', 'serif'],
        // Yalnız "Diplomly" wordmark-ı üçün — həkk olunmuş möhür hərfləri.
        wordmark: ['"Cinzel"', '"Source Serif 4"', 'serif'],
      },
      borderRadius: {
        none: '0',
        sm: '0.125rem',
        DEFAULT: '0.1875rem',
        md: '0.1875rem',
        lg: '0.1875rem',
        xl: '0.25rem',
        '2xl': '0.375rem',
        '3xl': '0.5rem',
        full: '9999px',
      },
      boxShadow: {
        lift: '0 1px 2px rgba(28, 26, 22, 0.05), 0 10px 24px -14px rgba(28, 26, 22, 0.22)',
      },
    },
  },
  plugins: [],
};
