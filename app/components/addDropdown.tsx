"use client"
import { Fragment } from "react";
import { Menu, Transition } from "@headlessui/react";
import Link from "next/link";

export default function AddDropdown() {

	const dropdownSelectedItemClass = (isActive: boolean) =>
		isActive
			? "px-4 py-2 block border-b-2 hover:border-gray-200 text-sm"
			: "text-gray-900 block px-4 py-2 text-sm";

	return (
		<Menu as="div" className="relative inline-block text-left">
			<div>
				<Menu.Button className="actionbar-bg-accent actionbar-text-accent w-8 h-8 rounded-full flex justify-center items-center">
					+
				</Menu.Button>
			</div>

			<Transition
				as={Fragment}
				enter="transition ease-out duration-100"
				enterFrom="transform opacity-0 scale-95"
				enterTo="transform opacity-100 scale-100"
				leave="transition ease-in duration-75"
				leaveFrom="transform opacity-100 scale-100"
				leaveTo="transform opacity-0 scale-95"
			>
				<Menu.Items className="absolute left-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
					<div className="py-1">
						<Menu.Item>
							{() => (
								<p className={"text-gray-500 block px-4 py-2 text-xs"}>
									Add A New
								</p>
							)}
						</Menu.Item>
						<Menu.Item>
							{({ active }) => (
								<a href="#" className={dropdownSelectedItemClass(active)}>
									Person
								</a>
							)}
						</Menu.Item>
						<Menu.Item>
						{({ active }) => (
								<>
									<Link
										href={"?projectmodal=true"}
										className={dropdownSelectedItemClass(active)}
									>
										Project
									</Link>
								</>
							)}
						</Menu.Item>
					</div>
					<div className="py-1">
						<Menu.Item>
							{({ active }) => (
								<>
									<Link
										href={"?assignmentmodal=true"}
										className={dropdownSelectedItemClass(active)}
									>
										Assignment
									</Link>
								</>
							)}
						</Menu.Item>
						<Menu.Item>
							{({ active }) => (
								<a href="#" className={dropdownSelectedItemClass(active)}>
									Client
								</a>
							)}
						</Menu.Item>
					</div>
				</Menu.Items>
			</Transition>
		</Menu>
	);
}
