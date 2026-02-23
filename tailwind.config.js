/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './app/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Design system colors (from design reference)
        hf: {
          bg: '#080B12',
          surface: '#0E1220',
          surface2: '#141826',
          border: '#1E2538',
          border2: '#252D42',
          accent: '#3D7EFF',
          'accent-dim': '#1A3875',
          teal: '#1EC9A0',
          amber: '#F0A832',
          red: '#F04438',
          muted: '#3D4B6B',
          sub: '#6B7A9F',
          body: '#B8C2DA',
          head: '#E2E8F5',
          white: '#F0F4FF',
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'monospace'],
        sans: ['DM Sans', 'sans-serif'],
      },
      spacing: {
        'nav-h': '56px',
        'sidebar-w': '220px',
      },
      borderRadius: {
        xs: '8px',
        sm: '12px',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
      },
      animation: {
        fadeUp: 'fadeUp 0.35s ease forwards',
        pulse: 'pulse 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
