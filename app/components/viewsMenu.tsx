"use client";
import { Fragment, useState } from "react";
import { Menu, Transition } from "@headlessui/react";
import React from "react";

export default function ViewsMenu() {
	const [selectedProjectSort, setSelectedProjectSort] =
		useState<string>("staffingNeeds");
	const [assignmentSort, setAssignmentSort] = useState<string>("slim");
	const [rollupSort, setRollupSort] = useState<string>("none");
	const [showSummaries, setShowSummaries] = useState<boolean>(false);
	const [showArchivedProjects, setShowArchivedProjects] =
		useState<boolean>(false);
	const handleProjectSortChange = (
		event: React.ChangeEvent<HTMLInputElement>
	) => {
		setSelectedProjectSort(event.target.value);
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
					<div className={open ? "flex items-center border actionbar-bg-accent actionbar-text-accent actionbar-border-accent rounded-full px-5 py-1" : "flex items-center border actionbar-border-accent rounded-full px-5 py-1"}>
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
											type="checkbox"
											className="w-4 h-4 text-accentgreen bg-gray-100 border-gray-300 rounded focus:accentgreen dark:focus:ring-accentgreen dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-200 dark:border-gray-600 mr-3"
											onClick={() => setShowSummaries(!showSummaries)}
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
								<div className="pb-3 pl-4 w-1/2 border-b-2 border-gray-200 flex">
									<div className="flex items-center border actionbar-border-accent rounded-full ">
										<div
											className={
												assignmentSort === "slim"
													? "actionbar-bg-accent actionbar-text-accent px-4 py-1 rounded-l-full actionbar-border-accent "
													: "px-4 py-1 rounded-l-full actionbar-border-accent "
											}
											onClick={() => setAssignmentSort("slim")}
										>
											Slim
										</div>
										<div
											className={
												assignmentSort === "wide"
													? "actionbar-bg-accent actionbar-text-accent px-4 py-1 rounded-r-full border-l actionbar-border-accent"
													: "px-4 py-1 rounded-r-full border-l actionbar-border-accent"
											}
											onClick={() => setAssignmentSort("wide")}
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
								<div className="flex pb-3 border-b-2 border-gray-200 pl-4">
									<div className="flex items-center border actionbar-border-accent rounded-full">
										<div
											className={
												rollupSort === "none"
													? "actionbar-bg-accent actionbar-text-accent px-4 py-1 rounded-l-full actionbar-border-accent "
													: "px-4 py-1 rounded-r-full actionbar-border-accent"
											}
											onClick={() => setRollupSort("none")}
										>
											None
										</div>
										<div
											className={
												rollupSort === "slim"
													? "actionbar-bg-accent actionbar-text-accent px-4 py-1 actionbar-border-accent "
													: "px-4 py-1 rounded-r-full border-l actionbar-border-accent"
											}
											onClick={() => setRollupSort("slim")}
										>
											Slim
										</div>
										<div
											className={
												rollupSort === "wide"
													? "actionbar-bg-accent actionbar-text-accent px-4 py-1 rounded-r-full border-l actionbar-border-accent"
													: "px-4 py-1 rounded-r-full border-l actionbar-border-accent"
											}
											onClick={() => setRollupSort("wide")}
										>
											Wide
										</div>
									</div>
								</div>
							</div>
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
												checked={selectedProjectSort === "staffingNeeds"}
												onChange={handleProjectSortChange}
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
												checked={selectedProjectSort === "startDate"}
												onChange={handleProjectSortChange}
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
												checked={selectedProjectSort === "status"}
												onChange={handleProjectSortChange}
												className="mr-2 text-accentgreen focus:ring-accentgreen checked:bg-accentgreen checked:border-transparent"
											/>
											Status
										</label>
									</div>
									<div>
										<label className="ml-2 text-gray-600">
											<input
												type="radio"
												value="abc"
												checked={selectedProjectSort === "abc"}
												onChange={handleProjectSortChange}
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
										type="checkbox"
										className="w-4 h-4 text-accentgreen bg-gray-100 border-gray-300 rounded focus:accentgreen dark:focus:ring-accentgreen dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-200 dark:border-gray-600 mr-3"
										onClick={() =>
											setShowArchivedProjects(!showArchivedProjects)
										}
									/>
									Show Archived Projects
								</label>
							</div>
						</Menu.Items>
					</Transition>
				</>
			)}
		</Menu>
	);
}