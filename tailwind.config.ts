import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./app/global.css",
  ],
  theme: {
    extend: {
      // backgroundImage: {
      //   "diagonal-stripes":
      //     "repeating-linear-gradient(135deg, #e9eaf2, #e9eaf2 10px, #e4e5ef 10px, #e4e5ef 20px)",
      //   "pencil-strokes":
      //     "linear-gradient(45deg, #ffffff1a 25%, transparent 25%, transparent 50%, #ffffff1a 50%, #ffffff1a 75%, transparent 75%, transparent)",
      // },
      // backgroundSize: {
      //   "pencil-strokes": "4px 4px",
      // },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};
export default config;
