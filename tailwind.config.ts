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
        // These will pull from your CSS variables
        accentgreen: "var(--accent-green)",
        accentlightgreen: "var(--accent-light-green)",
        accentblue: "var(--accent-blue)",
        accentgrey: "var(--accent-grey)",
        tiffany: "var(--color-tiffany)",
        contrastBlue: "var(--navbar-bg)",
      },
      fontFamily: {
        sans: ["var(--font-primary)"],
        display: ["var(--font-secondary)"],
      },
      backgroundColor: {
        primary: "rgb(var(--background-start-rgb))",
      },
      textColor: {
        primary: "rgb(var(--foreground-rgb))",
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};

export default config;
