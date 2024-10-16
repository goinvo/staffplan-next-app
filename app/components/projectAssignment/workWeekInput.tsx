'use client'

import React, { useEffect } from "react";
import { Formik, FormikValues } from "formik";

import { useMutation } from "@apollo/client";
import { UPSERT_WORKWEEKS, UPSERT_WORKWEEK } from "@/app/gqlQueries";
import { AssignmentType, MonthsDataType, ProjectType, WorkWeekType } from "@/app/typeInterfaces";
import { CustomInput } from "../cutomInput";
import { assignmentContainsCWeek, isPastOrCurrentWeek, filterWeeksForFillForward, getWeekNumbersPerScreen, currentWeek, currentYear, tabbingAndArrowNavigation, updateProjectAssignments, updateUserAssignments, updateOrInsertWorkWeek, updateOrInsertWorkWeekInProject } from "../scrollingCalendar/helpers";
import { ACTUAL_HOURS, ESTIMATED_HOURS } from "../scrollingCalendar/constants";
import { useUserDataContext } from "@/app/contexts/userDataContext";
import { useProjectsDataContext } from "@/app/contexts/projectsDataContext";

interface WorkWeekInputProps {
	withinProjectDates?: boolean;
	workWeek?: WorkWeekType;
	assignment: AssignmentType;
	cweek: number;
	year: number;
	isUserTBD: boolean;
	months: MonthsDataType[];
	rowIndex: number,
	cellIndex: number,
	totalRows: number,
	inputRefs: React.MutableRefObject<Array<[Array<HTMLInputElement | null>, Array<HTMLInputElement | null>]>>;
	project: ProjectType
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
	isUserTBD,
	assignment,
	cweek,
	year,
	months,
	inputRefs,
	rowIndex,
	cellIndex,
	totalRows,
	project
}: WorkWeekInputProps) => {
	const weekWithinAssignmentDates = assignmentContainsCWeek(assignment, cweek, year)
	const existingWorkWeek = assignment?.workWeeks.find((week) => week.cweek === cweek && week.year === year);
	const initialValues = {
		actualHours: existingWorkWeek?.actualHours || "",
		estimatedHours:
			existingWorkWeek?.estimatedHours ?? (weekWithinAssignmentDates && assignment?.estimatedWeeklyHours || ""),
		assignmentId: assignment?.id,
		cweek: cweek,
		year: year,
	};
	const { id: projectId } = project;
	const { assignedUser } = assignment || {};
	const userId = assignedUser?.id || '';

	const [upsertWorkweek] = useMutation(UPSERT_WORKWEEK, {
		onCompleted({ upsertWorkWeek }) {
			const { assignmentId, id, ...workWeek } = upsertWorkWeek
			const updatedUserList = updateOrInsertWorkWeek(
				userList,
				userId,
				assignmentId,
				workWeek
			);

			const updatedProjectList = updateOrInsertWorkWeekInProject(
				projectList,
				projectId,
				assignmentId,
				workWeek
			);
			setUserList(updatedUserList);
			setProjectList(updatedProjectList)
		}

	});

	const [upsertWorkWeeks] = useMutation(UPSERT_WORKWEEKS, {
		onCompleted({ upsertWorkWeeks }) {
			const updatedProjectList = updateProjectAssignments(
				projectList,
				projectId,
				upsertWorkWeeks.id,
				upsertWorkWeeks.workWeeks
			);

			const updatedUserList = updateUserAssignments(
				userList,
				userId,
				upsertWorkWeeks.id,
				upsertWorkWeeks.workWeeks
			);
			setProjectList(updatedProjectList)
			setUserList(updatedUserList)
		}
	});

	const { userList, setUserList } = useUserDataContext()

	const { projectList, setProjectList } = useProjectsDataContext();

	useEffect(() => {
		const currentWeekExists = months?.some(month =>
			month.weeks.some(week =>
				week.weekNumberOfTheYear === currentWeek && month.year === currentYear
			)
		);

		const allWeeksInFuture = months?.every(month =>
			month.weeks.every(week =>
				(month.year > currentYear) || (month.year === currentYear && week.weekNumberOfTheYear > currentWeek)
			)
		);

		if (currentWeekExists) {
			if (inputRefs.current[rowIndex] && inputRefs.current[rowIndex][1]) {
				inputRefs.current[rowIndex][1] = inputRefs.current[rowIndex][1].slice(0, 3);
			}
		}
		if (!currentWeekExists && allWeeksInFuture) {
			if (inputRefs.current[rowIndex]) {
				inputRefs.current[rowIndex][1] = [];
			}
		}
	}, [months, rowIndex, inputRefs]);

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
		targetCweek: number, targetYear: number, values: FormikValues) => {
		const variables: FillForwardVariablesType = {
			assignmentId: values.assignmentId,
		};

		if ((inputName === ESTIMATED_HOURS && values.estimatedHours === '') ||
			(inputName === ACTUAL_HOURS && values.actualHours === '')) {
			return;
		}

		const weekNumbersPerScreen = getWeekNumbersPerScreen(months)
		let filteredWeeks = filterWeeksForFillForward(weekNumbersPerScreen, targetCweek, targetYear, inputName);
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

	const createEstimatedRef = (el: HTMLInputElement | null, rowIndex: number, cellIndex: number) => {
		if (el) {
			inputRefs.current[rowIndex][0][cellIndex] = el; // [0] For estimated inputs
		}
	};
	const createActualRef = (el: HTMLInputElement | null, rowIndex: number, cellIndex: number) => {
		if (el) {
			inputRefs.current[rowIndex][1][cellIndex] = el; // [1] For actual inputs
		}
	};


	return (
		<>
			<Formik
				onSubmit={(e) => upsertWorkWeekValues(e)}
				initialValues={initialValues}
				enableReinitialize
			>
				{({ handleChange, values, handleBlur, dirty }) => (
					<>
						<CustomInput
							className="sm:block hidden"
							value={values.estimatedHours || ''}
							name="estimatedHours"
							id={`estHours-${assignment?.id}-${cweek}-${year}`}
							onChange={handleChange}
							onBlur={(e) => {
								handleBlur("estimatedHours");
								if (dirty && values.estimatedHours) {
									upsertWorkWeekValues(values);
								}
							}}
							onFillForwardClick={() => onFillForwardClick(ESTIMATED_HOURS, cweek, year, values)}
							ref={(el: HTMLInputElement) => createEstimatedRef(el, rowIndex, cellIndex)}
							onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => tabbingAndArrowNavigation(e, rowIndex, cellIndex, inputRefs, totalRows, false)}
						/>
						{isPastOrCurrentWeek(cweek, year) && (<CustomInput
							value={values.actualHours || ''}
							name="actualHours"
							id={`actHours-${assignment?.id}-${cweek}-${year}`}
							onChange={handleChange}
							onBlur={(e) => {
								handleBlur("actualHours");
								if (dirty && values.actualHours) {
									upsertWorkWeekValues(values);
								}
							}}
							onFillForwardClick={() => onFillForwardClick(ACTUAL_HOURS, cweek, year, values)}
							disabled={isUserTBD}
							ref={(el: HTMLInputElement) => createActualRef(el, rowIndex, cellIndex)}
							onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => tabbingAndArrowNavigation(e, rowIndex, cellIndex, inputRefs, totalRows, true)}
						/>
						)}
					</>
				)}
			</Formik>
		</>
	);
};
