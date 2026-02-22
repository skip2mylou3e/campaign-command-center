import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        dd: {
          navy: '#0A1F3F',
          'navy-light': '#142D54',
          teal: '#00A5B5',
          'teal-light': '#00C4D6',
          'teal-dark': '#008A97',
          slate: '#1E293B',
          gray: '#64748B',
          'gray-light': '#F1F5F9',
          border: '#E2E8F0',
          white: '#FFFFFF',
        },
        evn: {
          base: '#0C1524',
          card: '#14223A',
          border: '#1E3455',
          'text-primary': '#E2EAF4',
          'text-secondary': '#8BA3C7',
          'text-muted': '#4A6080',
          amber: '#E8A838',
          'amber-dark': '#D4922E',
          purple: '#7C5CFC',
          'purple-light': '#A78BFA',
          tier1: '#34D399',
          tier2: '#FBBF24',
          tier3: '#9CA3AF',
          alert: '#F87171',
          info: '#60A5FA',
        },
      },
    },
  },
  plugins: [],
};
export default config;
