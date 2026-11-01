/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        canvas: '#08090A',
        surface: '#0E1012',
        surfaceElevated: '#16181B',
        borderMuted: 'rgba(255, 255, 255, 0.08)',
        limeAccent: '#D4F63C',
        emeraldAccent: '#34D399',
        iceBlue: '#38BDF8',
        textMain: '#F8FAFC',
        textMuted: '#94A3B8',
      },
      fontFamily: {
        heading: ['var(--font-space-grotesk)', 'sans-serif'],
        sans: ['var(--font-plus-jakarta)', 'sans-serif'],
        mono: ['var(--font-jetbrains-mono)', 'monospace'],
      },
    },
  },
  plugins: [],
};
