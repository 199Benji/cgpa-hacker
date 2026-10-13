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
          DEFAULT: 'var(--color-primary)',
          hover: 'var(--color-primary-hover)',
        },
        accent: 'var(--color-accent)',
        background: 'var(--color-background)',
        surface: {
          DEFAULT: 'var(--color-surface)',
          hover: 'var(--color-surface-hover)',
        },
        text: {
          main: 'var(--color-text-main)',
          muted: 'var(--color-text-muted)',
        },
        border: 'var(--color-border)',
        success: 'var(--color-success)',
        danger: 'var(--color-danger)',
      },
    },
  },
  plugins: [],
}