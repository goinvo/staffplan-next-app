import type { Metadata } from "next";
import { Open_Sans } from "next/font/google";
import "./globals.css";
import { GoogleAnalytics } from '@next/third-parties/google'
import RootLayoutContents from "./layoutContents";
const open_sans = Open_Sans({ subsets: ["latin"] });

export const metadata: Metadata = {
	title: "StaffPlan",
	description: "StaffPlan",
	icons: {
    icon: '/favicon.png',
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
	return (
		<html lang="en">
			<body className={open_sans.className}>
				<RootLayoutContents>
			<GoogleAnalytics gaId='G-DF2LWWYFZ3' />
					{children}
				</RootLayoutContents>
			</body>
		</html>
	);
}