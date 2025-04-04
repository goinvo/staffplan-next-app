import { useRouter } from "next/navigation";

import {
	UserType,
	MonthsDataType,
	AllUserRowProps,
} from "@/app/typeInterfaces";

import React from "react";
import { ArchiveBoxIcon } from "@heroicons/react/24/outline";

import { AllUserLabel } from "./allUserLabel";
import ColumnChart from "../columnChart";
import { calculateTotalHoursPerWeek, currentYear, currentWeek, isBeforeWeek } from "../scrollingCalendar/helpers";
import IconButton from "../iconButton";
import { useGeneralDataContext } from "@/app/contexts/generalContext";

export const AllUserRow = ({
	user,
	isFirstMonth,
	months
}: AllUserRowProps) => {
	const router = useRouter();
	const nonArchivedAssignments = user.assignments.filter(assignment => assignment.project.status !== 'archived')
	const { totalActualHours, totalEstimatedHours, proposedEstimatedHours, maxTotalHours } =
		calculateTotalHoursPerWeek(nonArchivedAssignments, months as MonthsDataType[]);
	const { viewer, isFirstShowInactiveUsers, isFirstHideInactiveUsers } = useGeneralDataContext();

	const handleUserChange = (user: UserType) => {
		if (user.id) {
			router.push("/people/" + encodeURIComponent(user.id));
		}
	};

	const hasActualHoursForWeek = (year: number, week: number) => {
		return !!totalActualHours[`${year}-${week}`];
	};

	return (
		<tr className={`pl-5 flex sm:justify-normal justify-between border-b border-gray-300 hover:bg-hoverGrey
		${(isFirstShowInactiveUsers && !user.isActive) ? 'animate-fadeInScale' : ''}
		${(isFirstHideInactiveUsers && !user.isActive) ? 'animate-fadeOutScale' : ''}`}>
			{isFirstMonth && (
				<AllUserLabel clickHandler={handleUserChange} user={user} />
			)}
			{months?.map((month: MonthsDataType) => {
				return month.weeks.map((week) => {
					const isCurrentWeek = currentWeek === week.weekNumberOfTheYear && currentYear === month.year
					return (
						<td key={`${month.monthLabel}-${week.weekNumberOfTheYear}`} className={`relative px-1 py-1 min-h-[100px] ${isCurrentWeek ? 'bg-selectedColumnBg font-bold' : ''}`}>
							<ColumnChart
								hasActualHoursForWeek={hasActualHoursForWeek(month.year, week.weekNumberOfTheYear)}
								height={
									hasActualHoursForWeek(month.year, week.weekNumberOfTheYear)
										? totalActualHours[`${month.year}-${week.weekNumberOfTheYear}`]
										: totalEstimatedHours[`${month.year}-${week.weekNumberOfTheYear}`]
								}
								proposedHours={proposedEstimatedHours[`${month.year}-${week.weekNumberOfTheYear}`]}
								maxValue={maxTotalHours}
								textColor="contrastBlue"
								isBeforeWeek={isBeforeWeek(week.weekNumberOfTheYear, month)}
							/>
						</td>)
				});
			})}
			<td className="flex items-center justify-center font-normal py-2 pr-5 pl-0 sm:w-1/6 w-1/2">
			</td>
		</tr>
	);
};