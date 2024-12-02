import { Fragment } from "react";
import { Menu, Transition } from "@headlessui/react";
import React from "react";
import { EyeIcon } from "@heroicons/react/24/outline";
import { useGeneralDataContext } from "@/app/contexts/generalContext";
import { useProjectsDataContext } from "@/app/contexts/projectsDataContext";
export const SingleProjectSortOptions = () => {
	const { showArchivedAssignments, setShowArchivedAssignments, showSummaries, setShowSummaries } = useGeneralDataContext()
	const { viewsFilterSingleProject, setViewsFilterSingleProject } = useProjectsDataContext()

	const handleSortMethodChange = (
		event: React.ChangeEvent<HTMLInputElement>
	) => {
		return setViewsFilterSingleProject(event.target.value);
	};
	return (
		<>
			<Menu
				as="div"
				className="relative inline-block text-left z-15"
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
							<Menu.Button>
								<div className="flex items-center">
									<div className="h-4 w-4 mr-1">
										<EyeIcon />
									</div>
									<span>Views</span>
								</div>
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
							<Menu.Items className="absolute right-0 z-50 mt-2 w-60 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
								<div className="py-1">
									<div>
										<label className="block px-4 py-2 text-sm border-b-2 border-gray-200 text-gray-600">
											<input
												id="showSummaries"
												type="checkbox"
												defaultChecked={showSummaries}
												className="w-4 h-4 text-accentgreen bg-gray-100 border-gray-300 rounded focus:accentgreen dark:focus:ring-accentgreen dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-200 dark:border-gray-600 mr-3"
												onClick={() => setShowSummaries(!showSummaries)}
											/>
											Show Summaries
										</label>
									</div>
								</div>
								<div>
									<div className="pb-3 border-b-2 border-gray-200">
										<p className={"text-gray-500 block px-4 py-2 text-xs"}>
											Sort Assignments
										</p>
										<div>
											<label className="ml-2 text-gray-600">
												<input
													type="radio"
													value="startDate"
													checked={viewsFilterSingleProject === "startDate"}
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
													checked={viewsFilterSingleProject === "status"}
													onChange={handleSortMethodChange}
													className="mr-2 text-accentgreen focus:ring-accentgreen checked:bg-accentgreen checked:border-transparent"
												/>
												Status
											</label>
										</div>
										<div className="pb-2">
											<label className="ml-2 text-gray-600">
												<input
													type="radio"
													value="abcUserName"
													checked={viewsFilterSingleProject === "abcUserName"}
													onChange={handleSortMethodChange}
													className="mr-2 text-accentgreen focus:ring-accentgreen checked:bg-accentgreen checked:border-transparent"
												/>
												A - Z
											</label>
										</div>
										{/* <div className="border-t-2 border-gray-200">
											<label className="block px-4 py-2 text-sm text-gray-600">
												<input
													id="showArchivedProjects"
													type="checkbox"
													defaultChecked={showArchivedAssignments}
													className="w-4 h-4 text-accentgreen bg-gray-100 border-gray-300 rounded focus:accentgreen dark:focus:ring-accentgreen dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-200 dark:border-gray-600 mr-3"
													onClick={() => setShowArchivedAssignments(!showArchivedAssignments)}
												/>
												Show Archived Assignments
											</label>
										</div> */}
									</div>
								</div>
							</Menu.Items>
						</Transition>
					</>
				)}
			</Menu>
		</>
	);
};
