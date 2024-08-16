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
        contrastBlue: "#23324C",
      },
      fontSize: {
        tiny: "14px",
        huge: "28px",
      },
      boxShadow: {
        "top-shadow": "inset 0 2px 1.5px rgba(199, 199, 199, 1)",
      },
      backgroundImage: {
        "diagonal-stripes":
          "repeating-linear-gradient(45deg, #e9eaf2, #e9eaf2 2px, #e4e5ef 2px, #e4e5ef 2px)",
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};
export default config;
