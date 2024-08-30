'use client'

import { AssignmentType, ClientType, MonthsDataType } from "@/app/typeInterfaces";
import { useUserDataContext } from "@/app/userDataContext";
import React, { useState } from "react";
import { DateTime } from "luxon";
import { useRouter } from "next/navigation";

import UserSummary from "../userSummary";
import { UserLabel } from "./userLabel";
import { WorkWeekInput } from "./workWeekInput";
import { ClientLabel } from "./clientLabel";
import { TempProjectLabel } from "./tempProjectLabel";


interface UserAssignmentRowProps {
	assignment: AssignmentType;
	isFirstMonth: boolean;
	isLastMonth: boolean;
	isFirstClient: boolean;
	monthData: { monthLabel: string; year: number };
	clickHandler: (client: ClientType) => void;
	months?: MonthsDataType[];
	selectedColumn?: string | null;
	handleCellClick?: (monthLabel: string | null, week: number | null) => void
}

export const UserAssignmentRow = ({
	assignment,
	isFirstMonth,
	isLastMonth,
	isFirstClient,
	clickHandler,
	months,
	selectedColumn,
	handleCellClick
}: UserAssignmentRowProps) => {
	const router = useRouter();
	const [tempProjectOpen, setTempProjectOpen] = useState(false)
	const { viewsFilter } = useUserDataContext();

	const handleProjectChange = (assignment: AssignmentType) => {
		router.push("/projects/" + encodeURIComponent(assignment.project.id));
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

	return (
		<tr
			className={`flex ${isFirstClient ? '' : 'border-b border-gray-300'} ${assignment.status === 'proposed' ? 'bg-diagonal-stripes' :
				''
				} hover:bg-hoverGrey min-h-[100px]`}>
			<td className='pl-2 pr-0 pt-1 pb-2 font-normal align-top w-1/3'>
				<div
					className='flex flex-row justify-between items-start space-x-2'
				>
					<div className={`${isFirstClient ? 'flex' : 'w-24'}`}>
						{viewsFilter.singleUserSort === 'byClient' && isFirstClient && isFirstMonth && (
							<ClientLabel assignment={assignment} clickHandler={clickHandler} tempProjectOpen={tempProjectOpen} setTempProjectOpen={setTempProjectOpen} />
						)}
						{viewsFilter.singleUserSort !== 'byClient' && isFirstMonth && (
							<ClientLabel assignment={assignment} clickHandler={clickHandler} tempProjectOpen={tempProjectOpen} setTempProjectOpen={setTempProjectOpen} />
						)}
					</div>
					{isFirstMonth && (
						assignment.project.isTempProject ? (
							<TempProjectLabel assignment={assignment} tempProjectOpen={tempProjectOpen} setTempProjectOpen={setTempProjectOpen} /> // Render custom label
						) : (
							<UserLabel assignment={assignment} clickHandler={handleProjectChange} />
						)
					)}
					<div className='text-contrastBlue flex flex-col space-y-3 pr-2'>
						<div className='pt-2 underline'>
							Signed
						</div>
						<div className='pt-2'>
							Actual
						</div>
					</div>
				</div>
			</td>
			{months?.map((month: MonthsDataType, index) => {
				return month.weeks.map((week) => {
					const withinProjectDates = isWeekWithinProject(week, month.year);
					const columnIdentifier = `${month.monthLabel}-${week}`;
					return (
						<td key={`${month.monthLabel}-${week}`}
							className={`relative px-1 py-1 font-normal ${selectedColumn === columnIdentifier ? 'bg-selectedColumnBg' : ''}`}

						>
							<div className={`flex flex-col space-y-3 ${selectedColumn === columnIdentifier ? 'font-bold' : 'font-normal'}`}
								onClick={() => handleCellClick?.(month.monthLabel, week)}
								onBlur={() => handleCellClick?.(null, null)}>
								<WorkWeekInput
									withinProjectDates={withinProjectDates}
									assignment={assignment}
									cweek={week}
									year={month.year}
									key={`input-${week}`}
								/>

							</div>
						</td>)
				});
			})}
			{isLastMonth && <UserSummary assignment={assignment} />}
		</tr >
	);
};
