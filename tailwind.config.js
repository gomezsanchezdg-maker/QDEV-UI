/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}', './index.html'],
  theme: {
    extend: {
      colors: {
        bg: {
          base: '#1a1a1a',
          panel: '#222222',
          sidebar: '#1e1e1e',
          elevated: '#2a2a2a',
          hover: '#2e2e2e',
          active: '#333333',
        },
        border: {
          subtle: '#2e2e2e',
          DEFAULT: '#383838',
          strong: '#444444',
        },
        text: {
          primary: '#e8e8e8',
          secondary: '#a0a0a0',
          muted: '#666666',
          accent: '#4d9eff',
          code: '#79c0ff',
          keyword: '#d2a8ff',
          string: '#a5d6ff',
          command: '#7ee787',
        },
        accent: {
          blue: '#4d9eff',
          'blue-dim': '#1a3a5e',
          green: '#3fb950',
          orange: '#d29922',
          red: '#f85149',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Cascadia Code', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.2s ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'blink': 'blink 1s step-end infinite',
      },
      keyframes: {
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp: { from: { opacity: '0', transform: 'translateY(8px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        pulseSoft: { '0%, 100%': { opacity: '1' }, '50%': { opacity: '0.5' } },
        blink: { '0%, 100%': { opacity: '1' }, '50%': { opacity: '0' } },
      },
    },
  },
  plugins: [],
}
