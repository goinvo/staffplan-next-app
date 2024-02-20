/** @type {import('next').NextConfig} */

const homepageURL = process.env.HOMEPAGE_URL || "http://localhost:3000"
const nextConfig = {
	async redirects() {
		return [
			{
				source: "/",
				destination: homepageURL,
				permanent: false,
				basePath: false,
			},
		];
	},
};
export default nextConfig;
