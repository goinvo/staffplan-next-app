import {
	ProjectType,
	AllProjectRowProps,
	MonthsDataType,
	AssignmentType,
} from "@/app/typeInterfaces";

import React from "react";
import {
	calculateTotalHoursPerWeek,
	isBeforeWeek,
} from "../scrollingCalendar/helpers";
import { useRouter } from "next/navigation";
import { AllProjectLabel } from "./allProjectLabel";
import ProjectSummary from "../projectSummary";
import ColumnChart from "../columnChart";

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
		<tr className={`pl-5 flex border-b border-gray-300 hover:bg-hoverGrey ${project.status === 'proposed' ? 'bg-diagonal-stripes' :
			''
			}`}>
			<td className='pt-1 pb-2 px-0 font-normal align-top w-1/3'>
				{isFirstMonth && (
					<AllProjectLabel clickHandler={handleProjectChange} project={project} />

				)}
			</td>
			{months?.map((month: MonthsDataType) => (
				month.weeks.map((week) => {
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
						</td>)
				})
			))}

			{isLastMonth && (
				<ProjectSummary project={project} />
			)
			}
		</tr >
	);
};

