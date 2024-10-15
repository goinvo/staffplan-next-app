import { Fragment } from "react";
import { Menu, Transition } from "@headlessui/react";
import React from "react";
import Link from "next/link";

interface DropdownMenuProps {
    options: { label: string, href: string, show?: boolean }[];
}

const EllipsisDropdownMenu: React.FC<DropdownMenuProps> = ({ options }) => {
    const dropdownSelectedItemClass = (isActive: boolean) => {
        return isActive
            ? "px-4 py-2 block hover:text-tiffany hover:cursor-pointer text-sm"
            : "text-gray-900 block px-4 py-2 text-sm";
    };
    return (
        <Menu as="div" className="relative inline-block text-left z-20">
            <Menu.Button className="flex items-center text-white hover:text-gray-300 p-2 rounded-full ellipsismenu focus:outline-none" />
            <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
            >
                <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right bg-white divide-y divide-gray-100 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-20">
                    <div className="py-1">
                        {options.map((option, index) =>
                            option.href && option.show ? (
                                <Menu.Item key={index}>
                                    {({ active }) => (
                                        <Link
                                            href={option.href}
                                            className={dropdownSelectedItemClass(active)}
                                        >
                                            {option.label}
                                        </Link>
                                    )}
                                </Menu.Item>
                            ) : null
                        )}
                    </div>
                </Menu.Items>
            </Transition>
        </Menu>
    );
};

export default EllipsisDropdownMenu;
