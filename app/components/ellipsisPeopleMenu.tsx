"use client";
import { Fragment } from "react";
import {  Menu,MenuItem, MenuButton, MenuItems, Transition } from "@headlessui/react";
import React from "react";
import { useRouter } from "next/navigation";
import { useModal } from "../contexts/modalContext";
import { UserType } from "../typeInterfaces";
import AddAssignmentModal from "./addAssignmentModal";

interface EllipsisPeopleMenuProps {
	user: UserType
}
export default function EllipsisPeopleMenu({ user }: EllipsisPeopleMenuProps) {
	const { openModal, closeModal } = useModal();
	const router = useRouter();

	const dropdownSelectedItemClass = (isActive: boolean) =>
		isActive
			? "px-4 py-2 block hover:text-accentgreen hover:cursor-pointer text-sm"
			: "text-gray-900 block px-4 py-2 text-sm";

	const handleUserChange = () => {
		router.push(`people/${user.id}`);
	};
	return (
		<Menu
			as="div"
			className="relative inline-block text-left z-100"
			id="add-dropdown" data-testid="add-dropdown"
		>
			<MenuButton className="relative z-1 actionbar-text-accent w-full h-full rounded-full flex justify-center items-center ellipsismenu text-2xl"></MenuButton>

			<Transition
				as={Fragment}
				enter="transition ease-out duration-100"
				enterFrom="transform opacity-0 scale-95"
				enterTo="transform opacity-100 scale-100"
				leave="transition ease-in duration-75"
				leaveFrom="transform opacity-100 scale-100"
				leaveTo="transform opacity-0 scale-95"
			>
				<MenuItems className="absolute left-0 top-full z-50 ml-9 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
					<div className="py-1 border-b-2">
						<MenuItem>
							{({ active }) => (
								<p
									className={dropdownSelectedItemClass(active)}
									onClick={handleUserChange}
								>
									View StaffPlan
								</p>
							)}
						</MenuItem>
						<MenuItem>
							{({ active }) => (
								<button
									className={dropdownSelectedItemClass(active)}
									onClick={() =>
										openModal(<AddAssignmentModal user={user} closeModal={closeModal} />)
									}
								>
									Add Project
								</button>
							)}

						</MenuItem>
					</div>
				</MenuItems>
			</Transition>
		</Menu>
	);
}
