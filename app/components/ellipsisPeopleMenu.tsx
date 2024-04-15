"use client";
import { Fragment } from "react";
import { Menu, Transition } from "@headlessui/react";
import React from "react";
import { useRouter, usePathname } from "next/navigation";

export default function EllipsisPeopleMenu({ user }: any) {
	const router = useRouter();
	const pathname = usePathname();
	const { name, id, avatarUrl } = user;
	const dropdownSelectedItemClass = (isActive: boolean) =>
		isActive
			? "px-4 py-2 block hover:text-accentgreen hover:cursor-pointer text-sm"
			: "text-gray-900 block px-4 py-2 text-sm";
	const query = {
		name,
		avatarUrl,
		id,
	};
	const queryJSONString = JSON.stringify(query);
	const base64Query = Buffer.from(queryJSONString).toString("base64");
	const handleUserChange = () => {
		const userId = JSON.stringify({ selectedUserId: id });
		router.push(pathname + "/" + encodeURIComponent(userId));
	};
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
				<Menu.Items className="absolute left-0 top-full z-50 ml-9 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
					<div className="py-1 border-b-2">
						<Menu.Item>
							{({ active }) => (
								<p
									className={dropdownSelectedItemClass(active)}
									onClick={handleUserChange}
								>
									View StaffPlan
								</p>
							)}
						</Menu.Item>
						<Menu.Item>
							{({ active }) => (
								<a
									href={`?assignmentmodal=true&user=${base64Query}`}
									className={dropdownSelectedItemClass(active)}
								>
									Add Person
								</a>
							)}
						</Menu.Item>
					</div>
				</Menu.Items>
			</Transition>
		</Menu>
	);
}
