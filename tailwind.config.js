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
        canvas: '#0B0F10',
        surface: '#141C1E',
        surfaceElevated: '#1B2427',
        borderMuted: '#223033',
        limeAccent: '#D4F63C',
        emeraldAccent: '#2EE59D',
        textMain: '#F3F7F6',
        textMuted: '#8E9D9E',
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
