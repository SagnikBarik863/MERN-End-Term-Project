import colors from 'tailwindcss/colors';

// The UI is dark-only. Scales run from background (50) to brightest text (950),
// so classes keep their meaning: bg-ink-50 is the page, text-ink-900 is primary text.
const invert = (scale) => {
  const keys = Object.keys(scale);
  return Object.fromEntries(keys.map((k, i) => [k, scale[keys[keys.length - 1 - i]]]));
};

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        display: ['Orbitron', '"Space Grotesk"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        surface: '#0b1020',
        'on-accent': '#05070f',
        ink: {
          50: '#070a14',
          100: '#141b2e',
          200: '#1f2a44',
          300: '#2f3c5e',
          400: '#56658a',
          500: '#8291b5',
          600: '#a6b2d1',
          700: '#c4cde6',
          800: '#dde3f4',
          900: '#eef2fc',
          950: '#ffffff',
        },
        // Neon cyan: low steps are dark tints for fills, high steps glow.
        brand: {
          50: '#04202a',
          100: '#063140',
          200: '#0b4a5e',
          300: '#1fc8e6',
          400: '#2ee6ff',
          500: '#00e5ff',
          600: '#00f0ff',
          700: '#6af7ff',
          800: '#a8fbff',
          900: '#d6fdff',
        },
        neon: {
          cyan: '#00f0ff',
          magenta: '#ff2bd6',
          violet: '#a855ff',
          lime: '#b6ff3b',
        },
        // Status hues, inverted for the dark surface (pale tints become deep fills).
        red: invert(colors.red),
        rose: invert(colors.rose),
        amber: invert(colors.amber),
        emerald: invert(colors.emerald),
      },
      boxShadow: {
        card: '0 10px 30px -12px rgba(0,0,0,0.7)',
        glow: '0 0 18px -4px rgba(0,240,255,0.7)',
        'glow-magenta': '0 0 18px -4px rgba(255,43,214,0.7)',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { opacity: '0.55' },
          '50%': { opacity: '1' },
        },
      },
      animation: {
        'pulse-glow': 'pulse-glow 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
