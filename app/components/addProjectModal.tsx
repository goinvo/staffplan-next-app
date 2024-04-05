"use client";
import { useState } from "react";
import ProjectDatepicker from "./projectDatepicker";
import { useSearchParams, useRouter } from "next/navigation";
import { useMutation } from "@apollo/client";
import withApollo from "@/lib/withApollo";
import { Field, Formik, FormikValues } from "formik";
import { ClientType, ProjectType } from "../typeInterfaces";
import { UPSERT_PROJECT } from "../gqlQueries";
import { differenceInBusinessDays } from "date-fns";
import { Dialog } from "@headlessui/react";
import { ReactNode } from "react";
import { useUserDataContext } from "../userDataContext";
import { LoadingSpinner } from "./loadingSpinner";
import { parse } from "path";

const AddProject = () => {
	const [selectedClient, setSelectedClient] = useState<number | string>("");
	const router = useRouter();
	const searchParams = useSearchParams();
	const modalParam = searchParams.get("projectmodal");
	const projectInParam = searchParams.get("project");
	const { projectList, setProjectList, clientList } = useUserDataContext();
	const decodeQuery = projectInParam
		? Buffer.from(projectInParam, "base64").toString()
		: "";
	const parsedProject = decodeQuery ? JSON.parse(decodeQuery) : "";
	const editProjectInitialValues = {
		id: parsedProject.id,
		client: parsedProject.clientId,
		dates: {
			endsOn: parsedProject.endsOn ? parsedProject.endsOn : "",
			startsOn: parsedProject.startsOn,
		},
		hours: parsedProject.hours ? parsedProject.hours : 0,
		name: parsedProject.name,
		numOfFTE: parsedProject.fte ? parsedProject.fte : "",
		payRate: "flatRate",
		cost: parsedProject.cost,
		status: parsedProject.status === "confirmed" ? true : false,
		hourlyRate: 0,
		flatRate: 0,
	};
	const newProjectInitialValues = {
		client: "",
		cost: 0,
		dates: { endsOn: "", startsOn: "" },
		flatRate: 0,
		hourlyRate: 0,
		hours: 0,
		name: "",
		numOfFTE: "",
		payRate: "flatRate",
		status: false,
	};
	const initialValues = parsedProject
		? editProjectInitialValues
		: newProjectInitialValues;

	const showModal = modalParam ? true : false;
	const [upsertProject] = useMutation(UPSERT_PROJECT, {
		errorPolicy: "all",
		onCompleted({ upsertProject }) {
			const projectToUpdate = projectList.find(
				(project) => project.id === upsertProject.id
			);
			if (projectToUpdate) {
				const updatedProjectList = projectList.map((project) => {
					if (project.id === upsertProject.id) return upsertProject;
					return project;
				});
				return setProjectList(updatedProjectList);
			}

			setProjectList([...projectList, upsertProject]);
		},
	});

	const onSubmitUpsert = (values: FormikValues) => {
		const variables = {
			id: values.id,
			clientId: values.client,
			name: values.name,
			status: values.status ? "confirmed" : "unconfirmed",
			startsOn: values.dates.startsOn,
			cost: values.cost,
			fte:values.numOfFTE,
			hours: values.hours,
		};
		upsertProject({
			variables: values.dates.endsOn
				? { ...variables, endsOn: values.dates.endsOn }
				: variables,
		}).then(() => router.back());
	};
	const onCancel = () => router.back();
	const validateForm = (values: FormikValues) => {
		const errors: Partial<Record<keyof FormikValues, string | {}>> = {};
		if (!values.client) {
			errors.client = "Client is required";
		}
		if (values.client) {
			const foundClient = clientList?.find(
				({ id }: ClientType) => id === values.client
			);
			if (!foundClient) {
				errors.client = "Must select a valid Client";
			}
		}
		if (!values.name) {
			errors.name = "Project Name is required";
		}
		if (values.name && selectedClient) {
			const currentClient = clientList.find((client: ClientType) => {
				if (client.id === selectedClient) return client;
			});
			const projectNameExists = projectList?.find((project: ProjectType) => {
				if (
					project.name === values.name &&
					currentClient?.id === project.client.id
				) {
					return project;
				}
			});
			if (projectNameExists) {
				errors.name = "Project name already in use";
			}
		}
		if (!values.dates.startsOn) {
			errors.dates = { endsOn: "Start date is required" };
		}
		if (values.dates) {
			const startDate = new Date(values.dates.startsOn);
			const endDate = new Date(values.dates.endsOn);
			if (startDate > endDate) {
				errors.dates = { endsOn: "Start must be before end" };
			}
			if (startDate.toString() === "Invalid Date") {
				errors.dates = { endsOn: "Must select start date" };
			}
		}
		if (values.payRate === "flatRate" && values.cost < 1) {
			errors.payRate = "Set the total cost";
		}
		return errors;
	};
	const setTotalCost = (
		event: React.ChangeEvent<HTMLInputElement>,
		values: FormikValues,
		setFieldValue: <ValueType = FormikValues>(
			field: string,
			value: ValueType,
			shouldValidate?: boolean
		) => void
	) => {
		if (values.payRate === "hourlyRate") {
			setFieldValue("cost", parseInt(event.target.value) * values.hours);
		}
	};
	const calculateHours = (
		event: React.ChangeEvent<HTMLInputElement>,
		values: FormikValues,
		setFieldValue: <ValueType = FormikValues>(
			field: string,
			value: ValueType,
			shouldValidate?: boolean
		) => void
	) => {
		if (values.dates.startsOn && values.dates.endsOn) {
			const weeklyFTEHours = 38 * parseFloat(event.target.value);
			const hoursPerDay = weeklyFTEHours / 5;
			const businessDays = differenceInBusinessDays(
				values.dates.endsOn,
				values.dates.startsOn
			);
			const totalHours = Math.round(hoursPerDay * businessDays);
			setFieldValue("hours", totalHours);
		}
	};
	const handleManualHours = (
		event: React.ChangeEvent<HTMLInputElement>,
		values: FormikValues,
		setFieldValue: <ValueType = FormikValues>(
			field: string,
			value: ValueType,
			shouldValidate?: boolean
		) => void
	) => {
		if (
			values.hourlyRate > 0 &&
			values.payRate === "hourlyRate" &&
			!values.dates.endsOn
		) {
			const totalCost = parseInt(event.target.value) * values.hourlyRate;
			setFieldValue("cost", totalCost);
		}
	};
	if (!clientList || !projectList) return <LoadingSpinner />;
	return (
		<>
			{showModal && (
				<Dialog
					open={showModal}
					onClose={onCancel}
					className="relative z-50"
					aria-labelledby="project-modal"
					aria-modal="true"
				>
					<div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
					<div className="fixed inset-0 z-10 w-screen overflow-y-auto">
						<div className="flex min-h-full p-4 text-center justify-center sm:items-center sm:p-0">
							<div className="relative transform overflow-hidden w-1/2 rounded-xl bg-white text-left shadow-xl transition-all">
								<div className="bg-white p-10">
									<div className="sm:flex-auto">
										<div>
											<Formik
												onSubmit={(e) => {
													onSubmitUpsert(e);
												}}
												initialValues={initialValues}
												validate={validateForm}
											>
												{({
													handleSubmit,
													handleChange,
													values,
													setErrors,
													handleBlur,
													errors,
													touched,
													isValid,
													setFieldValue,
												}) => (
													<form
														onSubmit={handleSubmit}
														className="max-w-lg mx-auto"
													>
														{/* section 1 */}
														<div className="flex mb-4 pb-2 border-b-4">
															<div className="w-1/2 -mr-1 flex flex-col">
																<label htmlFor="projectName">
																	Name(*required)
																	<input
																		autoComplete="off"
																		id="projectName"
																		name="name"
																		value={values.name}
																		onBlur={handleBlur}
																		onChange={handleChange}
																		className="block mt-1 px-4 py-2 border rounded-md shadow-sm focus:ring-accentgreen focus:border-accentgreen sm:text-sm"
																		placeholder="Enter Name"
																	/>
																</label>
															</div>
															<div className="w-1/4 mr-4 flex flex-col">
																<label>Client(*required)</label>
																<Field
																	onChange={(
																		e: React.ChangeEvent<HTMLInputElement>
																	) => {
																		handleChange(e);
																		setSelectedClient(e.target.value);
																	}}
																	as="select"
																	name="client"
																	id="client"
																	className="block mt-1 px-2 py-2 border rounded-md shadow-sm focus:ring-accentgreen focus:border-accentgreen sm:text-sm"
																>
																	<option
																		value={
																			""
																		}
																	>
																	SELECT
																	</option>
																	{clientList?.map((client: ClientType) => {
																		return (
																			<option
																				key={`${client.id} + ${client.name}`}
																				value={client.id}
																			>
																				{" "}
																				{client.name}
																			</option>
																		);
																	})}
																</Field>
															</div>
															<div className="mr-2 pt-5 flex items-center">
																<label className="inline-block pl-[0.15rem] hover:cursor-pointer w-[1px]">
																	<Field
																		className="mr-2 mt-[0.3rem] h-3.5 w-8 appearance-none rounded-[0.4375rem] bg-neutral-300 
																		hover:checked:bg-accentgreen
																		before:pointer-events-none before:absolute before:h-3.5 before:w-3.5 before:rounded-full before:bg-transparent before:content-[''] after:absolute after:z-[2] after:-mt-[0.1875rem] after:h-5 after:w-5 after:rounded-full after:border-none after:bg-neutral-100 after:shadow-[0_0px_3px_0_rgb(0_0_0_/_7%),_0_2px_2px_0_rgb(0_0_0_/_4%)] after:transition-[background-color_0.2s,transform_0.2s] after:content-[''] checked:bg-accentgreen checked:after:absolute checked:after:z-[2] checked:after:-mt-[3px] checked:after:ml-[1.0625rem] checked:after:h-5 checked:after:w-5 checked:after:rounded-full checked:after:border-none checked:after:bg-accentgreen checked:after:shadow-[0_3px_1px_-2px_rgba(0,0,0,0.2),_0_2px_2px_0_rgba(0,0,0,0.14),_0_1px_5px_0_rgba(0,0,0,0.12)] checked:after:transition-[background-color_0.2s,transform_0.2s] checked:after:content-[''] hover:cursor-pointer focus:outline-none focus:ring-0 focus:before:scale-100 focus:before:opacity-[0.12] focus:before:shadow-[3px_-1px_0px_13px_rgba(0,0,0,0.6)] focus:before:transition-[box-shadow_0.2s,transform_0.2s] focus:after:absolute focus:after:z-[1] focus:after:block focus:after:h-5 focus:after:w-5 focus:after:rounded-full focus:after:content-[''] checked:focus:border-accentgreen checked:focus:bg-accentgreen checked:focus:before:ml-[1.0625rem] checked:focus:before:scale-100 checked:focus:before:shadow-[3px_-1px_0px_13px_#3b71ca] checked:focus:before:transition-[box-shadow_0.2s,transform_0.2s] dark:bg-neutral-600 dark:after:bg-neutral-400 dark:checked:bg-accentgreen dark:checked:after:bg-accentgreen dark:focus:before:shadow-[3px_-1px_0px_13px_rgba(255,255,255,0.4)] dark:checked:focus:before:shadow-[3px_-1px_0px_13px_#3b71ca]"
																		type="checkbox"
																		name="status"
																	/>
																	{values.status ? "confirmed" : "unconfirmed"}
																</label>
															</div>
														</div>
														{/* section 2 */}
														<div className="flex mb-4 pb-2 border-b-4">
															<div className="w-1/5 mr-4 flex flex-col">
																<Field
																	name="dates"
																	handleBlur={handleBlur}
																	component={ProjectDatepicker}
																/>
															</div>
														</div>
														{/* section 3 */}
														<div className="flex mb-4 pb-2 border-b-4 space-x-10">
															<div className="w-1/4 mr-4 flex flex-col">
																<label className="block font-medium text-gray-900">
																	FTE
																	<input
																		type="number"
																		min="1"
																		max="100"
																		step="0.5"
																		name="numOfFTE"
																		id="numOfFTE"
																		autoComplete="numOfFTE"
																		className="block w-full mt-1 px-4 py-2 border rounded-md shadow-sm focus:ring-accentgreen focus:border-accentgreen sm:text-sm"
																		placeholder="1.0"
																		onBlur={handleBlur}
																		onChange={(e) => {
																			handleChange(e);
																			calculateHours(e, values, setFieldValue);
																		}}
																		value={values.numOfFTE}
																	/>
																</label>
															</div>
															<div className="w-1/4 flex flex-col">
																<label
																	htmlFor="hours"
																	className="block font-medium text-gray-900"
																>
																	Hours
																</label>
																<input
																	type="number"
																	name="hours"
																	id="hours"
																	min={1}
																	autoComplete="hours"
																	className="block w-full mt-1 px-4 py-2 border rounded-md shadow-sm focus:ring-accentgreen focus:border-accentgreen sm:text-sm"
																	placeholder=""
																	value={values.hours}
																	onChange={(e) => {
																		handleChange(e);
																		handleManualHours(e, values, setFieldValue);
																	}}
																	readOnly={values.dates.endsOn ? true : false}
																/>
															</div>
														</div>
														{/* Section 4 */}
														<div className="flex mb-4 pb-2 border-b-4">
															<div className="w-1/3 -mr-1 flex flex-col">
																<div className="block">
																	<label>
																		<Field
																			type="radio"
																			name="payRate"
																			value="flatRate"
																			id="flatRate"
																			onChange={(
																				e: React.ChangeEvent<HTMLInputElement>
																			) => {
																				handleChange(e);
																				setFieldValue("hourlyRate", 0);
																				setFieldValue("cost", 0);
																			}}
																			className="form-radio text-accentgreen focus:ring-accentgreen checked:bg-accentgreen checked:border-transparent mr-1"
																		/>
																		Flat Rate
																	</label>
																</div>
																<div className="block">
																	<label>
																		<Field
																			type="radio"
																			name="payRate"
																			value="hourlyRate"
																			id="hourlyRate"
																			onChange={(
																				e: React.ChangeEvent<HTMLInputElement>
																			) => {
																				handleChange(e);
																				setFieldValue("cost", 0);
																			}}
																			className="form-radio text-accentgreen focus:ring-accentgreen checked:bg-accentgreen checked:border-transparent mr-1"
																		/>
																		Hourly Rate
																	</label>
																</div>
															</div>
															<div className="w-1/2 mr-4 flex">
																<label className="mr-3">
																	<span className="relative">
																		<span className="absolute inset-y-0 left-0 pl-3 pb-5 flex items-center pointer-events-none">
																			$
																		</span>
																		<input
																			disabled={
																				values.payRate === "flatRate" ||
																				values.hours === 0
																			}
																			type="number"
																			min="0"
																			value={values.hourlyRate}
																			name="hourlyRate"
																			id="hourlyRate"
																			autoComplete="hourlyRate"
																			onBlur={handleBlur}
																			onChange={(e) => {
																				handleChange(e);
																				setTotalCost(e, values, setFieldValue);
																			}}
																			className={
																				values.payRate === "flatRate"
																					? "bg-slate-500 w-full max-w-xs block mt-1 mr-3 pl-6 px-4 py-2 border rounded-md shadow-sm focus:ring-accentgreen focus:border-accentgreen sm:text-sm"
																					: "w-full max-w-xs block mt-1 mr-3 pl-6 px-4 py-2 border rounded-md shadow-sm focus:ring-accentgreen focus:border-accentgreen sm:text-sm"
																			}
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
																			disabled={values.payRate === "hourlyRate"}
																			type="number"
																			min="0"
																			name="cost"
																			value={values.cost}
																			id="cost"
																			autoComplete="cost"
																			onBlur={handleBlur}
																			onChange={(e) => {
																				handleChange(e);
																				setTotalCost(e, values, setFieldValue);
																			}}
																			className="w-full max-w-xs block mt-1 mr-3 pl-6 px-4 py-2 border rounded-md shadow-sm focus:ring-accentgreen focus:border-accentgreen sm:text-sm"
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
																<button
																	type="button"
																	className="p-2 text-sm font-semibold leading-6 text-gray-900"
																	onClick={() => {
																		onCancel();
																		setErrors({});
																	}}
																>
																	Cancel
																</button>
																<button
																	type="submit"
																	disabled={!isValid}
																	className={`rounded-md bg-${
																		isValid ? "accentgreen" : "slate-500"
																	} px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-accentgreen focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accentgreen`}
																>
																	Save
																</button>

																{errors.dates &&
																	(touched.dates?.startsOn ||
																		touched.dates?.endsOn) && (
																		<div className="text-red-500">
																			{errors.dates?.endsOn as ReactNode}
																		</div>
																	)}
																{errors.name && touched.name && (
																	<div className="text-red-500">
																		{errors.name as ReactNode}
																	</div>
																)}
																{errors.client && touched.client && (
																	<div className="text-red-500">
																		{errors.client as ReactNode}
																	</div>
																)}
																{errors.cost && (
																	<div className="text-red-500">
																		{errors.cost as ReactNode}
																	</div>
																)}
																{errors.payRate && touched.payRate && (
																	<div className="text-red-500">
																		{errors.payRate as ReactNode}
																	</div>
																)}
																{errors.numOfFTE && touched.numOfFTE && (
																	<div className="text-red-500">
																		{errors.numOfFTE as ReactNode}
																	</div>
																)}
															</div>
														</div>
													</form>
												)}
											</Formik>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</Dialog>
			)}
		</>
	);
};
export default withApollo(AddProject);
