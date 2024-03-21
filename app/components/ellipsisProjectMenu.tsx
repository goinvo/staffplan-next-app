"use client";
import { Fragment, useState } from "react";
import { Menu, Transition } from "@headlessui/react";
import Link from "next/link";
import React from "react";

export default function EllipsisProjectMenu({ project }: any) {
	const [confirmed, setConfirmed] = useState(false);
	const {
		client: { name: clientName, id: clientId },
		name,
		endsOn,
		id,
		startsOn,
		status,
		cost,
	} = project;
	const dropdownSelectedItemClass = (isActive: boolean) =>
		isActive
			? "px-4 py-2 block border-b-2 hover:border-gray-200 hover:text-accentgreen text-sm"
			: "text-gray-900 block px-4 py-2 text-sm";
	const query = {
		clientName: clientName,
		clientId: clientId,
		name,
		endsOn,
		id,
		startsOn,
		status,
		cost,
	};
	const queryJSONString = JSON.stringify(query);
	const base64Query = Buffer.from(queryJSONString).toString("base64");
	return (
		<Menu
			as="div"
			className="relative inline-block text-left z-40"
			id="add-dropdown"
			data-testid="add-dropdown"
		>
			<Menu.Button className="relative z-50 actionbar-text-accent w-full h-full rounded-full flex justify-center items-center ellipsismenu text-2xl"></Menu.Button>

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
					<div className="py-1">
						<Menu.Item>
							{({ active }) => (
								<p className={dropdownSelectedItemClass(active)}>
									View Project
								</p>
							)}
						</Menu.Item>
						<label className="ml-3 inline-block pl-[0.15rem] hover:cursor-pointer">
							<input
								className="mr-2 mt-[0.3rem] h-3.5 w-8 appearance-none rounded-[0.4375rem] bg-neutral-300 
																		hover:checked:bg-accentgreen
																		before:pointer-events-none before:absolute before:h-3.5 before:w-3.5 before:rounded-full before:bg-transparent before:content-[''] after:absolute after:z-[2] after:-mt-[0.1875rem] after:h-5 after:w-5 after:rounded-full after:border-none after:bg-neutral-100 after:shadow-[0_0px_3px_0_rgb(0_0_0_/_7%),_0_2px_2px_0_rgb(0_0_0_/_4%)] after:transition-[background-color_0.2s,transform_0.2s] after:content-[''] checked:bg-accentgreen checked:after:absolute checked:after:z-[2] checked:after:-mt-[3px] checked:after:ml-[1.0625rem] checked:after:h-5 checked:after:w-5 checked:after:rounded-full checked:after:border-none checked:after:bg-accentgreen checked:after:shadow-[0_3px_1px_-2px_rgba(0,0,0,0.2),_0_2px_2px_0_rgba(0,0,0,0.14),_0_1px_5px_0_rgba(0,0,0,0.12)] checked:after:transition-[background-color_0.2s,transform_0.2s] checked:after:content-[''] hover:cursor-pointer focus:outline-none focus:ring-0 focus:before:scale-100 focus:before:opacity-[0.12] focus:before:shadow-[3px_-1px_0px_13px_rgba(0,0,0,0.6)] focus:before:transition-[box-shadow_0.2s,transform_0.2s] focus:after:absolute focus:after:z-[1] focus:after:block focus:after:h-5 focus:after:w-5 focus:after:rounded-full focus:after:content-[''] checked:focus:border-accentgreen checked:focus:bg-accentgreen checked:focus:before:ml-[1.0625rem] checked:focus:before:scale-100 checked:focus:before:shadow-[3px_-1px_0px_13px_#3b71ca] checked:focus:before:transition-[box-shadow_0.2s,transform_0.2s] dark:bg-neutral-600 dark:after:bg-neutral-400 dark:checked:bg-accentgreen dark:checked:after:bg-accentgreen dark:focus:before:shadow-[3px_-1px_0px_13px_rgba(255,255,255,0.4)] dark:checked:focus:before:shadow-[3px_-1px_0px_13px_#3b71ca]"
								type="checkbox"
								name="status"
								checked={confirmed}
								onChange={() => setConfirmed(!confirmed)}
							/>
							{confirmed ? "Confirmed" : "Unconfirmed"}
						</label>
						<Menu.Item>
							{({ active }) => (
								<a href="#" className={dropdownSelectedItemClass(active)}>
									Add Staff
								</a>
							)}
						</Menu.Item>
						<Menu.Item>
							{({ active }) => (
								<Link
									href={`?projectmodal=true&project=${base64Query}`}
									className={dropdownSelectedItemClass(active)}
								>
									Edit Details
								</Link>
							)}
						</Menu.Item>
					</div>
					<Menu.Item>
						{({ active }) => (
							<Link href={"#"} className={dropdownSelectedItemClass(active)}>
								Archive Project
							</Link>
						)}
					</Menu.Item>
				</Menu.Items>
			</Transition>
		</Menu>
	);
}
