
import { Formik, FormikValues } from "formik";
import { useMutation } from "@apollo/client";
import React from "react";

import { UPSERT_WORKWEEK } from "@/app/gqlQueries";
import { useUserDataContext } from "@/app/userDataContext";
import { AssignmentType, WorkWeekType } from "@/app/typeInterfaces";
import { CustomInput } from "../cutomInput";


interface WorkWeekInputProps {
	withinProjectDates?: boolean;
	workWeek?: WorkWeekType;
	assignment?: AssignmentType;
	cweek: number | null;
	year: number | null;
	isUserTBD: boolean;
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
	isUserTBD,
	assignment,
	cweek,
	year,
	withinProjectDates = true, // Default value to true if not provided
}: WorkWeekInputProps) => {
	const workWeekExists = assignment?.workWeeks?.find(workWeek => workWeek.cweek === cweek && workWeek.year === year);
	const initialValues = {
		actualHours: workWeekExists?.actualHours || "",
		estimatedHours:
			workWeekExists?.estimatedHours || assignment?.estimatedWeeklyHours || "",
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
				<Formik
					onSubmit={(e) => upsertWorkWeekValues(e)}
					initialValues={initialValues}
				>
					{({ handleChange, values, handleSubmit, handleBlur }) => (
						<>
							<CustomInput
								value={values.estimatedHours}
								name="estHours"
								id="estimatedHours"
								disabled={isUserTBD}
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
								disabled={isUserTBD}
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
				assignment && !workWeek ? (
					<Formik
						onSubmit={(e) => upsertWorkWeekValues(e)}
						initialValues={initialValues}
					>
						{({ handleChange, values, handleSubmit, handleBlur }) => (
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
									disabled={!withinProjectDates || isUserTBD}
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
									disabled={!withinProjectDates || isUserTBD}
								/>
							</>
						)}
					</Formik >
				) : null
			}
		</>
	);
};
