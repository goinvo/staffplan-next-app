"use client";
import { useState, ReactNode } from "react";
import ProjectDatepicker from "./projectDatepicker";
import { useMutation } from "@apollo/client";
import { AssignmentType, ProjectType, UserType } from "../typeInterfaces";
import { Field, Formik, FormikValues } from "formik";
import { useUserDataContext } from "../userDataContext";
import { UPSERT_ASSIGNMENT } from "../gqlQueries";
import { LoadingSpinner } from "./loadingSpinner";
interface AddAssignmentSingleUserProps {
	user: UserType | null;
	onClose: () => void;
	onComplete: () => void;
}
const AddAssignmentSingleUser = ({
	user,
	onClose,
	onComplete,
}: AddAssignmentSingleUserProps) => {
	const [selectedProject, setSelectedProject] = useState<Partial<ProjectType>>(
		{}
	);
	const { userList, projectList, refetchUserList } = useUserDataContext();
	const initialValues = {
		dates: { endsOn: "", startsOn: "" },
		hours: 0,
		projectId: "",
		status: false,
		userId: user?.id,
	};
	const [
		upsertAssignment,
		{ data: mutationData, loading: mutationLoading, error: mutationError },
	] = useMutation(UPSERT_ASSIGNMENT);
	if (!userList || !projectList || mutationLoading) return <LoadingSpinner />;
	const onSubmitUpsert = ({
		projectId,
		userId,
		status,
		dates,
		hours,
	}: FormikValues) => {
		const variables = {
			projectId: projectId,
			userId: userId,
			status: status ? "active" : "proposed",
			estimatedWeeklyHours: hours,
		};
		const nullableDates = () => {
			if (dates.startsOn && dates.endsOn) {
				return {
					...variables,
					endsOn: dates.endsOn,
					startsOn: dates.startsOn,
				};
			}
			if (dates.startsOn && !dates.endsOn) {
				return { ...variables, startsOn: dates.startsOn };
			}
			if (!dates.startsOn && dates.endsOn) {
				return { ...variables, endsOn: dates.endsOn };
			}
			return variables;
		};
		upsertAssignment({
			variables: nullableDates(),
		}).then((response) => {
			if (response.data.upsertAssignment) {
				refetchUserList();
			}
			onClose();
		});
	};
	const validateForm = (values: FormikValues) => {
		const errors: Partial<Record<keyof FormikValues, string | {}>> = {};
		if (!values.userId) {
			errors.userId = "User is required";
		}
		if (values.userId) {
			const foundUser = userList?.find(
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
			const foundProject = projectList?.find(
				(project: ProjectType) => project.id === values.projectId
			);
			if (!foundProject) {
				errors.projectId = "Must select a valid Project";
			}
		}
		if (values.dates) {
			const startDate = new Date(values.dates.startsOn);
			const endDate = new Date(values.dates.endsOn);

			if (startDate && endDate && startDate > endDate) {
				errors.dates = { endsOn: "Start must be before end" };
			}
		}
		return errors;
	};

	const handleProjectSelection = (
		projectId: React.ChangeEvent<HTMLInputElement>
	) => {
		const existingProject = projectList?.find(
			(project: ProjectType) => project.id.toString() === projectId.target.value
		);
		if (existingProject) setSelectedProject(existingProject);
	};
	const filteredProjects = () => {
        if (user && user.assignments) {
			return projectList?.filter((project: ProjectType) => {
				return !user.assignments?.find(
					(userProject: AssignmentType) => userProject.project.id === project.id
				);
			});
		}
		return projectList;
	};
	return (
		<>
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
						<form className="max-w-lg mx-auto" onSubmit={handleSubmit}>
							{/* SECTION 1 */}
							<div className="flex mb-4">
								<div className="w-2/5 mr-4">
									<label>
										Project
										<Field
											className="block px-4 py-2 border rounded-md shadow-sm focus:ring-accentgreen focus:border-accentgreen sm:text-sm"
											onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
												handleProjectSelection(e);
												handleChange(e);
											}}
											as="select"
											name="projectId"
											id="projectId"
										>
											<option value={""}>SELECT</option>
											{filteredProjects()?.map((project: ProjectType) => (
												<option
													key={`${project.id} + ${project.name}`}
													value={project.id}
												>
													{" "}
													{project.name}
												</option>
											))}
										</Field>
									</label>
								</div>

								<div className="w-1/5 mr-4">
									<label
										htmlFor="hours"
										className="block text-sm font-medium leading-6 text-gray-900"
									>
										Hours/Week
									</label>
									<div className="mt-2">
										<div className="rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 sm:max-w-md">
											<input
												type="number"
												min="0"
												name="hours"
												id="hours"
												value={values.hours}
												autoComplete="hours"
												className="block w-full -mt-2 px-4 py-2 border rounded-md shadow-sm focus:ring-accentgreen focus:border-accentgreen sm:text-sm"
												placeholder="40"
												onChange={handleChange}
											/>
										</div>
									</div>
								</div>
								<div className="w-2/5">
									<Field
										selectedProject={selectedProject}
										handleBlur={handleBlur}
										name="dates"
										component={ProjectDatepicker}
										assignmentView={true}
									/>
								</div>
							</div>

							{/* SECTION 2 */}
							<div className="flex mb-4 justify-between">
								<div className="mr-2">
									<label className="inline-block pl-[0.15rem] hover:cursor-pointer">
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
								<div className="mr-2">
									<button
										type="button"
										className="p-2 text-sm font-semibold leading-6 text-gray-900"
										onClick={() => {
											onClose();
											setErrors({});
										}}
									>
										Cancel
									</button>
									<button
										type="submit"
										disabled={!isValid}
										className="rounded-md bg-accentgreen px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-accentlightgreen focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accentlightgreen"
									>
										Save
									</button>
									{errors.dates &&
										(touched.dates?.startsOn || touched.dates?.endsOn) && (
											<div className="text-red-500">
												{errors.dates?.endsOn as ReactNode}
											</div>
										)}
									{errors.userId && touched.userId && (
										<div className="text-red-500">
											{errors.userId as ReactNode}
										</div>
									)}
									{errors.projectId && touched.projectId && (
										<div className="text-red-500">
											{errors.projectId as ReactNode}
										</div>
									)}
									{errors.hours && touched.hours && (
										<div className="text-red-500">
											{errors.hours as ReactNode}
										</div>
									)}
								</div>
							</div>
						</form>
					)}
				</Formik>
			</div>
		</>
	);
};
export default AddAssignmentSingleUser;
