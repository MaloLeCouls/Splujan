import type { Config } from 'tailwindcss'

export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        'lcd-digits': ['DSEG7Modern', 'monospace'],
        'lcd-alpha': ['DSEG14Modern', 'monospace'],
      },
    },
  },
  plugins: [],
} satisfies Config
