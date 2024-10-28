'use client'

import React from "react";
import { DateTime } from "luxon";
import { useRouter } from "next/navigation";

import UserSummary from "../userSummary";
import { UserLabel } from "./userLabel";
import { WorkWeekInput } from "./workWeekInput";
import { ClientLabel } from "./clientLabel";
import { TempProjectLabel } from "./tempProjectLabel";
import { currentWeek, currentYear } from "../scrollingCalendar/helpers";
import { AssignmentType, ClientType, MonthsDataType, UserType } from "@/app/typeInterfaces";
import { useMutation } from "@apollo/client";
import { UPSERT_ASSIGNMENT } from "../../gqlQueries";
import { useUserDataContext } from "@/app/contexts/userDataContext";

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
	const { refetchUserList, viewsFilterSingleUser } = useUserDataContext()
	const [upsertAssignment] = useMutation(UPSERT_ASSIGNMENT, {
		errorPolicy: "all",
		onCompleted() {
			refetchUserList();
		},
	});
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
	return (
		<tr
			className={`flex sm:justify-normal justify-between ${isFirstClient ? '' : 'border-b border-gray-300'} ${isAssignmentProposed ? 'bg-diagonal-stripes' :
				''
				} hover:bg-hoverGrey min-h-[100px] pl-5`}>
			<td className={`px-0 pt-1 pb-2 font-normal align-top ${!isFirstClient ? 'sm:block flex items-center' : ''} w-1/2 sm:w-1/3`}>
				<div
					className='flex sm:flex-row flex-col justify-between items-start md:space-x-2'
				>
					<div className={`${isTempProject ? '' : 'sm:w-24'} ${isFirstClient ? 'mb-1' : ''}`}>
						{viewsFilterSingleUser === 'byClient' && isFirstClient && isFirstMonth && (
							<ClientLabel assignment={assignment} selectedUser={selectedUser} />
						)}
						{viewsFilterSingleUser !== 'byClient' && isFirstMonth && (
							<ClientLabel assignment={assignment} selectedUser={selectedUser} />
						)}
					</div>
					{isFirstMonth && (
						isTempProject ? (
							<TempProjectLabel assignment={assignment} /> // Render custom label
						) : (
							<UserLabel assignment={assignment} clickHandler={handleProjectChange} />
						)
					)}
					<div className='text-contrastBlue sm:flex hidden flex-col space-y-3 ml-auto lg:px-2 items-end max-w-[60px] '>
						<button className='pt-2 underline' onClick={onChangeStatusButtonClick}>
							{isAssignmentProposed ? 'Proposed' : 'Signed'}
						</button>
						<div className='pt-2'>
							Actual
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
							<div className={`flex flex-col sm:justify-normal justify-center h-full sm:space-y-3 ${isCurrentWeek ? 'font-bold' : 'font-normal'}`}>
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
