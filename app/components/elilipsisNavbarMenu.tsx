"use client";
import { Fragment } from "react";
import { Menu, Transition } from "@headlessui/react";
import React from "react";
import { useRouter } from "next/navigation";
import { useModal } from "../contexts/modalContext";
import { UserType } from "../typeInterfaces";
import AddAssignmentModal from "./addAssignmentModal";
import Link from "next/link";
import { useGeneralDataContext } from "../contexts/generalContext";
import { LoadingSpinner } from "./loadingSpinner";

export default function EllipsisNavbarMenu() {
	const dropdownSelectedItemClass = (isActive: boolean, visible: boolean) => {
		if (!visible) return "hidden";
		return isActive
			? "px-4 py-2 block hover:text-accentgreen hover:cursor-pointer text-sm"
			: "text-gray-900 block px-4 py-2 text-sm";
	};
	const { viewer } = useGeneralDataContext();
	if (!viewer) return <LoadingSpinner />;
	const showSettingsLink = viewer.role === "admin" || viewer.role === "owner";
	const homepageUrl = process.env.NEXT_PUBLIC_NODE_ENV
		? "http://localhost:3000"
		: "https://staffplan.com";
	const additionalLinks = [
		{
			href: "https://github.com/goinvo/staffplan-next-app",
			label: "Open Source",
			show: true,
		},
		{
			href: `${homepageUrl}/settings`,
			label: "Settings",
			show: showSettingsLink,
		},
		{ href: `${homepageUrl}/users/profile`, label: "Profile", show: true },
		{ href: `${homepageUrl}/sign_out`, label: "Sign Out", show: true },
	];
	return (
		<Menu
			as="div"
			className="relative inline-block text-left z-100"
			id="add-dropdown"
			data-testid="add-dropdown"
		>
			<Menu.Button className="relative z-1 actionbar-text-accent w-full h-full rounded-full flex justify-center items-center ellipsismenu text-2xl"></Menu.Button>

			<Transition
				as={Fragment}
				enter="transition ease-out duration-100"
				enterFrom="transform opacity-0 scale-95"
				enterTo="transform opacity-100 scale-100"
				leave="transition ease-in duration-75"
				leaveFrom="transform opacity-100 scale-100"
				leaveTo="transform opacity-0 scale-95"
			>
				<Menu.Items className="absolute left-1/2 top-full z-50 -translate-x-1/2 mt-2 w-56 origin-top-center rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
					<div className="py-1 border-b-2">
						{additionalLinks.map((link) => (
							<Menu.Item key={link.label}>
								{({ active }) => (
									<div>
										<Link
											href={link.href}
											className={dropdownSelectedItemClass(active, link.show)}
										>
											{link.label}
										</Link>
									</div>
								)}
							</Menu.Item>
						))}
					</div>
				</Menu.Items>
			</Transition>
		</Menu>
	);
}
