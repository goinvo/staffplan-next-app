"use client";
import { ReactNode } from "react";
import { Field, Formik, FormikValues } from "formik";
import ProjectDatepicker from "../projectDatepicker";
import { useMutation } from "@apollo/client";
import { AssignmentType, ProjectType, UserType } from "../../typeInterfaces";
import { UPSERT_ASSIGNMENT } from "../../gqlQueries";
import { useUserDataContext } from "../../contexts/userDataContext";
import { useProjectsDataContext } from "../../contexts/projectsDataContext";

interface EditAssignmentModalProps {
	user?: UserType;
	assignment: AssignmentType;
	project?: ProjectType;
	closeModal: () => void;
}

const EditAssignmentModal = ({ closeModal, assignment,project }: EditAssignmentModalProps) => {
	const { refetchUserList } = useUserDataContext()
	const { refetchProjectList } = useProjectsDataContext()

	const projectId = project ? project.id : assignment.project.id
	const initialValues = {
		dates: {
			endsOn: assignment?.endsOn || "",
			startsOn: assignment?.startsOn || "",
		},
		hours: assignment.estimatedWeeklyHours ? assignment.estimatedWeeklyHours : 0,
		assignmentId: assignment?.id,
        projectId: projectId,
		status: assignment.status === "active" ? true : false,
		userId: assignment.assignedUser.id,
	};
	const [
		upsertAssignment,
		{ data: mutationData, loading: mutationLoading, error: mutationError },
	] = useMutation(UPSERT_ASSIGNMENT);

	const onSubmitUpsert = ({
		assignmentId,
        projectId,
		userId,
		status,
		dates,
		hours,
	}: FormikValues) => {
		const variables = {
			id: assignmentId,
            projectId:projectId,
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
				refetchProjectList();
			}
			closeModal()
		});
	};
	const validateForm = (values: FormikValues) => {
		const errors: Partial<Record<keyof FormikValues, string | {}>> = {};
		if (values.dates) {
			const startDate = new Date(values.dates.startsOn);
			const endDate = new Date(values.dates.endsOn);

			if (startDate && endDate && startDate > endDate) {
				errors.dates = { endsOn: "Start must be before end" };
			}
		}
		return errors;
	};

	return (
		<>
			<div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>

			<div className="fixed inset-0 z-50 w-screen overflow-y-auto">
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
												{/* SECTION 1 */}
												<div className="flex mb-4 pb-2 border-b-4">
													<div className="w-1/5 mr-4 flex flex-col">
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
													<Field
														selectedProject={assignment.project}
														handleBlur={handleBlur}
														name="dates"
														component={ProjectDatepicker}
														assignmentView={true}
													/>
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
																closeModal()
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
															(touched.dates?.startsOn ||
																touched.dates?.endsOn) && (
																<div className="text-red-500">
																	{errors.dates?.endsOn as ReactNode}
																</div>
															)}
														{errors.userId && touched.userId && (
															<div className="text-red-500">
																{errors.userId as ReactNode}
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
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	);
};
export default EditAssignmentModal;