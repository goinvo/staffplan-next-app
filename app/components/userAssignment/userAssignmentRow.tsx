'use client'

import React, { useState, useRef, useEffect } from "react";
import { DateTime } from "luxon";
import { useRouter } from "next/navigation";

import UserSummary from "../userSummary";
import { UserLabel } from "./userLabel";
import { WorkWeekInput } from "./workWeekInput";
import { ClientLabel } from "./clientLabel";
import { TempProjectLabel } from "./tempProjectLabel";
import { currentWeek, currentYear } from "../scrollingCalendar/helpers";
import { AssignmentType, MonthsDataType, UserType } from "@/app/typeInterfaces";
import { useMutation } from "@apollo/client";
import { UPSERT_ASSIGNMENT } from "../../gqlQueries";
import { useUserDataContext } from "@/app/contexts/userDataContext";
import UndoRow from "../undoRow";
import { UNDO_ARCHIVED_OR_DELETED_PROJECT } from "../constants/undoModifyStrings";
import { useFadeInOutRow } from "@/app/hooks/useFadeInOutRow";
import { mergeClasses } from "@/app/helperFunctions";

interface UserAssignmentRowProps {
	assignment: AssignmentType;
	isFirstMonth: boolean;
	isLastMonth: boolean;
	isFirstClient: boolean;
	months?: MonthsDataType[];
	selectedUser: UserType;
	rowIndex: number;
	totalRows: number;
	inputRefs: React.MutableRefObject<Array<[Array<HTMLInputElement | null>, Array<HTMLInputElement | null>]>>;
}

