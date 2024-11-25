"use client";

import React from "react";
import Link from "next/link";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { FaSquarePlus } from "react-icons/fa6";
import { ChatBubbleBottomCenterTextIcon } from "@heroicons/react/24/outline";
import { usePathname } from "next/navigation";
import { LoadingSpinner } from "./loadingSpinner";

import IconButton from "./iconButton";
import NewPersonAndProjectModal from "./newPersonAndProjectModal";
import { useModal } from "../contexts/modalContext";
import AirTableFormModal from "./airTableFormModal";
import { useGeneralDataContext } from "../contexts/generalContext";
import EllipsisDropdownMenu from "./ellipsisDropdownMenu";

const Navbar: React.FC = () => {
	const { viewer } = useGeneralDataContext();
	const fullPathName = usePathname();
	const pathname = usePathname().split("/")[1];
	const { openModal, closeModal } = useModal();
	if (!viewer) return <LoadingSpinner />;

	const myPlanUrl = () => {
		return encodeURIComponent(viewer.id);
	};
	const myStaffPlanURL = new RegExp(`^\\/people\\/${viewer.id}$`);
	const myStaffPlanCheck = fullPathName.match(myStaffPlanURL);
	const homepageUrl = process.env.NEXT_PUBLIC_NODE_ENV
		? "http://localhost:3000"
		: "https://staffplan.com";
	const links = [
		{
			href: `/people/${myPlanUrl()}`,
			label: "My StaffPlan",
			isActive: myStaffPlanCheck,
		},
		{
			href: "/people",
			label: "People",
			isActive: pathname === "people" && !myStaffPlanCheck,
		},
		{ href: "/projects", label: "Projects", isActive: pathname === "projects" },
	];
	const ellipsisDropdownMenuOptions = [
		{
			component: <Link href={"https://github.com/goinvo/staffplan-next-app"}>{"Open Source"}</Link>,
			show: true,
		},
		{
			component: <Link href={`${homepageUrl}/settings/profile`}>{"Settings"}</Link>,
			show: true,
		},
		{
			component: <Link href={`${homepageUrl}/sign_out`}>{"Sign Out"}</Link>,
			show: true,
		},
	];
	return (
		<nav className="navbar bg-gray-100 pl-6 pr-0 sm:px-5 h-14 flex justify-between items-center">
			<div className="flex items-center pl-1 sm:pl-0 sm:space-x-4 space-x-1 h-full">
				{links.map((link) => (
					<Link
						key={link.href}
						href={link.href}
						className={`inline-flex items-center text-base sm:px-4 px-1 sm:py-2 py-1 rounded-md whitespace-nowrap ${link.isActive
							? "bg-contrastBlue font-semibold"
							: "hover:bg-contrastBlue"
							}`}
					>
						{link.label}
					</Link>
				))}
				<IconButton
					Icon={FaSquarePlus}
					onClick={() =>
						openModal(<NewPersonAndProjectModal closeModal={closeModal} />)
					}
					iconSize="sm:block hidden h-8 w-8 rounded-md text-contrastGrey"
					className="px-8"
				/>
			</div>
			{/* Temporary commented */}
			{/* <div className="flex ml-auto items-center bg-contrastBlue rounded-2xl overflow-hidden min-w-[225px] h-8">
				<div className="flex ml-3 items-center">
					<MagnifyingGlassIcon className="h-4 w-4 text-contrastGrey" />
				</div>
				<input
					type="text"
					placeholder="Search"
					className="flex py-1 pl-2 bg-contrastBlue text-white text-sm border-none outline-none focus:ring-0 focus:border-none"
				/>
			</div> */}
			<div className="flex items-center sm:space-x-4 py-4 sm:ml-2">
				<div>
					<button
						className="sm:inline-flex hidden items-center text-base px-4 py-2 rounded-md hover:bg-contrastBlue"
						onClick={() =>
							openModal(<AirTableFormModal closeModal={closeModal} />)
						}
					>
						Feedback
					</button>
				</div>
				<EllipsisDropdownMenu
					options={ellipsisDropdownMenuOptions}
					textColor={"text-white"}
				/>
				{/* Temporary commented */}
				{/* <div className="h-4 w-4">
					<ChatBubbleBottomCenterTextIcon />
				</div> */}
			</div>
		</nav>
	);
};

export default Navbar;
