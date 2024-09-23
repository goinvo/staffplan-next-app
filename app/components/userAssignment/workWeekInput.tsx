import React from "react";
import { Formik, FormikValues } from "formik";

import { useMutation } from "@apollo/client";
import { AssignmentType, WorkWeekType, MonthsDataType } from "@/app/typeInterfaces";
import { UPSERT_WORKWEEKS, UPSERT_WORKWEEK } from "@/app/gqlQueries";
import { useUserDataContext } from "@/app/userDataContext";
import { CustomInput } from "../cutomInput";
import { assignmentContainsCWeek, isPastOrCurrentWeek, filterWeeksForFillForward, getWeekNumbersPerScreen } from "../scrollingCalendar/helpers";
import { ACTUAL_HOURS, ESTIMATED_HOURS } from "../scrollingCalendar/constants";

interface WorkWeekInputProps {
	withinProjectDates?: boolean;
	workWeek?: WorkWeekType;
	assignment: AssignmentType;
	cweek: number;
	year: number;
	months: MonthsDataType[]
}
export interface WorkWeekValues {
	cweek: number;
	year: number;
	estHours?: number;
	actHours?: number;
	assignmentId?: number;
}

interface FillForwardVariablesType {
	assignmentId: string;
	workWeeks?: WorkWeekValues[]
}

export const WorkWeekInput = ({
	assignment,
	cweek,
	year,
	months
}: WorkWeekInputProps) => {
	const weekWithinAssignmentDates = assignmentContainsCWeek(assignment, cweek, year)
	const existingWorkWeek = assignment?.workWeeks.find((week) => week.cweek === cweek && week.year === year);
	const initialValues = {
		actualHours: existingWorkWeek?.actualHours || "",
		estimatedHours:
			existingWorkWeek?.estimatedHours || weekWithinAssignmentDates && assignment?.estimatedWeeklyHours || "",
		assignmentId: assignment?.id,
		cweek: cweek,
		year: year,
	};

	const [upsertWorkweek] = useMutation(UPSERT_WORKWEEK, {
		onCompleted() {
			refetchUserList()
			refetchProjectList()
		}
	});

	const [upsertWorkWeeks] = useMutation(UPSERT_WORKWEEKS, {
		onCompleted() {
			refetchUserList()
			refetchProjectList()
		}
	});

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
		})
	};

	const onFillForwardClick = async (inputName: string,
		targetCweek: number, values: FormikValues) => {
		const variables: FillForwardVariablesType = {
			assignmentId: values.assignmentId,
		};

		if ((inputName === ESTIMATED_HOURS && values.estimatedHours === '') ||
			(inputName === ACTUAL_HOURS && values.actualHours === '')) {
			return;
		}

		const weekNumbersPerScreen = getWeekNumbersPerScreen(months);

		let filteredWeeks = filterWeeksForFillForward(weekNumbersPerScreen, targetCweek, inputName);
		if (assignment.endsOn || assignment.startsOn) {
			filteredWeeks = filteredWeeks.filter(week =>
				assignmentContainsCWeek(assignment, week.cweek, week.year))
		}

		if (inputName === ESTIMATED_HOURS && values.estimatedHours !== "") {
			variables.workWeeks = filteredWeeks.map(week => ({
				cweek: week.cweek,
				estimatedHours: parseInt(values.estimatedHours),
				year: week.year
			}));
		}

		if (inputName === ACTUAL_HOURS && values.actualHours !== "") {
			variables.workWeeks = filteredWeeks.map(week => ({
				cweek: week.cweek,
				actualHours: parseInt(values.actualHours),
				year: week.year
			}));
		}
		upsertWorkWeeks({
			variables
		})
	}

	return (
		<Formik
			onSubmit={(e) => upsertWorkWeekValues(e)}
			initialValues={initialValues}
			enableReinitialize
		>
			{({
				handleChange,
				values,
				handleBlur,
				dirty
			}) => (
				<>
					<CustomInput
						value={values.estimatedHours}
						name="estimatedHours"
						id={`estHours-${assignment?.id}-${cweek}-${year}`}
						onChange={handleChange}
						onBlur={(e) => {
							handleBlur("estimatedHours");
							if (dirty && values.estimatedHours) {
								upsertWorkWeekValues(values);
							}
						}}
						onFillForwardClick={() => onFillForwardClick(ESTIMATED_HOURS, cweek, values)}
					/>
					{isPastOrCurrentWeek(cweek, year) && (
						<CustomInput
							value={values.actualHours}
							name="actualHours"
							id={`actHours-${assignment?.id}-${cweek}-${year}`}
							onChange={handleChange}
							onBlur={(e) => {
								handleBlur("actualHours");
								if (dirty && values.actualHours) {
									upsertWorkWeekValues(values);
								}
							}}
							onFillForwardClick={() => onFillForwardClick(ACTUAL_HOURS, cweek, values)}
						/>
					)}
				</>
			)}
		</Formik>
	);
};