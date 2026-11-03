/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        canvas: 'var(--color-canvas)',
        surface: 'var(--color-surface)',
        surfaceElevated: 'var(--color-surfaceElevated)',
        borderMuted: 'var(--color-borderMuted)',
        borderStrong: 'var(--color-borderStrong)',
        limeAccent: '#CCF32F',
        emeraldAccent: '#10B981',
        iceBlue: '#0EA5E9',
        roseAlert: '#F43F5E',
        textMain: 'var(--color-textMain)',
        textMuted: 'var(--color-textMuted)',
      },
      fontFamily: {
        heading: ['var(--font-space-grotesk)', 'sans-serif'],
        sans: ['var(--font-plus-jakarta)', 'sans-serif'],
        mono: ['var(--font-jetbrains-mono)', 'monospace'],
      },
      borderRadius: {
        sm: '6px',
        md: '8px',
        lg: '12px',
      },
    },
  },
  plugins: [],
};
