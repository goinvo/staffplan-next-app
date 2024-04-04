"use client";
import { Fragment, useState } from "react";
import { Menu, Transition } from "@headlessui/react";
import React from "react";
import { useUserDataContext } from "../userDataContext";
import { usePathname } from "next/navigation";
export default function ViewsMenu() {
	const { viewsFilter, setViewsFilter } = useUserDataContext();
	const pathname = usePathname();
	const currentOpenTab = pathname.split("/")[1];
	const handleSortMethodChange = (
		event: React.ChangeEvent<HTMLInputElement>
	) => {
		if (currentOpenTab === "projects") {
			return setViewsFilter({
				...viewsFilter,
				selectedProjectSort: event.target.value,
			});
		}
		if (currentOpenTab === "people") {
			return setViewsFilter({
				...viewsFilter,
				selectedUserSort: event.target.value,
			});
		}
	};
	console.log(pathname.split("/")[1], "views menu concept of path name ");

	const projectSortOptions = () => {
		return (
			<>
				<div>
					<div className="pb-3 border-b-2 border-gray-200">
						<p className={"text-gray-500 block px-4 py-2 text-xs"}>
							Sort Projects
						</p>
						<div>
							<label className="ml-2 text-gray-600">
								<input
									type="radio"
									value="staffingNeeds"
									checked={viewsFilter.selectedProjectSort === "staffingNeeds"}
									onChange={handleSortMethodChange}
									className="mr-2 text-accentgreen focus:ring-accentgreen checked:bg-accentgreen checked:border-transparent"
								/>
								Staffing Needs
							</label>
						</div>
						<div>
							<label className="ml-2 text-gray-600">
								<input
									type="radio"
									value="startDate"
									checked={viewsFilter.selectedProjectSort === "startDate"}
									onChange={handleSortMethodChange}
									className="mr-2 text-accentgreen focus:ring-accentgreen checked:bg-accentgreen checked:border-transparent"
								/>
								Start Date
							</label>
						</div>
						<div>
							<label className="ml-2 text-gray-600">
								<input
									type="radio"
									value="status"
									checked={viewsFilter.selectedProjectSort === "status"}
									onChange={handleSortMethodChange}
									className="mr-2 text-accentgreen focus:ring-accentgreen checked:bg-accentgreen checked:border-transparent"
								/>
								Status
							</label>
						</div>
						<div>
							<label className="ml-2 text-gray-600">
								<input
									type="radio"
									value="abcProjectName"
									checked={viewsFilter.selectedProjectSort === "abcProjectName"}
									onChange={handleSortMethodChange}
									className="mr-2 text-accentgreen focus:ring-accentgreen checked:bg-accentgreen checked:border-transparent"
								/>
								A - Z
							</label>
						</div>
					</div>
				</div>
				<div>
					<label className="block px-4 py-2 text-sm text-gray-600">
						<input
							id="showArchivedProjects"
							type="checkbox"
							defaultChecked={viewsFilter.showArchivedProjects}
							className="w-4 h-4 text-accentgreen bg-gray-100 border-gray-300 rounded focus:accentgreen dark:focus:ring-accentgreen dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-200 dark:border-gray-600 mr-3"
							onClick={() =>
								setViewsFilter({
									...viewsFilter,
									showArchivedProjects: !viewsFilter.showArchivedProjects,
								})
							}
						/>
						Show Archived Projects
					</label>
				</div>
			</>
		);
	};
	const peopleSortOptions = () => {
		return (
			<>
				<div>
					<div className="pb-3 border-b-2 border-gray-200">
						<p className={"text-gray-500 block px-4 py-2 text-xs"}>
							Sort People
						</p>
						<div>
							<label className="ml-2 text-gray-600">
								<input
									type="radio"
									value="userAvailability"
									checked={viewsFilter.selectedUserSort === "userAvailability"}
									onChange={handleSortMethodChange}
									className="mr-2 text-accentgreen focus:ring-accentgreen checked:bg-accentgreen checked:border-transparent"
								/>
								Availability (next 3 months)
							</label>
						</div>
						<div>
							<label className="ml-2 text-gray-600">
								<input
									type="radio"
									value="abcUserName"
									checked={viewsFilter.selectedUserSort === "abcUserName"}
									onChange={handleSortMethodChange}
									className="mr-2 text-accentgreen focus:ring-accentgreen checked:bg-accentgreen checked:border-transparent"
								/>
								A - Z
							</label>
						</div>
						<div>
							<label className="ml-2 text-gray-600">
								<input
									type="radio"
									value="unconfirmedPlans"
									checked={viewsFilter.selectedUserSort === "unconfirmedPlans"}
									onChange={handleSortMethodChange}
									className="mr-2 text-accentgreen focus:ring-accentgreen checked:bg-accentgreen checked:border-transparent"
								/>
								Unconfirmed Plans
							</label>
						</div>
					</div>
				</div>
				{/* <div>
					<label className="block px-4 py-2 text-sm text-gray-600">
						<input
							id="showInactiveUsers"
							type="checkbox"
							defaultChecked={viewsFilter.showInactiveUsers}
							className="w-4 h-4 text-accentgreen bg-gray-100 border-gray-300 rounded focus:accentgreen dark:focus:ring-accentgreen dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-200 dark:border-gray-600 mr-3"
							onClick={() =>
								setViewsFilter({
									...viewsFilter,
									showInactiveUsers: !viewsFilter.showInactiveUsers,
								})
							}
						/>
						Show Inactive People
					</label>
				</div> */}
			</>
		);
	};
	return (
		<Menu
			as="div"
			className="relative inline-block text-left z-50"
			id="views-menu"
			data-testid="views-menu"
		>
			{({ open }) => (
				<>
					<div
						className={
							open
								? "flex items-center border actionbar-bg-accent actionbar-text-accent actionbar-border-accent rounded-full px-5 py-1"
								: "flex items-center border actionbar-border-accent rounded-full px-5 py-1"
						}
					>
						<Menu.Button>Views</Menu.Button>
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
						<Menu.Items className="absolute right-0 z-50 mt-2 w-60 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
							<div className="py-1">
								<div>
									<label className="block px-4 py-2 text-sm border-b-2 border-gray-200 text-gray-600">
										<input
											id="showSummaries"
											type="checkbox"
											defaultChecked={viewsFilter.showSummaries}
											className="w-4 h-4 text-accentgreen bg-gray-100 border-gray-300 rounded focus:accentgreen dark:focus:ring-accentgreen dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-200 dark:border-gray-600 mr-3"
											onClick={() =>
												setViewsFilter({
													...viewsFilter,
													showSummaries: !viewsFilter.showSummaries,
												})
											}
										/>
										Show Summaries
									</label>
								</div>
							</div>
							<div>
								<p className={"text-gray-500 block px-4 py-2 text-xs"}>
									Assignments
								</p>
							</div>
							<div>
								<div
									className="pb-3 pl-4 w-1/2 border-b-2 border-gray-200 flex hover:cursor-pointer"
									id="assignmentSort"
								>
									<div className="flex items-center border actionbar-border-accent rounded-full ">
										<div
											className={
												viewsFilter.assignmentSort === "slim"
													? "actionbar-bg-accent actionbar-text-accent px-4 py-1 rounded-l-full actionbar-border-accent "
													: "px-4 py-1 rounded-l-full actionbar-border-accent "
											}
											onClick={() =>
												setViewsFilter({
													...viewsFilter,
													assignmentSort: "slim",
												})
											}
										>
											Slim
										</div>
										<div
											className={
												viewsFilter.assignmentSort === "wide"
													? "actionbar-bg-accent actionbar-text-accent px-4 py-1 rounded-r-full border-l actionbar-border-accent"
													: "px-4 py-1 rounded-r-full border-l actionbar-border-accent"
											}
											onClick={() =>
												setViewsFilter({
													...viewsFilter,
													assignmentSort: "wide",
												})
											}
										>
											Wide
										</div>
									</div>
								</div>
							</div>
							<div>
								<p className={"text-gray-500 block px-4 py-2 text-xs"}>
									Rollups
								</p>
							</div>
							<div>
								<div
									className="flex pb-3 border-b-2 border-gray-200 pl-4 hover:cursor-pointer"
									id="rollupSort"
								>
									<div className="flex items-center border actionbar-border-accent rounded-full">
										<div
											className={
												viewsFilter.rollupSort === "none"
													? "actionbar-bg-accent actionbar-text-accent px-4 py-1 rounded-l-full actionbar-border-accent "
													: "px-4 py-1 rounded-r-full actionbar-border-accent"
											}
											onClick={() =>
												setViewsFilter({ ...viewsFilter, rollupSort: "none" })
											}
										>
											None
										</div>
										<div
											className={
												viewsFilter.rollupSort === "slim"
													? "actionbar-bg-accent actionbar-text-accent px-4 py-1 actionbar-border-accent "
													: "px-4 py-1 rounded-r-full border-l actionbar-border-accent"
											}
											onClick={() =>
												setViewsFilter({ ...viewsFilter, rollupSort: "slim" })
											}
										>
											Slim
										</div>
										<div
											className={
												viewsFilter.rollupSort === "wide"
													? "actionbar-bg-accent actionbar-text-accent px-4 py-1 rounded-r-full border-l actionbar-border-accent"
													: "px-4 py-1 rounded-r-full border-l actionbar-border-accent"
											}
											onClick={() =>
												setViewsFilter({ ...viewsFilter, rollupSort: "wide" })
											}
										>
											Wide
										</div>
									</div>
								</div>
							</div>
							{currentOpenTab === "projects" ? projectSortOptions() : null}
							{currentOpenTab === "people" ? peopleSortOptions() : null}
						</Menu.Items>
					</Transition>
				</>
			)}
		</Menu>
	);
}
