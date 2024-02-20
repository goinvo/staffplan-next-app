"use client";
import { useState, Fragment } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { CheckIcon, ChevronDownIcon } from "@heroicons/react/20/solid";
import ProjectDatepicker from "./projectDatepicker";

const people = [
	{
		id: 1,
		name: "Wade Cooper",
		avatar:
			"https://images.unsplash.com/photo-1491528323818-fdd1faba62cc?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
	},
	{
		id: 2,
		name: "Arlene Mccoy",
		avatar:
			"https://images.unsplash.com/photo-1550525811-e5869dd03032?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
	},
	{
		id: 3,
		name: "Devon Webb",
		avatar:
			"https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2.25&w=256&h=256&q=80",
	},
	{
		id: 4,
		name: "Tom Cook",
		avatar:
			"https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
	},
	{
		id: 5,
		name: "Tanya Fox",
		avatar:
			"https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
	},
	{
		id: 6,
		name: "Hellen Schmidt",
		avatar:
			"https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
	},
	{
		id: 7,
		name: "Caroline Schultz",
		avatar:
			"https://images.unsplash.com/photo-1568409938619-12e139227838?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
	},
	{
		id: 8,
		name: "Mason Heaney",
		avatar:
			"https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
	},
	{
		id: 9,
		name: "Claudie Smitham",
		avatar:
			"https://images.unsplash.com/photo-1584486520270-19eca1efcce5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
	},
	{
		id: 10,
		name: "Emil Schaefer",
		avatar:
			"https://images.unsplash.com/photo-1561505457-3bcad021f8ee?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
	},
];
const project = [
	{
		id: 1,
		name: "Project 1",
		startDate: "2024-01-01",
		endDate: "2024-01-31",
	},
	{
		id: 2,
		name: "Project 2",
		startDate: "2024-02-02",
		endDate: "2024-02-26",
	},
	{
		id: 3,
		name: "Project 3",
		startDate: "2024-02-02",
		endDate: "2024-02-26",
	},
	{
		id: 4,
		name: "Project 4",
		startDate: "2024-02-02",
		endDate: "2024-02-26",
	},
	{
		id: 5,
		name: "Project 5",
		startDate: "2024-02-02",
		endDate: "2024-02-26",
	},
	{
		id: 6,
		name: "Project 6",
		startDate: "2024-02-02",
		endDate: "2024-02-26",
	},
	{
		id: 7,
		name: "Project 7",
		startDate: "2024-02-02",
		endDate: "2024-02-26",
	},
	{
		id: 8,
		name: "Project 8",
		startDate: "2024-02-02",
		endDate: "2024-02-26",
	},
	{
		id: 9,
		name: "Project 9",
		startDate: "2024-02-02",
		endDate: "2024-02-26",
	},
	{
		id: 10,
		name: "Project 10",
		startDate: "2024-02-02",
		endDate: "2024-02-26",
	},
];
interface SelectedProject {
	id: number;
	name: string;
	startDate: string;
	endDate: string;
}
export default function AddAssignment() {
	const [selectedPerson, setSelectedPerson] = useState(people[3]);
	const [selectedProject, setSelectedProject] = useState(project[1]);
	const handleProjectSelect = (selectedProject: SelectedProject) => {
		setSelectedProject(selectedProject);
	};
	return (
		<div>
			<form className="max-w-lg mx-auto">
				<div className="flex mb-4">
					<Listbox value={selectedPerson} onChange={setSelectedPerson}>
						{({ open }) => (
							<>
								<div className="w-1/2 mr-2">
									<Listbox.Label className="block text-sm font-medium leading-6 text-gray-900">
										Person
									</Listbox.Label>
									<div className="relative mt-2">
										<Listbox.Button className="relative cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm sm:leading-6">
											<span className="flex items-center">
												<span className="ml-3 block truncate">
													{selectedPerson.name}
												</span>
											</span>
											<span className="pointer-events-none absolute inset-y-0 right-0 ml-3 flex items-center pr-2">
												<ChevronDownIcon
													className="h-5 w-5 text-gray-400"
													aria-hidden="true"
												/>
											</span>
										</Listbox.Button>
									</div>

									<Transition
										show={open}
										as={Fragment}
										leave="transition ease-in duration-100"
										leaveFrom="opacity-100"
										leaveTo="opacity-0"
									>
										<Listbox.Options className="absolute z-10 mt-1 max-h-56 overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
											{people.map((person) => (
												<Listbox.Option
													key={person.id}
													className={({ active }) =>
														active
															? "bg-indigo-600 text-white"
															: "text-gray-900 relative cursor-default select-none py-2 pl-3 pr-9"
													}
													value={person}
												>
													{({ selected, active }) => (
														<>
															<div className="flex items-center">
																<span
																	className={
																		selected
																			? "font-semibold"
																			: "font-normal ml-3 block truncate"
																	}
																>
																	{person.name}
																</span>
															</div>

															{selected ? (
																<span
																	className={
																		active
																			? "text-white"
																			: "text-indigo-600 absolute inset-y-0 right-0 flex items-center pr-4"
																	}
																>
																	<CheckIcon
																		className="h-5 w-5"
																		aria-hidden="true"
																	/>
																</span>
															) : null}
														</>
													)}
												</Listbox.Option>
											))}
										</Listbox.Options>
									</Transition>
								</div>
							</>
						)}
					</Listbox>
					<Listbox value={selectedProject} onChange={handleProjectSelect}>
						{({ open }) => (
							<>
								<div className="w-1/2 mr-2">
									<Listbox.Label className="block text-sm font-medium leading-6 text-gray-900">
										On Project
									</Listbox.Label>
									<div className="relative mt-2">
										<Listbox.Button className="relative cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm sm:leading-6">
											<span className="flex items-center">
												<span className="ml-3 block truncate">
													{selectedProject.id}
												</span>
											</span>
											<span className="pointer-events-none absolute inset-y-0 right-0 ml-3 flex items-center pr-2">
												<ChevronDownIcon
													className="h-5 w-5 text-gray-400"
													aria-hidden="true"
												/>
											</span>
										</Listbox.Button>
									</div>

									<Transition
										show={open}
										as={Fragment}
										leave="transition ease-in duration-100"
										leaveFrom="opacity-100"
										leaveTo="opacity-0"
									>
										<Listbox.Options className="absolute z-10 mt-1 max-h-56 overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
											{project.map((project) => (
												<Listbox.Option
													key={project.id}
													className={({ active }) =>
														active
															? "bg-indigo-600 text-white"
															: "text-gray-900 relative cursor-default select-none py-2 pl-3 pr-9"
													}
													value={project}
												>
													{({ selected, active }) => (
														<>
															<div className="flex items-center">
																<span
																	className={
																		selected
																			? "font-semibold"
																			: "font-normal ml-3 block truncate"
																	}
																>
																	{project.id}
																</span>
															</div>

															{selected ? (
																<span
																	className={
																		active
																			? "text-white"
																			: "text-indigo-600 absolute inset-y-0 right-0 flex items-center pr-4"
																	}
																>
																	<CheckIcon
																		className="h-5 w-5"
																		aria-hidden="true"
																	/>
																</span>
															) : null}
														</>
													)}
												</Listbox.Option>
											))}
										</Listbox.Options>
									</Transition>
								</div>
							</>
						)}
					</Listbox>
				</div>

				<div className="flex">
					<div className="border-b border-gray-900/10 pb-12">
						<div className="mt-10 grid grid-cols-1 gap-x-5 gap-y-8 sm:grid-cols-10">
							<div className="sm:col-span-1">
								<label
									htmlFor="hoursperweek"
									className="block text-sm font-medium leading-6 text-gray-900"
								>
									Hours/Week
								</label>
								<div className="mt-2">
									<div className="rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 sm:max-w-md">
										<input
											type="number"
											min="1"
											name="hoursperweek"
											id="hoursperweek"
											autoComplete="hoursperweek"
											className="block flex-1 border-0 bg-transparent py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
											placeholder="40"
										/>
									</div>
								</div>
							</div>
						</div>
					</div>
					<ProjectDatepicker projectDates={selectedProject} />
				</div>

				<div className="flex mb-4 justify-between">
					<div className="mr-2">
						<input
							className="mr-2 mt-[0.3rem] h-3.5 w-8 appearance-none rounded-[0.4375rem] bg-neutral-300 before:pointer-events-none before:absolute before:h-3.5 before:w-3.5 before:rounded-full before:bg-transparent before:content-[''] after:absolute after:z-[2] after:-mt-[0.1875rem] after:h-5 after:w-5 after:rounded-full after:border-none after:bg-neutral-100 after:shadow-[0_0px_3px_0_rgb(0_0_0_/_7%),_0_2px_2px_0_rgb(0_0_0_/_4%)] after:transition-[background-color_0.2s,transform_0.2s] after:content-[''] checked:bg-primary checked:after:absolute checked:after:z-[2] checked:after:-mt-[3px] checked:after:ml-[1.0625rem] checked:after:h-5 checked:after:w-5 checked:after:rounded-full checked:after:border-none checked:after:bg-primary checked:after:shadow-[0_3px_1px_-2px_rgba(0,0,0,0.2),_0_2px_2px_0_rgba(0,0,0,0.14),_0_1px_5px_0_rgba(0,0,0,0.12)] checked:after:transition-[background-color_0.2s,transform_0.2s] checked:after:content-[''] hover:cursor-pointer focus:outline-none focus:ring-0 focus:before:scale-100 focus:before:opacity-[0.12] focus:before:shadow-[3px_-1px_0px_13px_rgba(0,0,0,0.6)] focus:before:transition-[box-shadow_0.2s,transform_0.2s] focus:after:absolute focus:after:z-[1] focus:after:block focus:after:h-5 focus:after:w-5 focus:after:rounded-full focus:after:content-[''] checked:focus:border-primary checked:focus:bg-primary checked:focus:before:ml-[1.0625rem] checked:focus:before:scale-100 checked:focus:before:shadow-[3px_-1px_0px_13px_#3b71ca] checked:focus:before:transition-[box-shadow_0.2s,transform_0.2s] dark:bg-neutral-600 dark:after:bg-neutral-400 dark:checked:bg-primary dark:checked:after:bg-primary dark:focus:before:shadow-[3px_-1px_0px_13px_rgba(255,255,255,0.4)] dark:checked:focus:before:shadow-[3px_-1px_0px_13px_#3b71ca]"
							type="checkbox"
							role="switch"
							id="flexSwitchCheckDefault"
						/>
						<label
							className="inline-block pl-[0.15rem] hover:cursor-pointer"
							htmlFor="flexSwitchCheckDefault"
						>
							Unconfirmed
						</label>
					</div>
					<div className="mr-2">
						<button
							type="button"
							className="p-2 text-sm font-semibold leading-6 text-gray-900"
						>
							Cancel
						</button>
						<button
							type="submit"
							className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
						>
							Assign
						</button>
					</div>
				</div>
			</form>
		</div>
	);
}
