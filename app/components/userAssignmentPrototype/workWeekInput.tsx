import { AssignmentType, WorkWeekType } from "@/app/typeInterfaces";
import { Formik, FormikValues } from "formik";
import { useMutation } from "@apollo/client";

import React from "react";
import { UPSERT_WORKWEEK } from "@/app/gqlQueries";
import { useUserDataContext } from "@/app/userDataContext";

interface WorkWeekInputProps {
	withinProjectDates?: boolean;
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
	withinProjectDates,
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
	console.log(withinProjectDates, "WITHIN PROJECT DATES in input");
	return (
		<>
			{workWeek ? (
				<div className="flex flex-col items-center ">
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
								<div className="flex flex-col pt-2 z-10">
									<input
										value={values.estimatedHours}
										className="border border-gray-300 w-10 rounded p-2 mb-1"
										name="estHours"
										id="estimatedHours"
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
			{assignment && !workWeek ? (
				<div className="flex flex-col items-center">
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
								<div className="flex flex-col pt-2 z-10">
									<input
										value={withinProjectDates ? values.estimatedHours : ""}
										className={`border border-gray-300 w-10 rounded p-2 mb-1 ${
											!withinProjectDates ? "bg-accentgrey" : ""
										}`}
										name="estimatedHours"
										id="estHours"
										onChange={handleChange}
										onBlur={(e) => {
											handleBlur("estHours");
											if (values.estimatedHours && values.actualHours) {
												upsertWorkWeekValues(values);
											}
										}}
										disabled={!withinProjectDates}
									/>
									<input
										value={withinProjectDates ? values.actualHours : ""}
										name="actualHours"
										id="actHours"
										onChange={handleChange}
										className={`border border-gray-300 w-10 rounded p-2 mb-1 ${
											!withinProjectDates ? "bg-accentgrey" : ""
										}`}
										onBlur={(e) => {
											handleBlur("actHours");
											if (values.estimatedHours && values.actualHours) {
												upsertWorkWeekValues(values);
											}
										}}
										disabled={!withinProjectDates}
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
