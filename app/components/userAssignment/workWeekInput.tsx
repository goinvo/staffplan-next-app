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
	estHours?: number;
	actHours?: number;
	assignmentId?: number;
}
export const WorkWeekInput = ({
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
	const { refetchUserList, refetchProjectList } = useUserDataContext();

	const upsertWorkWeekValues = (values: FormikValues) => {
		const variables: WorkWeekValues = {
			assignmentId: values.assignmentId,
			cweek: values.cweek,
			year: values.year,
		};
		if (values.estimatedHours !== "") {
			variables.estHours = parseInt(values.estimatedHours);
		}

		if (values.actualHours !== "") {
			variables.actHours = parseInt(values.actualHours);
		}
		upsertWorkweek({
			variables
		}).then((res) => {
			refetchUserList();
			refetchProjectList();
		});
	};
	return (
		<Formik
			onSubmit={(e) => upsertWorkWeekValues(e)}
			initialValues={initialValues}
		>
			{({
				handleChange,
				values,
				handleBlur,
			}) => (
				<>
					<CustomInput
						value={values.estimatedHours}
						name="estimatedHours"
						id={`estHours-${assignment?.id}-${cweek}-${year}`}
						onChange={handleChange}
						onBlur={(e) => {
							handleBlur("estimatedHours");
							if (values.estimatedHours) {
								upsertWorkWeekValues(values);
							}
						}}
					/>
					<CustomInput
						value={values.actualHours}
						name="actualHours"
						id={`actHours-${assignment?.id}-${cweek}-${year}`}
						onChange={handleChange}
						onBlur={(e) => {
							handleBlur("actualHours");
							if (values.actualHours) {
								upsertWorkWeekValues(values);
							}
						}}
					/>
				</>
			)}
		</Formik>
	);
};