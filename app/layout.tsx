import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "./components/navbar";
import ActionBar from "./components/actionbar";
import WeekDisplay from "./components/weekDisplay";
import AddAssignment from "./components/addAssignment";

const inter = Inter({ subsets: ["latin"] });

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
      <body className={inter.className}>
        <Navbar />
        <ActionBar />
        <WeekDisplay />
        {children}
      </body>
    </html>
  );
}
