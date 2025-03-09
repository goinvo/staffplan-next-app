'use client'

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { DateTime } from "luxon";

import { AssignmentType, MonthsDataType, ProjectType } from "@/app/typeInterfaces";
import UserSummary from "../userSummary";
import UndoRow from "../undoRow";
import { ProjectUserLabel } from "./projectUserLabel";
import { WorkWeekInput } from "./workWeekInput";
import { currentWeek, currentYear } from "../scrollingCalendar/helpers";
import { useUserDataContext } from "@/app/contexts/userDataContext";
import { useFadeInOutRow } from "@/app/hooks/useFadeInOutRow";
import { UNDO_ARCHIVED_OR_DELETED_PERSON, UNDO_DELETED_PERSON_TITLE } from "../constants/undoModifyStrings";

interface ProjectAssignmentRowProps {
	project: ProjectType;
	assignment: AssignmentType;
	isFirstMonth: boolean;
	isLastMonth: boolean;
	monthData: { monthLabel: string; year: number };
	months?: MonthsDataType[];
	rowIndex: number;
	totalRows: number;
	inputRefs: React.MutableRefObject<Array<[Array<HTMLInputElement | null>, Array<HTMLInputElement | null>]>>;
}

export const ProjectAssignmentRow = ({
	assignment,
	isFirstMonth,
	isLastMonth,
	project,
	months,
	rowIndex,
	inputRefs,
	totalRows
}: ProjectAssignmentRowProps) => {
	const router = useRouter();
	const [showUndoRow, setShowUndoRow] = useState<boolean>(false);
	const rowRef = useRef<HTMLTableRowElement>(null);
	const undoRowRef = useRef<HTMLTableRowElement>(null);
	const isUserTBD = assignment.assignedUser === null;
	const handleUserChange = (assignment: AssignmentType) => {
		const user = assignment.assignedUser.id?.toString();
		if (user) {
			router.push("/people/" + encodeURIComponent(user?.toString() || ""));
		}
	};
	const { assignmentsWithUndoActions, undoModifyAssignment } = useUserDataContext()
	const { animateRow } = useFadeInOutRow({ rowRef, setShowUndoRow, maxHeight: 80 })
	const isModifiedAssignment = (assignmentId: number) =>
		assignmentsWithUndoActions.some((item) => item.assignment.id === assignmentId);
	const isWeekWithinProject = (weekNumber: number, year: number) => {
		const weekDateFormatted = DateTime.fromObject({ weekNumber, weekYear: year, weekday: 1 }).toJSDate();
		if (project.startsOn && !project.endsOn) {
			const startsOn = new Date(project.startsOn);
			return weekDateFormatted >= startsOn;
		}
		if (project.startsOn && project.endsOn) {
			const startsOn = new Date(project.startsOn);
			const endsOn = new Date(project.endsOn);
			return weekDateFormatted >= startsOn && weekDateFormatted <= endsOn;
		}
		return true;
	};
	const handleUndoModifyAssignment = async () => {
		undoModifyAssignment(assignment.id)
		setShowUndoRow(false)
		setTimeout(() => animateRow(false), 10);
	}

	useEffect(() => {
		if (isModifiedAssignment(assignment.id)) {
			animateRow(true);
		}
	}, [assignmentsWithUndoActions, assignment.id]);


	if (showUndoRow && (isModifiedAssignment(assignment.id))) {
		const name = assignment.assignedUser ? assignment.assignedUser.name.split(' ')[0] : "person"
		return (
			<tr ref={undoRowRef} className="flex justify-center" key={`undo-${assignment.id}`}>
				<UndoRow onClick={handleUndoModifyAssignment} title={UNDO_DELETED_PERSON_TITLE.replace("{name}",name)}/>
			</tr>
		)
	}

	return (
		<tr ref={rowRef} key={`assignment-${assignment.id}`} className={`${isUserTBD ? 'sm:flex hidden' : 'flex'} border-b border-gray-300 hover:bg-hoverGrey ${assignment.status === 'proposed' ? 'bg-diagonal-stripes' :
			''} pl-5`}>
			{isFirstMonth && (
				<ProjectUserLabel
					project={project}
					assignment={assignment}
					clickHandler={handleUserChange}
					undoRowRef={undoRowRef}
				/>
			)}
			{months?.map((month: MonthsDataType, monthIndex) => {
				const previousWeeksCount = months.slice(0, monthIndex).reduce((acc, month) => acc + month.weeks.length, 1);
				return month.weeks.map((week, weekIndex) => {
					const withinProjectDates = isWeekWithinProject(week.weekNumberOfTheYear, month.year);
					const cellIndex = previousWeeksCount + weekIndex;
					if (!inputRefs.current[rowIndex]) {
						inputRefs.current[rowIndex] = [[], []];
					}
					const isCurrentWeek = currentWeek === week.weekNumberOfTheYear && currentYear === month.year
					return (
						<td key={`${month.monthLabel}-${week.weekNumberOfTheYear}-${monthIndex}`}
							className={`relative px-1 py-1 font-normal ${currentWeek === week.weekNumberOfTheYear && currentYear === month.year && 'bg-selectedColumnBg'}`}
						>
							<div
								className={`flex flex-col sm:justify-normal justify-center h-full sm:space-y-3 ${isCurrentWeek ? 'font-bold' : 'font-normal'}`}>
								<WorkWeekInput
									isUserTBD={isUserTBD}
									withinProjectDates={withinProjectDates}
									assignment={assignment}
									project={project}
									cweek={week.weekNumberOfTheYear}
									monthLabel={month.monthLabel}
									year={month.year}
									key={`input-${week.weekNumberOfTheYear}`}
									months={months}
									rowIndex={rowIndex}
									cellIndex={cellIndex}
									inputRefs={inputRefs}
									totalRows={totalRows}
								/>

							</div>
						</td>)
				});
			})}
			{isLastMonth && <UserSummary assignment={assignment} project={project} />}
		</tr >
	);
};
