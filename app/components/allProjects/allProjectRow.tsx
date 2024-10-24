import {
	ProjectType,
	AllProjectRowProps,
	MonthsDataType,
	AssignmentType,
} from "@/app/typeInterfaces";

import React from "react";
import { useRouter } from "next/navigation";
import { AllProjectLabel } from "./allProjectLabel";
import ProjectSummary from "../projectSummary";
import ColumnChart from "../columnChart";
import { calculateTotalHoursPerWeek, isBeforeWeek, currentWeek, currentYear } from "../scrollingCalendar/helpers";

export const AllProjectRow = ({
	project,
	isFirstMonth,
	isLastMonth,
	months,
}: AllProjectRowProps) => {
	const router = useRouter();
	const { totalActualHours, totalEstimatedHours, proposedEstimatedHours, maxTotalHours } =
		calculateTotalHoursPerWeek(project.assignments as AssignmentType[], months as MonthsDataType[]);

	const handleProjectChange = (project: ProjectType) => {
		if (project.id) {
			router.push("/projects/" + encodeURIComponent(project.id));
		}
	};
	const hasActualHoursForWeek = (year: number, week: number) => {
		return !!totalActualHours[`${year}-${week}`];
	};

	return (
		<tr className={`pl-5 flex sm:justify-normal justify-between border-b border-gray-300 hover:bg-hoverGrey ${project.status === 'proposed' ? 'bg-diagonal-stripes' :
			''
			}`}>
			<td className='sm:block flex items-center pt-1 pb-2 px-0 font-normal align-top w-1/2 sm:w-1/3'>
				{isFirstMonth && (
					<AllProjectLabel clickHandler={handleProjectChange} project={project} />

				)}
			</td>
			{
				months?.map((month: MonthsDataType) => (
					month.weeks.map((week) => {
						const isCurrenWeek = currentWeek === week.weekNumberOfTheYear && currentYear === month.year
						return (
							<td key={`${month.monthLabel}-${week.weekNumberOfTheYear}`} className={`relative px-1 py-1 min-h-[100px] ${isCurrenWeek ? 'bg-selectedColumnBg font-bold' : ''}`}>
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
					})
				))
			}

			{
				isLastMonth && (
					<ProjectSummary project={project} />
				)
			}
		</tr >
	);
};

