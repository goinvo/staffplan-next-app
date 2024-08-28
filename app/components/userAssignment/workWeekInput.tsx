import React from "react";
import { Formik, FormikValues } from "formik";
import { useMutation } from "@apollo/client";

import { AssignmentType, WorkWeekType } from "@/app/typeInterfaces";
import { UPSERT_WORKWEEK } from "@/app/gqlQueries";
import { useUserDataContext } from "@/app/userDataContext";
import { CustomInput } from "../cutomInput";

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
	assignment,
	cweek,
	year,
}: WorkWeekInputProps) => {
	const existingWorkWeek = assignment?.workWeeks.find((week) => week.cweek === cweek && week.year === year);
	const initialValues = {
		actualHours: existingWorkWeek?.actualHours || "",
		estimatedHours:
			existingWorkWeek?.estimatedHours || assignment?.estimatedWeeklyHours || "",
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
			{existingWorkWeek ? (
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
						<>
							<CustomInput
								value={values.estimatedHours}
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
							<CustomInput
								value={values.actualHours}
								name="actualHours"
								id="actHours"
								onChange={handleChange}
								onBlur={(e) => {
									handleBlur("actHours");
									if (values.estimatedHours && values.actualHours) {
										upsertWorkWeekValues(values);
									}
								}}
							/>
						</>
					)}

				</Formik>
			) : null}
			{
				assignment && !existingWorkWeek ? (
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
							<>
								<CustomInput
									value={withinProjectDates ? values.estimatedHours : ""}
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
								<CustomInput
									value={withinProjectDates ? values.actualHours : ""}
									name="actualHours"
									id="actHours"
									onChange={handleChange}
									onBlur={(e) => {
										handleBlur("actHours");
										if (values.estimatedHours && values.actualHours) {
											upsertWorkWeekValues(values);
										}
									}}
									disabled={!withinProjectDates}
								/>
							</>
						)}
					</Formik >
				) : null
			}
		</>
	);
};

