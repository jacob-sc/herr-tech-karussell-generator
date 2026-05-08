import type { Config } from 'tailwindcss'

export default {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        surface: 'var(--surface)',
        'surface-secondary': 'var(--surface-secondary)',
        border: 'var(--border)',
        muted: 'var(--muted)',
        primary: 'var(--primary)',
      },
    },
  },
  plugins: [],
} satisfies Config
