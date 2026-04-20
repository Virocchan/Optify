import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1D9E75',
          light: '#E8F5F0',
          dark: '#157359',
        },
        danger: {
          DEFAULT: '#E24B4A',
          light: '#FCEAEA',
        },
        warning: {
          DEFAULT: '#EF9F27',
          light: '#FFF5E6',
        },
        surface: '#FFFFFF',
        background: '#F5F5F3',
        border: 'rgba(0,0,0,0.06)',
        text: {
          primary: '#1A1A1A',
          secondary: '#6B7280',
          muted: '#9CA3AF',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'monospace'],
      },
      borderRadius: {
        card: '12px',
        input: '8px',
        badge: '6px',
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)',
        cardHover: '0 4px 12px rgba(0,0,0,0.08)',
      },
    },
  },
  plugins: [],
}

export default config