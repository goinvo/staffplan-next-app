import { Fragment, ReactNode } from "react";
import { Menu,MenuItem, MenuButton, MenuItems, Transition } from "@headlessui/react";
import React from "react";

interface DropdownMenuProps {
    options: {  component:()=>ReactNode,show?: boolean }[];
    location: 'navbar' | 'userAssignment';
}

const EllipsisDropdownMenu: React.FC<DropdownMenuProps> = ({ options, location }) => {
    const ellipsisENUM = {
        navbar: "text-white",
        userAssignment: "text-gray-900",
    }
    const dropdownSelectedItemClass = (isActive: boolean) => {
        return isActive
            ? "px-4 py-2 block hover:text-tiffany hover:cursor-pointer text-sm"
            : "text-gray-900 block px-4 py-2 text-sm";
    };
    return (
        <Menu as="div" className="relative inline-block text-left z-15">
            <MenuButton className={`flex items-center ${ellipsisENUM[location]} hover:text-gray-300 p-2 rounded-full ellipsismenu focus:outline-none`} />
            <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
            >
                <MenuItems className="absolute right-0 mt-2 w-48 origin-top-right bg-white divide-y divide-gray-100 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-20">
                    <div className="py-1">
                    {options.map((option, index) =>
                            option.show ? (
                                <MenuItem key={index}>
                                    {({ active }) => (
                                        <div className={dropdownSelectedItemClass(active)}>
                                            {option.component()}
                                        </div>
                                    )}
                                </MenuItem>
                            ) : null
                        )}
                    </div>
                </MenuItems>
            </Transition>
        </Menu>
    );
};

export default EllipsisDropdownMenu;
