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
			description
			id
			name
			projects {
				id
				name
			}
			status
		}
	}
`;

const UPSERT_PROJECT = gql`
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
			assignedUser {
				id
			}
		}
	}
`;

export interface ClientType {
	description: string;
	id: number | null;
	name: string;
}
export interface ProjectType {
	endsOn: string | null;
	id: number | null;
	name: string;
	paymentFrequency: string;
	startsOn: string | null;
	status: string;
	users: [];
}

export interface ProjectValuesType {
	endsOn: string;
	hours: number;
	name: string;
	numOfFTE: string;
	numOfWeeks: string;
	startsOn: string;
	paymentFrequency: string;
}

const AddProject = () => {
	const [clientSide, setClientSide] = useState(false);
	const [projectValues, setProjectValues] = useState<ProjectValuesType>({
		endsOn: "",
		hours: 0,
		name: "",
		numOfFTE: "",
		numOfWeeks: "",
		startsOn: "",
		paymentFrequency: "flatRate",
	});
	useEffect(() => {
		setClientSide(true);
	}, []);
	const searchParams = useSearchParams();
	const pathName = usePathname();
	const showModal = searchParams.get("projectmodal");
	const [selectedClient, setSelectedClient] = useState<ClientType>({
		id: null,
		description: "",
		name: "Select One",
	});
	const handleClientSelect = (selectedClient: ClientType) => {
		setSelectedClient(selectedClient);
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
		upsertProject,
		{ data: mutationData, loading: mutationLoading, error: mutationError },
	] = useMutation(UPSERT_PROJECT);
	if (loading || mutationLoading) return <p> LOADING ASSIGNMENTS</p>;
	if (error || mutationError) return <p>ERROR ASSIGNMENTS</p>;

	const calculateHours = () => {
		const weeklyFTECost = 38 * parseFloat(projectValues.numOfFTE);
		const totalHours = parseInt(projectValues.numOfWeeks) * weeklyFTECost;
		setProjectValues({ ...projectValues, hours: totalHours });
	};

	const handleSubmit = () => {
		console.log("submit clicked");
	};
	interface TargetType {
		target: {
			value: string;
			id: string;
		};
	}
	const handleFTEChange = ({ target: { value } }: TargetType) => {
		setProjectValues({ ...projectValues, numOfFTE: value });
	};
	const handleNumWeeksChange = ({ target: { value } }: TargetType) => {
		setProjectValues({ ...projectValues, numOfWeeks: value });
	};
	const handlePaymentFrequencyChange = ({ target: { id } }: TargetType) => {
		setProjectValues({ ...projectValues, paymentFrequency: id });
	};
	return (
		<>
			{showModal && (
				<div
					className="relative z-10"
					aria-labelledby="project-modal"
					role="dialog"
					aria-modal="true"
				>
					<div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
					<div className="fixed inset-0 z-10 w-screen overflow-y-auto">
						<div className="flex min-h-full p-4 text-center justify-center sm:items-center sm:p-0">
							<div className="relative transform overflow-hidden w-1/2 rounded-xl bg-white text-left shadow-xl transition-all">
								<div className="bg-white p-10">
									<div className="sm:flex-auto">
										<div>
											<form className="max-w-lg mx-auto">
												{/* section 1 */}
												<div className="flex mb-4 pb-2 border-b-4">
													<div className="w-1/3 mr-4 flex flex-col">
														<label htmlFor="projectName">Name(*required)</label>
														<input
															name="projectName"
															value={projectValues.name}
															onChange={(e) =>
																setProjectValues({
																	...projectValues,
																	name: e.target.value,
																})
															}
															className="block mt-1 px-4 py-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
															placeholder="Enter Name"
														/>
													</div>
													<div className="w-1/3 mr-4 flex flex-col">
														<Listbox
															value={selectedClient}
															onChange={handleClientSelect}
														>
															{({ open }) => (
																<>
																	<label className="block text-sm font-medium leading-6 text-gray-900">
																		Client(*required)
																	</label>
																	<div className="relative mt-2">
																		<Listbox.Button className="relative cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm sm:leading-6">
																			<span className="flex items-center">
																				<span className="ml-3 block truncate">
																					{selectedClient.name}
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
																				(client: ClientType) => {
																					return (
																						<Listbox.Option
																							key={`${client.id} + ${client.name}`}
																							className={({ active }) =>
																								active
																									? "bg-indigo-600 text-white"
																									: "text-gray-900 relative cursor-default select-none py-2 pl-3 pr-9"
																							}
																							value={client}
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
																											{client.name}
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
																					);
																				}
																			)}
																		</Listbox.Options>
																	</Transition>
																</>
															)}
														</Listbox>
													</div>
													<div className="mr-2 flex items-center">
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
												</div>
												{/* section 2 */}
												<div className="flex mb-4 pb-2 border-b-4">
													<div className="w-1/5 mr-4 flex flex-col">
														<ProjectDatepicker
															setProjectModalDates={setProjectValues}
															modalSource={"addProject"}
														/>
													</div>
												</div>
												{/* section 3 */}
												<div className="flex mb-4 pb-2 border-b-4 space-x-10">
													<div className="w-1/5 mr-4 flex flex-col">
														<label
															htmlFor="fte"
															className="block font-medium text-gray-900"
														>
															FTE
														</label>
														<input
															type="number"
															min="1"
															max="100"
															step="0.5"
															name="fte"
															id="fte"
															autoComplete="fte"
															className="block w-full mt-1 px-4 py-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
															placeholder="1.0"
															onChange={(e) => handleFTEChange(e)}
															value={projectValues.numOfFTE}
														/>
													</div>
													<div className="w-1/5 mr-4 flex flex-col">
														<label
															htmlFor="numOfWeeks"
															className="block font-medium text-gray-900"
														>
															# of Weeks
														</label>
														<input
															type="number"
															min="1"
															max="999"
															name="numOfWeeks"
															id="numOfWeeks"
															autoComplete="numOfWeeks"
															className="block w-full mt-1 px-4 py-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
															placeholder="1"
															onChange={(e) => handleNumWeeksChange(e)}
															value={projectValues.numOfWeeks}
														/>
													</div>
													<div className="w-1/5 flex flex-col">
														<label
															htmlFor="hours"
															className="block font-medium text-gray-900"
														>
															Total Hours
														</label>
														<input
															type="number"
															name="hours"
															id="hours"
															autoComplete="hours"
															className="block w-full mt-1 px-4 py-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
															placeholder=""
															value={projectValues.hours}
															readOnly
														/>
														<span onClick={() => calculateHours()}>
															Recalculate Hours
														</span>
													</div>
												</div>
												{/* Section 4 */}
												<div className="flex mb-4 pb-2 border-b-4">
													<div className="w-1/3 mr-3 flex flex-col">
														<div className="block">
															<label>
																<input
																	type="radio"
																	name="flatRate"
																	id="flatRate"
																	checked={
																		projectValues.paymentFrequency ===
																		"flatRate"
																	}
																	onChange={handlePaymentFrequencyChange}
																/>
																Flat Rate
															</label>
														</div>
														<div className="block">
															<label>
																<input
																	name="hourlyRate"
																	id="hourlyRate"
																	checked={
																		projectValues.paymentFrequency ===
																		"hourlyRate"
																	}
																	type="radio"
																	onChange={handlePaymentFrequencyChange}
																/>
																Hourly Rate
															</label>
														</div>
													</div>
													<div className="w-1/3 mr-4 flex">
														<label>
															<span className="relative">
																<span className="absolute inset-y-0 left-0 pl-3 pb-5 flex items-center pointer-events-none">
																	$
																</span>
																<input
																	className="w-full max-w-xs block mt-1 mr-3 pl-6 px-4 py-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
																	placeholder="0"
																/>
															</span>
															Rate($/hr)
														</label>
														<label>
															<span className="relative">
																<span className="absolute inset-y-0 left-0 pl-3 pb-5 flex items-center pointer-events-none">
																	$
																</span>
																<input
																	className="w-full max-w-xs block mt-1 mr-3 pl-6 px-4 py-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
																	placeholder="0"
																/>
															</span>
															Value(k$)
														</label>
													</div>
												</div>
												{/* section 5 */}
												<div className="flex mb-4 justify-between">
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
															Save
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
export default withApollo(AddProject);
