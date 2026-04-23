/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
      },
      colors: {
        cyan: { brand: '#00BCD4' },
        navy: { DEFAULT: '#0D47A1', dark: '#0a3d88' },
        coral: '#F44336',
        haven: {
          purple: '#7C3AED',
          soft: '#EDE9FE',
          mint: '#14B8A6',
          gold: '#CA8A04',
          sky: '#38BDF8',
        },
        bosnia: { teal: '#2D9C91', coral: '#F26464' },
        welly: { green: '#006D5B', gold: '#C5A358' },
      },
      boxShadow: {
        card: '0 8px 30px rgba(13, 71, 161, 0.08)',
        lift: '0 12px 40px rgba(0, 0, 0, 0.12)',
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.25rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
};
