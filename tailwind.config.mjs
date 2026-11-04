/** @type {import('tailwindcss').Config} */
// Tailwind v4 is loaded via `@config` in src/styles/global.css, so this file
// remains the single source of truth for design tokens.
export default {
  content: ['./src/**/*.{astro,html,js,ts,md,mdx}'],
  theme: {
    extend: {
      colors: {
        obsidian: '#05070B',
        cyan: { glow: '#00F0FF' },
        violet: { glow: '#7000FF' },
        emerald: { glow: '#10B981' },
      },
      fontFamily: {
        sans: ['"Inter Variable"', 'Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['"JetBrains Mono Variable"', '"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      boxShadow: {
        glow: '0 0 40px -10px rgba(0,240,255,0.45)',
        'glow-violet': '0 0 40px -10px rgba(112,0,255,0.55)',
      },
    },
  },
};
