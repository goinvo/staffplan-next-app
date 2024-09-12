import { useRouter } from "next/navigation";

import {
	UserType,
	MonthsDataType,
	AllUserRowProps,
} from "@/app/typeInterfaces";

import React from "react";
import { ArchiveBoxIcon } from "@heroicons/react/24/outline";

import {
	calculateTotalHoursPerWeek,
} from "../scrollingCalendar/helpers";

import { AllUserLabel } from "./allUserLabel";
import ColumnChart from "../columnChart";
import { isBeforeWeek } from "../scrollingCalendar/helpers";
import IconButton from "../iconButton";

export const AllUserRow = ({
	user,
	isFirstMonth,
	months
}: AllUserRowProps) => {
	const router = useRouter();

	const { totalActualHours, totalEstimatedHours, proposedEstimatedHours, maxTotalHours } =
		calculateTotalHoursPerWeek(user.assignments, months as MonthsDataType[]);

	const handleUserChange = (user: UserType) => {
		if (user.id) {
			router.push("/people/" + encodeURIComponent(user.id));
		}
	};

	const hasActualHoursForWeek = (year: number, week: number) => {
		return !!totalActualHours[`${year}-${week}`];
	};

	return (
		<tr className="pl-5 flex border-b border-gray-300 hover:bg-hoverGrey">
			{isFirstMonth && (
				<AllUserLabel clickHandler={handleUserChange} user={user} />
			)}
			{months?.map((month: MonthsDataType) => {
				return month.weeks.map((week) => {
					return (
						<td key={`${month.monthLabel}-${week}`} className={`relative px-1 py-1 font-normal min-h-[100px]`}>
							<ColumnChart
								hasActualHoursForWeek={hasActualHoursForWeek(month.year, week)}
								height={
									hasActualHoursForWeek(month.year, week)
										? totalActualHours[`${month.year}-${week}`]
										: totalEstimatedHours[`${month.year}-${week}`]
								}
								proposedHours={proposedEstimatedHours[`${month.year}-${week}`]}
								maxValue={maxTotalHours}
								textColor="contrastBlue"
								isBeforeWeek={isBeforeWeek(week, month)}
							/>
						</td>
					);
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
