/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#F0F2FA',
        surface: '#FFFFFF',
        card: '#FFFFFF',
        border: '#D4D9ED',
        accent: '#4A5CF0',
        'accent-dim': '#3748CC',
        cyan: '#0891B2',
        emerald: '#059669',
        amber: '#D97706',
        rose: '#E11D48',
        'text-primary': '#0F1330',
        'text-secondary': '#4B5280',
        'text-dim': '#9DA3BF',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        'fade-up': 'fadeUp 0.4s ease forwards',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'spin-slow': 'spin 8s linear infinite',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: 0, transform: 'translateY(16px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
