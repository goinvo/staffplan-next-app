import { AssignmentType, WorkWeekType } from "@/app/typeInterfaces";
import { Formik, FormikValues } from "formik";
import { useMutation } from "@apollo/client";

import React from "react";
import { UPSERT_WORKWEEK } from "@/app/gqlQueries";
import { useUserDataContext } from "@/app/userDataContext";

interface WorkWeekInputProps {
	workWeek?: WorkWeekType;
	assignment?: AssignmentType;
	cweek: number | null;
	year: number | null;
}
export interface WorkWeekValues {
	cweek: number;
	year: number;
	estimatedHours: number;
	actualHours: number;
	assignmentId?: number;
}
export const WorkWeekInput = ({
	workWeek,
	assignment,
	cweek,
	year,
}: WorkWeekInputProps) => {
	const initialValues = {
		actualHours: workWeek?.actualHours || "",
		estimatedHours:
			workWeek?.estimatedHours || assignment?.estimatedWeeklyHours || "",
		assignmentId: assignment?.id,
		cweek: cweek,
		year: year,
	};

	const [upsertWorkweek] = useMutation(UPSERT_WORKWEEK);
	const { refetchUserList } = useUserDataContext();

	const upsertWorkWeekValues = (values: FormikValues) => {
		upsertWorkweek({
			variables: {
				assignmentId: values.assignmentId,
				cweek: values.cweek,
				year: values.year,
				estHours: parseInt(values.estimatedHours),
				actHours: parseInt(values.actualHours),
			},
		}).then((res) => {
			refetchUserList();
		});
	};

	return (
		<>
			{workWeek ? (
				<div className="flex flex-col items-center pt-2 justify-center">
					<Formik
						onSubmit={(e) => upsertWorkWeekValues(e)}
						initialValues={initialValues}
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
								onSubmit={handleSubmit}
								className="flex flex-col items-center justify-center"
							>
								<input
									value={values.estimatedHours}
									className="border border-gray-300 w-10 rounded p-2 mb-1"
									name="estHours"
									id="estimatedHours"
									onClick={(e) => {
										console.log(workWeek, cweek, year, "WORK WEEK CLICKED");
									}}
									onChange={handleChange}
									onBlur={(e) => {
										handleBlur("estHours");
										if (values.estimatedHours && values.actualHours) {
											upsertWorkWeekValues(values);
										}
									}}
								/>
								<input
									value={values.actualHours}
									name="actualHours"
									id="actHours"
									className="border border-gray-300 w-10 rounded p-2 mb-1"
									onChange={handleChange}
									onClick={(e) => {
										console.log(workWeek, cweek, year, "WORK WEEK CLICKED");
									}}
									onBlur={(e) => {
										handleBlur("actHours");
										if (values.estimatedHours && values.actualHours) {
											upsertWorkWeekValues(values);
										}
									}}
								/>
							</form>
						)}
					</Formik>
				</div>
			) : null}
			{assignment && !workWeek ? (
				<div className="flex flex-col items-center pt-2">
					<Formik
						onSubmit={(e) => upsertWorkWeekValues(e)}
						initialValues={initialValues}
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
								onSubmit={handleSubmit}
								className="flex flex-col items-center"
							>
								<div className="flex flex-col">

								<input
									value={values.estimatedHours}
									className="border border-gray-300 w-10 rounded p-2 mb-1"
									name="estimatedHours"
									id="estHours"
									onChange={handleChange}
									onClick={(e) => {
										console.log(assignment, cweek, year, "ASSIGNMENT CLICKED");
									}}
									onBlur={(e) => {
										handleBlur("estHours");
										if (values.estimatedHours && values.actualHours) {
											upsertWorkWeekValues(values);
										}
									}}
									/>
								<input
									value={values.actualHours}
									name="actualHours"
									id="actHours"
									onChange={handleChange}
									className="border border-gray-300 w-10 rounded p-2 mb-1"
									onBlur={(e) => {
										handleBlur("actHours");
										if (values.estimatedHours && values.actualHours) {
											upsertWorkWeekValues(values);
										}
									}}
									/>
									</div>
							</form>
						)}
					</Formik>
				</div>
			) : null}
		</>
	);
};
