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
			},
			{
				protocol: 'https',
				hostname:'secure.gravatar.com',
				pathname: '**',
			},
			{
				protocol: 'https',
				hostname:'www.gravatar.com',
				pathname: '**',
			},
			{
				protocol: 'https',
				hostname:'staffplan.fermion.dev',
				pathname: '**',
			},
			{
				protocol: 'https',
				hostname:'localhost',
				pathname: '**',
			},
			{
				protocol: 'https',
				hostname:'app.staffplan.com',
				pathname: '**',
			},
			{
				protocol: 'https',
				hostname:'staffplan.com',
				pathname: '**',
			}
		]
	}
};
export default nextConfig;
