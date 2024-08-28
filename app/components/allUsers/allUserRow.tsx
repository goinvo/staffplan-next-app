import { useRouter } from "next/navigation";

import {
	UserType,
	MonthsDataType,
	AllUserRowProps,
	AllUserAccumulatorProps,
} from "@/app/typeInterfaces";

import React from "react";
import { ArchiveBoxIcon } from "@heroicons/react/24/outline";

import {
	assignmentContainsCWeek,
} from "../scrollingCalendar/helpers";

import { AllUserLabel } from "./allUserLabel";
import ColumnChart from "../columnChart";
import { getCurrentWeekOfYear, getCurrentYear, isBeforeWeek, getDisplayHours } from "../scrollingCalendar/helpers";
import IconButton from "../iconButton";

export const AllUserRow = ({
	user,
	isFirstMonth,
	isLastMonth,
	monthData,
	months
}: AllUserRowProps) => {
	const currentWeek = getCurrentWeekOfYear()
	const currentYear = getCurrentYear()
	const router = useRouter();

	const handleUserChange = (user: UserType) => {
		if (user.id) {
			router.push("/people/" + encodeURIComponent(user.id));
		}
	};

	const totalWorkWeekHours = Object.values(
		(user.assignments ?? []).reduce<AllUserAccumulatorProps>(
			(acc, assignment) => {
				assignment.workWeeks.forEach((workWeek) => {
					const cweek = workWeek.cweek;
					const actualHours = workWeek.actualHours ?? 0;
					const estimatedHours = workWeek.estimatedHours ?? 0;
					if (!acc[cweek]) {
						acc[cweek] = {
							cweek,
							actualHours: 0,
							estimatedHours: 0,
							year: workWeek.year,
						};
					}
					acc[cweek].actualHours += actualHours;
					acc[cweek].estimatedHours += estimatedHours;
				});

				return acc;
			},
			{}
		)
	);

	return (
		<tr className="px-2 flex border-b border-gray-300 hover:bg-hoverGrey">
			{isFirstMonth && (
				<AllUserLabel clickHandler={handleUserChange} user={user} />
			)}
			{months?.map((month: MonthsDataType) => {
				return month.weeks.map((week) => {
					const totalEstimatedWeeklyHours = user.assignments?.reduce(
						(acc, assignment) => {
							if (
								assignmentContainsCWeek(assignment, week, month.year)
							) {
								return acc + assignment.estimatedWeeklyHours;
							}
							return acc;
						},
						0
					);
					const workWeek = totalWorkWeekHours.find(
						(workWeek) => workWeek.cweek === week && workWeek.year === month.year
					);
					const displayHours = getDisplayHours(workWeek, totalEstimatedWeeklyHours);
					return (
						<td key={`${month.monthLabel}-${week}`} className={`relative px-1 py-1 font-normal min-h-[100px]`}>
							<ColumnChart height={displayHours} color={isBeforeWeek(week, currentWeek, currentYear, month) ? '#AEB3C0' : '#27B5B0'} maxValue={200} textColor="contrastBlue" />
						</td>)
				});
			})}
			<td className="flex items-center justify-center font-normal py-2 w-1/6">
				<IconButton className='text-transparentGrey'
					onClick={() => console.log('On archive box btn click')}
					Icon={ArchiveBoxIcon}
					iconSize={'h6 w-6'} />
			</td>
		</tr>
	);
};
