/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        securite: '#16a34a',
        cible: '#2563eb',
        ambition: '#9333ea',
      },
      animation: {
        pulse_slow: 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        glow: 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          from: { boxShadow: '0 0 10px rgba(99,102,241,0.4)' },
          to: { boxShadow: '0 0 25px rgba(99,102,241,0.9)' },
        },
      },
    },
  },
  plugins: [],
}
