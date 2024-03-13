import type { Metadata } from "next";
import { Open_Sans } from "next/font/google";
import "./globals.css";
import Navbar from "./components/navbar";
import ActionBar from "./components/actionbar";
import AddAssignment from "./components/addAssignmentModal";
import AddProject from "./components/addProjectModal";
import { Suspense } from "react";
import AddClient from "./components/addClient";

const open_sans = Open_Sans({ subsets: ["latin"] });

export const metadata: Metadata = {
	title: "Staff Plan",
	description: "Staff Plan App",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {

	return (
		<html lang="en">
			<body className={open_sans.className}>
				<Navbar />
				<ActionBar />
				<Suspense>
					<AddAssignment />
					<AddProject/>
					<AddClient/>
				</Suspense>
				{children}
			</body>
		</html>
	);
}
