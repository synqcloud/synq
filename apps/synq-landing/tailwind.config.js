/** @type {import('tailwindcss').Config} */
import baseConfig from "../../packages/ui/tailwind.config.js";

export default {
  ...baseConfig,
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/ui/src/components/**/*.{ts,tsx}',
  ],
}