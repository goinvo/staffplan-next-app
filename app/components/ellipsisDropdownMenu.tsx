import { Fragment, ReactNode } from "react";
import {
	Menu,
	MenuItem,
	MenuButton,
	MenuItems,
	Transition,
} from "@headlessui/react";
import React from "react";

interface DropdownMenuProps {
	options: { component: ReactNode; show?: boolean }[];
	textColor: string;
	menuPositioning?: string;
}

const EllipsisDropdownMenu: React.FC<DropdownMenuProps> = ({
	options,
	textColor,
	menuPositioning
}) => {
	const dropdownSelectedItemClass = (isActive: boolean) => {
		return isActive
			? "block hover:text-tiffany hover:cursor-pointer text-sm"
			: "text-gray-900 block text-sm";
	};
	return (
		<Menu as="div" className="relative inline-block text-left z-15">
			<MenuButton
				className={`flex items-center text-3xl ${textColor} hover:text-gray-300 sm:p-2 rounded-full ellipsismenu focus:outline-none ${menuPositioning}`}
			/>

			<Transition
				as={Fragment}
				enter="transition ease-out duration-100"
				enterFrom="transform opacity-0 scale-95"
				enterTo="transform opacity-100 scale-100"
				leave="transition ease-in duration-75"
				leaveFrom="transform opacity-100 scale-100"
				leaveTo="transform opacity-0 scale-95"
			>
				<MenuItems className="absolute right-0 mt-2 w-48 origin-top-right bg-white divide-y divide-gray-100 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-20" anchor='right start'>
					<div className="py-1">
						{options.filter(option => option.show).map((option, index) =>
						(
							<MenuItem key={index}>
								{({ active }) => (
									<div className={dropdownSelectedItemClass(active)}>
										{option.component}
									</div>
								)}
							</MenuItem>
						)
						)}
					</div>
				</MenuItems>
			</Transition>
		</Menu>
	);
};

export default EllipsisDropdownMenu;
