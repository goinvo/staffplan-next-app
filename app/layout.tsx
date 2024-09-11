import type { Metadata } from "next";
import { Open_Sans } from "next/font/google";
import "./globals.css";
import RootLayoutContents from "./layoutContents";

const open_sans = Open_Sans({ subsets: ["latin"] });

export const metadata: Metadata = {
	title: "StaffPlan",
	description: "StaffPlan",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
	return (
		<html lang="en">
			<body className={open_sans.className}>
				<RootLayoutContents>
					{children}
				</RootLayoutContents>
			</body>
		</html>
	);
}