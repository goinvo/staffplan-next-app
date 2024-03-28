"use client";
import React from "react";
import Link from "next/link";
import {
	ChatBubbleBottomCenterTextIcon,
	BellIcon,
} from "@heroicons/react/24/outline";
import { usePathname } from "next/navigation";
import { useUserDataContext } from "../userDataContext";
import { LoadingSpinner } from "./loadingSpinner";

const Navbar: React.FC = () => {
	const { viewer } = useUserDataContext();
	const pathname = usePathname().split("/")[1];
	const activeTab = "navbar-border-accent border-b-2";
	if (!viewer) return <LoadingSpinner />;
	const myPlanUrl = () => {
		const userId = JSON.stringify({ selectedUserId: viewer.id });
		return Buffer.from(userId).toString("base64");
	};
	return (
		<nav className="navbar bg-gray-100 px-4 h-14 flex justify-between items-center">
			<div className="flex items-center space-x-4 h-full">
				<div className="placeholder-logo">Logo</div>
				<Link
					href="/projects"
					className={`flex h-full justify-between items-center ${
						pathname === "projects" ? activeTab : "hover:underline"
					}`}
				>
					Projects
				</Link>
				<Link
					href="/people"
					className={`flex h-full justify-between items-center ${
						pathname === "people" ? activeTab : "hover:underline"
					}`}
				>
					People
				</Link>
			</div>
			<div className="flex items-center space-x-4 py-4">
				<Link
					href={`/people/${myPlanUrl()}`}
					className="navbar-text-accent hover:underline"
				>
					My Plan
				</Link>
				<div className="h-4 w-4">
					<ChatBubbleBottomCenterTextIcon />
				</div>
				<div className="h-4 w-4">
					<BellIcon />
				</div>

				<div>{viewer.name}</div>
			</div>
		</nav>
	);
};

export default Navbar;
