/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: {
          base: '#f8fafc', // slate-50
          muted: '#f1f5f9', // slate-100
          border: '#e2e8f0', // slate-200
          card: '#ffffff',
        },
        primary: {
          DEFAULT: '#0284c7', // Sky-600
          hover: '#0369a1',
          light: '#f0f9ff',
          subtle: 'rgba(2, 132, 199, 0.08)',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(15, 23, 42, 0.04), 0 1px 2px -1px rgba(15, 23, 42, 0.04)',
        'card-hover': '0 10px 25px -5px rgba(15, 23, 42, 0.08), 0 8px 10px -6px rgba(15, 23, 42, 0.04)',
        'modal': '0 20px 25px -5px rgba(15, 23, 42, 0.12), 0 8px 10px -6px rgba(15, 23, 42, 0.08)',
        'pass': '0 12px 30px -8px rgba(15, 23, 42, 0.1), 0 0 0 1px rgba(15, 23, 42, 0.06)',
      }
    },
  },
  plugins: [],
}
