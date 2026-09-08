/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        command: {
          darkest: '#040711',
          bg: '#070c1a',
          surface: '#0d1527',
          card: '#111b33',
          cardHover: '#162343',
          border: 'rgba(6, 182, 212, 0.18)',
          borderSubtle: 'rgba(148, 163, 184, 0.12)',
        },
        cyan: {
          glow: 'rgba(6, 182, 212, 0.25)',
        },
        amber: {
          glow: 'rgba(245, 158, 11, 0.25)',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      backgroundImage: {
        'grid-pattern': 'linear-gradient(to right, rgba(6, 182, 212, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(6, 182, 212, 0.05) 1px, transparent 1px)',
        'dots-pattern': 'radial-gradient(rgba(6, 182, 212, 0.15) 1px, transparent 1px)',
      },
      backgroundSize: {
        'grid-sm': '24px 24px',
        'grid-md': '48px 48px',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'radar-sweep': 'radar 8s linear infinite',
      },
      keyframes: {
        radar: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        }
      }
    },
  },
  plugins: [],
}
