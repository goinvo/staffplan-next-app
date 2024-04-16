"use client";
import { BaseSyntheticEvent, Fragment, useState } from "react";
import { Menu, Transition } from "@headlessui/react";
import Link from "next/link";
import React from "react";
import { UPSERT_PROJECT } from "../gqlQueries";
import { useMutation } from "@apollo/client";
import { useRouter, usePathname } from "next/navigation";

export default function EllipsisProjectMenu({ project }: any) {
	const router = useRouter();
	const pathname = usePathname();
	const {
		client: { name: clientName, id: clientId },
		name,
		endsOn,
		id,
		startsOn,
		status,
		cost,
		hours,
		fte,
	} = project;
	const [confirmed, setConfirmed] = useState(
		status === "confirmed" ? true : false
	);
	const dropdownSelectedItemClass = (isActive: boolean) =>
		isActive
			? "px-4 py-2 block hover:text-accentgreen hover:cursor-pointer text-sm"
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
		fte,
		hours,
	};
	const queryJSONString = JSON.stringify(query);
	const base64Query = Buffer.from(queryJSONString).toString("base64");
	const [
		upsertProject,
		{ data: mutationData, loading: mutationLoading, error: mutationError },
	] = useMutation(UPSERT_PROJECT, { errorPolicy: "all" });
	const handleProjectChange = () => {
		const projectId = JSON.stringify({ selectedProjectId: id });
		router.push(pathname + "/" + encodeURIComponent(projectId));
	};
	const onSubmitUpsert = (e: BaseSyntheticEvent) => {
		const statusCheck = () => {
			if (e.target.checked === true) {
				return "confirmed";
			}
			if (e.target.checked === false) {
				return "unconfirmed";
			}
			if (e.target.id !== "archived") {
				return "archived";
			}
			if (e.target.id === "archived") {
				return "unconfirmed";
			}
		};
		const variables = {
			id: id,
			clientId: clientId,
			name: name,
			status: statusCheck(),
			startsOn: startsOn,
			cost: cost,
			fte:fte,
			hours:hours,
		};
		upsertProject({
			variables: endsOn ? { ...variables, endsOn: endsOn } : variables,
		});
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
						<label className="ml-3 inline-block pl-[0.15rem] hover:cursor-pointer text-gray-900 px-4 py-2 text-sm">
							<input
								className="mr-2 mt-[0.3rem] h-3.5 w-8 appearance-none rounded-[0.4375rem] bg-neutral-300 
																		hover:checked:bg-accentgreen
																		before:pointer-events-none before:absolute before:h-3.5 before:w-3.5 before:rounded-full before:bg-transparent before:content-[''] after:absolute after:z-[2] after:-mt-[0.1875rem] after:h-5 after:w-5 after:rounded-full after:border-none after:bg-neutral-100 after:shadow-[0_0px_3px_0_rgb(0_0_0_/_7%),_0_2px_2px_0_rgb(0_0_0_/_4%)] after:transition-[background-color_0.2s,transform_0.2s] after:content-[''] checked:bg-accentgreen checked:after:absolute checked:after:z-[2] checked:after:-mt-[3px] checked:after:ml-[1.0625rem] checked:after:h-5 checked:after:w-5 checked:after:rounded-full checked:after:border-none checked:after:bg-accentgreen checked:after:shadow-[0_3px_1px_-2px_rgba(0,0,0,0.2),_0_2px_2px_0_rgba(0,0,0,0.14),_0_1px_5px_0_rgba(0,0,0,0.12)] checked:after:transition-[background-color_0.2s,transform_0.2s] checked:after:content-[''] hover:cursor-pointer focus:outline-none focus:ring-0 focus:before:scale-100 focus:before:opacity-[0.12] focus:before:shadow-[3px_-1px_0px_13px_rgba(0,0,0,0.6)] focus:before:transition-[box-shadow_0.2s,transform_0.2s] focus:after:absolute focus:after:z-[1] focus:after:block focus:after:h-5 focus:after:w-5 focus:after:rounded-full focus:after:content-[''] checked:focus:border-accentgreen checked:focus:bg-accentgreen checked:focus:before:ml-[1.0625rem] checked:focus:before:scale-100 checked:focus:before:shadow-[3px_-1px_0px_13px_#3b71ca] checked:focus:before:transition-[box-shadow_0.2s,transform_0.2s] dark:bg-neutral-600 dark:after:bg-neutral-400 dark:checked:bg-accentgreen dark:checked:after:bg-accentgreen dark:focus:before:shadow-[3px_-1px_0px_13px_rgba(255,255,255,0.4)] dark:checked:focus:before:shadow-[3px_-1px_0px_13px_#3b71ca]"
								type="checkbox"
								name="status"
								checked={confirmed}
								onChange={(e) => {
									setConfirmed(!confirmed);
									onSubmitUpsert(e);
								}}
							/>
							{confirmed ? "Confirmed" : "Unconfirmed"}
						</label>
						<Menu.Item>
							{({ active }) => (
								<p
									className={dropdownSelectedItemClass(active)}
									onClick={handleProjectChange}
								>
									View Project Plan
								</p>
							)}
						</Menu.Item>
						<Menu.Item>
							{({ active }) => (
								<Link
								href={`?projectmodal=true&project=${base64Query}`}
								className={dropdownSelectedItemClass(active)}
								>
									Edit Project
								</Link>
							)}
						</Menu.Item>
									<Menu.Item>
										{({ active }) => (
											<a
												href={`?assignmentmodal=true&project=${base64Query}`}
												className={dropdownSelectedItemClass(active)}
											>
												Add Person
											</a>
										)}
									</Menu.Item>
					</div>
					<div
						id={`${project.status}`}
						onClick={onSubmitUpsert}
						className={
							"text-orange-500 block px-4 py-2 text-sm hover:text-accentgreen hover:border-b-2 hover:cursor-pointer hover:border-gray-200"
						}
					>
						{project.status === "archived"
							? "Unarchive Project"
							: "Archive Project"}
					</div>
				</Menu.Items>
			</Transition>
		</Menu>
	);
}
