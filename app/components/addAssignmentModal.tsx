"use client";
import { useState, Fragment, useEffect } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { CheckIcon, ChevronDownIcon } from "@heroicons/react/20/solid";
import ProjectDatepicker from "./projectDatepicker";
import Link from "next/link";
import { useSearchParams, usePathname } from "next/navigation";
import { gql, useQuery, useMutation } from "@apollo/client";
import withApollo from "@/lib/withApollo";

const GET_DATA = gql`
	{
		clients {
			id
			projects {
				id
				name
				status
				paymentFrequency
				startsOn
				endsOn
				users {
					id
					name
					companies {
						name
					}
				}
			}
		}
		users {
			id
			name
		}
	}
`;

const UPSERT_ASSIGNMENT = gql`
	mutation UpsertAssignment(
		$id: ID
		$projectId: ID!
		$userId: ID!
		$status: String!
		$startsOn: ISO8601Date
		$endsOn: ISO8601Date
	) {
		upsertAssignment(
			id: $id
			projectId: $projectId
			userId: $userId
			status: $status
			startsOn: $startsOn
			endsOn: $endsOn
		) {
			project {
				id
			}
			startsOn
			endsOn
			status
			user {
				id
			}
		}
	}
`;

export interface ProjectType {
	id: number | null;
	paymentFrequency: string;
	name: string;
	status: string;
	users: [];
	startsOn: string | null;
	endsOn: string | null;
}
export interface UserType {
	id: number | null;
	name: string;
}

const AddAssignment = () => {
	const [clientSide, setClientSide] = useState(false);
	useEffect(() => {
		setClientSide(true);
	}, []);
	const searchParams = useSearchParams();
	const pathName = usePathname();
	const showModal = searchParams.get("modal");
	const [selectedUser, setSelectedUser] = useState<UserType>({id:null,name:"Select"});
	const [selectedProject, setSelectedProject] =
		useState<ProjectType>({id:null, paymentFrequency:"",name:"Select",status:"",users:[], startsOn:null, endsOn:null});
	const handleProjectSelect = (selectedProject: ProjectType) => {
		setSelectedProject(selectedProject);
	};
	const { loading, error, data } = useQuery(GET_DATA, {
		context: {
			headers: {
				cookie: clientSide ? document.cookie : null,
			},
		},
		skip: !clientSide,
		errorPolicy: "all",
	});
	const [
		upsertAssignment,
		{ data: mutationData, loading: mutationLoading, error: mutationError },
	] = useMutation(UPSERT_ASSIGNMENT);
	if (loading || mutationLoading) return <p> LOADING ASSIGNMENTS</p>;
	if (error || mutationError) return <p>ERROR ASSIGNMENTS</p>;
	const handleSubmit = () => {
		upsertAssignment({
			variables: {
				projectId: selectedProject.id,
				userId: selectedUser.id,
				status: selectedProject.status,
				startsOn: selectedProject.startsOn,
				endsOn: selectedProject.endsOn,
			},
		});
	};
	return (
		<>
			{showModal && (
				<div
					className="relative z-10"
					aria-labelledby="modal-title"
					role="dialog"
					aria-modal="true"
				>
					<div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>

					<div className="fixed inset-0 z-10 w-screen overflow-y-auto">
						<div className="flex min-h-full p-4 text-center justify-center sm:items-center sm:p-0">
							<div className="relative transform overflow-hidden w-1/2 rounded-xl bg-white text-left shadow-xl transition-all">
								<div className="bg-white p-10">
									<div className="sm:flex-auto ">
										<div>
											<form className="max-w-lg mx-auto">
												<div className="flex mb-4">
													<Listbox
														value={selectedUser}
														onChange={setSelectedUser}
													>
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
																					{selectedUser.name}
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
																			{data?.users?.map(
																				(user: UserType) => (
																					<Listbox.Option
																						key={user.id}
																						className={({ active }) =>
																							active
																								? "bg-indigo-600 text-white"
																								: "text-gray-900 relative cursor-default select-none py-2 pl-3 pr-9"
																						}
																						value={user}
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
																										{user.name}
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
																				)
																			)}
																		</Listbox.Options>
																	</Transition>
																</div>
															</>
														)}
													</Listbox>
													<Listbox
														value={selectedProject}
														onChange={handleProjectSelect}
													>
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
																					{selectedProject.name}
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
																			{data?.clients?.map(
																				(client: {
																					projects: ProjectType[];
																				}) => {
																					return client.projects.map(
																						(project: ProjectType) => (
																							<Listbox.Option
																								key={`${project.id} + ${project.name}`}
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
																												{project.name}
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
																						)
																					);
																				}
																			)}
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
													<ProjectDatepicker
														selectedProject={selectedProject}
														setDates={setSelectedProject}
													/>
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
														<Link
															href={pathName}
															type="button"
															className="p-2 text-sm font-semibold leading-6 text-gray-900"
														>
															Cancel
														</Link>
														<Link
															href={pathName}
															type="submit"
															className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
															onClick={handleSubmit}
														>
															Assign
														</Link>
													</div>
												</div>
											</form>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			)}
		</>
	);
};
export default withApollo(AddAssignment);
