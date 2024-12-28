import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        accentlightgreen: "#72DDC3",
        accentgreen: "#02AAA4",
        accentgrey: "#7084A3",
        tiffany: "#27B5B0",
        transparentGrey: "#AABBCC",
        transparentBlue: "#37455e",
        hoverGrey: "#e3e4ee",
        lightGrey: "#dddeeb",
        blueGreyLight: "#ced0dd",
        contrastBlue: "#23324C",
        contrastGrey: "#aeb3c0",
        selectedColumnBg: "#dfe0ec",
      },
      fontSize: {
        "2xs": "10px",
        tiny: "14px",
        huge: "28px",
      },
      boxShadow: {
        "top-input-shadow": "inset 0 2px 1.5px rgba(199, 199, 199, 1)",
      },
      backgroundImage: {
        "diagonal-stripes":
          "repeating-linear-gradient(135deg, #e9eaf2, #e9eaf2 10px, #e4e5ef 10px, #e4e5ef 20px)",
        "pencil-strokes":
          "linear-gradient(45deg, #ffffff1a 25%, transparent 25%, transparent 50%, #ffffff1a 50%, #ffffff1a 75%, transparent 75%, transparent)",
      },
      backgroundSize: {
        "pencil-strokes": "4px 4px",
      },
      keyframes: {
        fadeInScale: {
          "0%": { opacity: "0", height: "0" },
          "100%": { opacity: "1", height: "100px" },
        },
        fadeOutScale: {
          "0%": { opacity: "1", height: "100px" },
          "100%": { opacity: "0", height: "0" },
        },
      },
      animation: {
        fadeInScale: "fadeInScale 0.7s ease-in-out",
        fadeOutScale: 'fadeOutScale 0.7s ease-in-out',
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};
export default config;
