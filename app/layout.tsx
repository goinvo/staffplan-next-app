import type { Metadata } from "next";
import { Open_Sans } from "next/font/google";
import "./globals.css";
import Navbar from "./components/navbar";
import ActionBar from "./components/actionbar";
import WeekDisplay from "./components/weekDisplay";

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
        <WeekDisplay />
        {children}
      </body>
    </html>
  );
}
