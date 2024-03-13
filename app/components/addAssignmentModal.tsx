"use client";
import { useState, useEffect } from "react";
import ProjectDatepicker from "./projectDatepicker";
import { UserType } from "../typeInterfaces";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "@apollo/client";
import withApollo from "@/lib/withApollo";
import { ProjectType } from "../typeInterfaces";
import { Field, Formik, FormikValues } from "formik";
import { GET_ASSIGNMENT_DATA, UPSERT_ASSIGNMENT } from "../gqlQueries";
const AddAssignment = () => {
	const [clientSide, setClientSide] = useState(false);
	const [selectedProject, setSelectedProject] = useState<Partial<ProjectType>>(
		{}
	);
	const router = useRouter();
	useEffect(() => {
		setClientSide(true);
	}, []);
	const searchParams = useSearchParams();
	const showModal = searchParams.get("assignmentmodal");

	const initialValues = {
		status: false,
		userId: "",
		projectId: "",
		dates: { endsOn: "", startsOn: "" },
	};

	const { loading, error, data } = useQuery(GET_ASSIGNMENT_DATA, {
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
	const onSubmitUpsert = ({
		projectId,
		userId,
		status,
		dates,
	}: FormikValues) => {
		console.log("SUBMIT TRIGGERED");
		upsertAssignment({
			variables: {
				projectId: projectId,
				userId: userId,
				status: status ? "active" : "archived",
				startsOn: dates.startsOn,
				endsOn: dates.endsOn,
			},
		}).then(() => {
			router.back();
		});
	};
	const onCancel = () => router.back();
	const validateForm = (values: FormikValues) => {
		const errors: Partial<Record<keyof FormikValues, string | {}>> = {};
		if (!values.userId) {
			errors.userId = "User is required";
		}
		if (values.userId) {
			const foundUser = data?.users?.find(
				({ id }: UserType) => id === values.userId
			);
			if (!foundUser) {
				errors.userId = "Must select a valid User";
			}
		}
		if (!values.projectId) {
			errors.projectId = "Project is required";
		}
		if (values.projectId) {
			const foundProject = data?.clients.find(
				(client: { projects: ProjectType[] }) => {
					return client.projects.find(
						(project: ProjectType) => project.id === values.projectId
					);
				}
			);
			if (!foundProject) {
				errors.projectId = "Must select a valid Project";
			}
		}
		if (values.dates) {
			const startDate = new Date(values.dates.startsOn);
			const endDate = new Date(values.dates.endsOn);
			if (startDate > endDate) {
				console.log("1 possible error");
				errors.dates = { endsOn: "Start must be before end" };
			}
			if (
				startDate.toString() === "Invalid Date" ||
				endDate.toString() === "Invalid Date"
			) {
				console.log("2 possible error");
				errors.dates = { endsOn: "Must select both dates" };
			}
		}
		console.log(errors);
		return errors;
	};
	
	const handleProjectSelection = (
		projectId: React.ChangeEvent<HTMLInputElement>
	) => {
		data?.clients?.map((client: { projects: ProjectType[] }) => {
			const existingProject = client.projects.find(
				(project: ProjectType) =>
					project.id.toString() === projectId.target.value
			);
			if (existingProject) setSelectedProject(existingProject);
		});
	};
	if (mutationData) console.log(mutationData);
	return (
		<>
			{showModal && (
				<div
					className="relative z-50"
					aria-labelledby="assignment-modal"
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
											<Formik
												onSubmit={(e) => onSubmitUpsert(e)}
												initialValues={initialValues}
												validate={validateForm}
											>
												{({
													handleChange,
													values,
													setErrors,
													handleSubmit,
													handleBlur,
													errors,
													touched,
													isValid,
												}) => (
													<form
														className="max-w-lg mx-auto"
														onSubmit={handleSubmit}
													>
														<div className="flex mb-4">
															<label>
																User
																<Field
																	onChange={handleChange}
																	as="select"
																	name="userId"
																	id="userId"
																>
																	<option value={""}>SELECT</option>
																	{data?.users?.map((user: UserType) => {
																		return (
																			<option
																				key={`${user.id} + ${user.name}`}
																				value={user.id}
																			>
																				{" "}
																				{user.name}
																			</option>
																		);
																	})}
																</Field>
															</label>
															<label>
																Project
																<Field
																	onChange={(
																		e: React.ChangeEvent<HTMLInputElement>
																	) => {
																		handleProjectSelection(e);
																		handleChange(e);
																	}}
																	as="select"
																	name="projectId"
																	id="projectId"
																>
																	<option value={""}>SELECT</option>
																	{data?.clients?.map(
																		(client: { projects: ProjectType[] }) => {
																			return client.projects.map(
																				(project: ProjectType) => (
																					<option
																						key={`${project.id} + ${project.name}`}
																						value={project.id}
																					>
																						{" "}
																						{project.name}
																					</option>
																				)
																			);
																		}
																	)}
																</Field>
															</label>
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
															<Field
																selectedProject={selectedProject}
																handleBlur={handleBlur}
																name="dates"
																component={ProjectDatepicker}
															/>
														</div>
														<div className="flex mb-4 justify-between">
															<div className="mr-2">
																<label className="inline-block pl-[0.15rem] hover:cursor-pointer">
																	<Field
																		className="mr-2 mt-[0.3rem] h-3.5 w-8 appearance-none rounded-[0.4375rem] bg-neutral-300 before:pointer-events-none before:absolute before:h-3.5 before:w-3.5 before:rounded-full before:bg-transparent before:content-[''] after:absolute after:z-[2] after:-mt-[0.1875rem] after:h-5 after:w-5 after:rounded-full after:border-none after:bg-neutral-100 after:shadow-[0_0px_3px_0_rgb(0_0_0_/_7%),_0_2px_2px_0_rgb(0_0_0_/_4%)] after:transition-[background-color_0.2s,transform_0.2s] after:content-[''] checked:bg-primary checked:after:absolute checked:after:z-[2] checked:after:-mt-[3px] checked:after:ml-[1.0625rem] checked:after:h-5 checked:after:w-5 checked:after:rounded-full checked:after:border-none checked:after:bg-primary checked:after:shadow-[0_3px_1px_-2px_rgba(0,0,0,0.2),_0_2px_2px_0_rgba(0,0,0,0.14),_0_1px_5px_0_rgba(0,0,0,0.12)] checked:after:transition-[background-color_0.2s,transform_0.2s] checked:after:content-[''] hover:cursor-pointer focus:outline-none focus:ring-0 focus:before:scale-100 focus:before:opacity-[0.12] focus:before:shadow-[3px_-1px_0px_13px_rgba(0,0,0,0.6)] focus:before:transition-[box-shadow_0.2s,transform_0.2s] focus:after:absolute focus:after:z-[1] focus:after:block focus:after:h-5 focus:after:w-5 focus:after:rounded-full focus:after:content-[''] checked:focus:border-primary checked:focus:bg-primary checked:focus:before:ml-[1.0625rem] checked:focus:before:scale-100 checked:focus:before:shadow-[3px_-1px_0px_13px_#3b71ca] checked:focus:before:transition-[box-shadow_0.2s,transform_0.2s] dark:bg-neutral-600 dark:after:bg-neutral-400 dark:checked:bg-primary dark:checked:after:bg-primary dark:focus:before:shadow-[3px_-1px_0px_13px_rgba(255,255,255,0.4)] dark:checked:focus:before:shadow-[3px_-1px_0px_13px_#3b71ca]"
																		type="checkbox"
																		name="status"
																	/>
																	{values.status ? "confirmed" : "unconfirmed"}
																</label>
															</div>
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
																	className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
																>
																	Save
																</button>
																{errors.dates &&
																	(touched.dates?.startsOn ||
																		touched.dates?.endsOn) && (
																		<div className="text-red-500">
																			{errors.dates?.endsOn}
																		</div>
																	)}
																{errors.userId && touched.userId && (
																	<div className="text-red-500">
																		{errors.userId}
																	</div>
																)}
																{errors.projectId && touched.projectId && (
																	<div className="text-red-500">
																		{errors.projectId}
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
				</div>
			)}
		</>
	);
};
export default withApollo(AddAssignment);
