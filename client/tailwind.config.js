/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#FEF2F2',
          100: '#FEE2E2',
          200: '#FECACA',
          300: '#FCA5A5',
          400: '#F87171',
          500: '#EF4444',
          600: '#DC2626', // primary brand red
          700: '#B91C1C', // hover red
          800: '#991B1B',
          900: '#7F1D1D',
          DEFAULT: '#DC2626'
        },
        surface: {
          DEFAULT: '#FFFFFF',
          subtle: '#F9FAFB',
          border: '#E5E7EB'
        },
        content: {
          primary: '#111827',
          secondary: '#6B7280',
          muted: '#9CA3AF'
        },
        status: {
          success: '#15803D',
          'success-bg': '#F0FDF4',
          warning: '#B45309',
          'warning-bg': '#FFFBEB',
          error: '#B91C1C',
          'error-bg': '#FEF2F2'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
