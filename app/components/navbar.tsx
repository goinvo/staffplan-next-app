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
import { FaSearch } from "react-icons/fa";

const Navbar: React.FC = () => {
	const { viewer } = useUserDataContext();
	const fullPathName = usePathname();
	const pathname = usePathname().split("/")[1];
	const activeTab = "navbar-border-accent border-b-2";
	if (!viewer) return <LoadingSpinner />;
	const myPlanUrl = () => {
		return encodeURIComponent(viewer.id);
	};
	const myStaffPlanURL = new RegExp(`^\\/people\\/${viewer.id}$`);
	const myStaffPlanCheck = fullPathName.match(myStaffPlanURL);
	return (
		<nav className="navbar bg-gray-100 px-4 h-14 flex justify-between items-center">
			<div className="flex items-center space-x-4 h-full">
				<Link
					href={`/people/${myPlanUrl()}`}
					className={`navbar-text-accent ${
						myStaffPlanCheck ? activeTab : "hover:underline"
					}`}
				>
					My StaffPlan
				</Link>
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
						pathname === "people" && !myStaffPlanCheck
							? activeTab
							: "hover:underline"
					}`}
				>
					People
				</Link>
			</div>
			<div className="flex justify-center items-center actionbar-text-search">
				<div className="w-4 h-4 flex mr-2" aria-label="search">
					<FaSearch />
				</div>
				<input
					type="text"
					placeholder="Search"
					className="flex bg-transparent py-1 border-none border-gray-300"
				/>
			</div>
			<div className="flex items-center space-x-4 py-4">
				<div className="h-4 w-4">
					<Link href="?airTableFormModal=true">
					<ChatBubbleBottomCenterTextIcon />
					</Link>
				</div>
				{/* <div className="h-4 w-4">
					<BellIcon />
				</div> */}

				<div>{viewer.name}</div>
			</div>
		</nav>
	);
};

export default Navbar;
