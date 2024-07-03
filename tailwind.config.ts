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
			},
		},
	},
	plugins: [require("@tailwindcss/forms")],
};
export default config;
