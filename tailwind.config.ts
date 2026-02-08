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
      },
    },
  },
  plugins: [],
};
export default config;