export const UserAssignmentRow = ({
	assignment,
	isFirstMonth,
	isLastMonth,
	isFirstClient,
	months,
	selectedUser,
	rowIndex,
	inputRefs,
	totalRows
}: UserAssignmentRowProps) => {
	const router = useRouter();
	const { sortBy, newProjectAssignmentId, setNewProjectAssignmentId, refetchUserList, viewsFilterSingleUser, assignmentsWithUndoActions, undoModifyAssignment } = useUserDataContext()

	const [showUndoRow, setShowUndoRow] = useState<boolean>(false);
	const rowRef = useRef<HTMLTableRowElement>(null);
	const undoRowRef = useRef<HTMLTableRowElement>(null);
	const isModifiedAssignment = (assignmentId: number) =>
		assignmentsWithUndoActions.some((item) => item.assignment.id === assignmentId);

	const { animateRow } = useFadeInOutRow({ rowRef, setShowUndoRow });
	const [upsertAssignment] = useMutation(UPSERT_ASSIGNMENT, {
		errorPolicy: "all",
		onCompleted() {
			refetchUserList();
		},
	});

	useEffect(() => {
			if (newProjectAssignmentId) {
				setTimeout(() => {setNewProjectAssignmentId(null)}, 1000)
			}
	}, [newProjectAssignmentId]);
	
	const handleProjectChange = (assignment: AssignmentType) => {
		router.push("/projects/" + assignment.project.id);
	};

	const isWeekWithinProject = (weekNumber: number, year: number): boolean => {
		const weekDateFormatted = DateTime.fromObject({ weekNumber, weekYear: year, weekday: 1 }).toJSDate();
		if (assignment.project.startsOn && !assignment.project.endsOn) {
			const startsOn = new Date(assignment.project.startsOn);
			return weekDateFormatted >= startsOn;
		}
		if (assignment.project.startsOn && assignment.project.endsOn) {
			const startsOn = new Date(assignment.project.startsOn);
			const endsOn = new Date(assignment.project.endsOn);
			return weekDateFormatted >= startsOn && weekDateFormatted <= endsOn;
		}
		return true;
	};

	const handleUndoModifyAssignment = async () => {
		undoModifyAssignment(assignment.id)
		setShowUndoRow(false)
		setTimeout(() => animateRow(false), 10);
	}

	const onChangeStatusButtonClick = async () => {
		const variables = {
			id: assignment.id,
			projectId: assignment?.project.id,
			userId: selectedUser.id,
			status: assignment.status === "active" ? "proposed" : "active",
		};

		await upsertAssignment({
			variables
		})

	}
	const isAssignmentProposed = assignment.status === 'proposed'
	const isTempProject = assignment.project.isTempProject

	useEffect(() => {
		const runAnimation = async () => {
			if (isModifiedAssignment(assignment.id)) {
				await animateRow(true);
			}
		};

		runAnimation();
	}, [assignmentsWithUndoActions, assignment.id])

	if (showUndoRow && (isModifiedAssignment(assignment.id))) {
		return (
			<tr ref={undoRowRef} className="flex justify-center" key={`undo-${assignment.id}`}>
				<UndoRow onClick={handleUndoModifyAssignment} title={UNDO_ARCHIVED_OR_DELETED_PROJECT} />
			</tr>
		)
	}

	const sortedByClient = sortBy === "Client";
	const isFirstRow = rowIndex === 0;
	const isLastRow = rowIndex === totalRows - 1;
	/* const rowClasses = mergeClasses(
		'flex sm:justify-normal justify-between bg-white-300 hover:bg-hoverGrey pl-5',
		{ 'border-t border-gray-300': isFirstClient && sortedByClient && !isFirstRow },
		{ 'border-b border-gray-300': !sortedByClient || isLastRow },
		{ 'bg-diagonal-stripes': isAssignmentProposed }
	); */

	return (
		<tr
			ref={rowRef}
			key={`assignment-${assignment.id}`}
			className={`flex sm:justify-normal justify-between bg-white-300 hover:bg-hoverGrey pl-5
				${isAssignmentProposed ? 'bg-diagonal-stripes' : ''}
				${(isFirstClient && sortedByClient && !isFirstRow) ? 'border-t border-gray-300' : ''}
				${(!sortedByClient && isFirstRow) ? 'border-t-0' : ''}
				${((!sortedByClient && isLastRow) || !sortedByClient) ? 'border-t border-gray-300' : ''}
				${newProjectAssignmentId === Number(assignment.project.id) ? 'animate-fadeInScale' : ''}`}
		>
			<td className={`pl-3 sm:px-0 py-1 sm:pt-1 sm:pb-2 font-normal align-top ${!isFirstClient ? 'sm:block flex items-center' : 'pt-5'} w-1/2 sm:w-2/5`}>
				<div
					className='flex sm:flex-row flex-col w-full justify-between items-start '
				>
					<div className={`${isTempProject ? '' : 'sm:max-w-[70px] md:max-w-[110px] lg:max-w-[130px] w-full pl-[2px] sm:mr-1 md:mr-0'} ${isFirstClient ? 'mb-1' : ''}`}>
						{sortedByClient && isFirstClient && isFirstMonth && (
							<ClientLabel assignment={assignment} selectedUser={selectedUser} />
						)}
						{!sortedByClient && isFirstMonth && (
							<ClientLabel assignment={assignment} selectedUser={selectedUser} />
						)}
						{/* {!isTempProject && <ClientLabel assignment={assignment} selectedUser={selectedUser} />} */}
					</div>
					<div className={`flex justify-between sm:max-w-[260px] w-full`}>
						{isFirstMonth && (
						isTempProject ? (
							<TempProjectLabel assignment={assignment} /> // Render custom label
						) : (
							<UserLabel assignment={assignment} selectedUser={selectedUser} clickHandler={handleProjectChange} undoRowRef={undoRowRef} isFirstClient={isFirstClient} />
						)
					)}
            <div
              className={`text-contrastBlue sm:flex hidden pr-2 sm:pr-1 md:pr-2 flex-col items-end  ${
                isAssignmentProposed
                  ? "max-w-[75px] w-full"
                  : "max-w-[55px] w-full"
              }`}
            >
              <button
                className="pt-2 underline"
                onClick={onChangeStatusButtonClick}
              >
                {isAssignmentProposed ? "Proposed" : "Plan"}
              </button>
              <div className="pt-5">Actual</div>
            </div>
          </div>
				</div>
			</td>
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
						<td key={`${assignment.id}-${month.monthLabel}-${week.weekNumberOfTheYear}`}
							className={`relative px-1 py-1 font-normal ${isCurrentWeek ? 'bg-selectedColumnBg' : ''}`}

						>
							<div className={`flex flex-col sm:justify-normal justify-center h-full sm:space-y-3 ${isCurrentWeek ? 'font-bold' : 'font-normal'} ${isFirstClient ? 'pt-5 sm:pt-0' : ''}`}>
								<WorkWeekInput
									withinProjectDates={withinProjectDates}
									assignment={assignment}
									cweek={week.weekNumberOfTheYear}
									year={month.year}
									key={`input-${assignment.id}-${month.monthLabel}-${week.weekNumberOfTheYear}`}
									months={months}
									monthLabel={month.monthLabel}
									rowIndex={rowIndex}
									cellIndex={cellIndex}
									inputRefs={inputRefs}
									totalRows={totalRows}
								/>

							</div>
						</td>)
				});
			})}
			{isLastMonth && <UserSummary assignment={assignment} selectedUser={selectedUser} />}
		</tr >
	);
};
