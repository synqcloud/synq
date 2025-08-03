import sharedConfig from "@synq/ui/tailwind.config";

/** @type {import('tailwindcss').Config} */
const config = {
  ...sharedConfig,
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    ...sharedConfig.content,
  ],
};

export default config;
