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
	images:{
		domains: ['secure.gravatar.com','www.gravatar.com','staffplan.fermion.dev','localhost', 'app.staffplan.com', 'staffplan.com'],
		remotePatterns:[
			{
				protocol: 'https',
				hostname: 'app.staffplan.com',
				port: '',
				pathname: '/rails/active_storage/**',
			}
		]
	}
};
export default nextConfig;
