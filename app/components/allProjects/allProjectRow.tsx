import {
	ProjectType,
	AllProjectRowProps,
	MonthsDataType,
} from "@/app/typeInterfaces";

import React from "react";
import {
	assignmentContainsCWeek,
} from "../scrollingCalendar/helpers";
import { useRouter } from "next/navigation";
import { AllProjectLabel } from "./allProjectLabel";
import ProjectSummary from "../projectSummary";
import ColumnChart from "../columnChart";
import { isBeforeWeek, getCurrentWeekOfYear, getCurrentYear, getDisplayHours } from "../scrollingCalendar/helpers";

interface Accumulator {
	[cweek: number]: {
		cweek: number;
		actualHours: number;
		estimatedHours: number;
		year: number;
	};
}
export const AllProjectRow = ({
	project,
	isFirstMonth,
	isLastMonth,
	months,
}: AllProjectRowProps) => {
	const router = useRouter();
	const currentWeek = getCurrentWeekOfYear()
	const currentYear = getCurrentYear()

	const handleProjectChange = (project: ProjectType) => {
		if (project.id) {
			router.push("/projects/" + encodeURIComponent(project.id));
		}
	};


	const totalWorkWeekHours = Object.values(
		(project.assignments ?? []).reduce<Accumulator>((acc, assignment) => {
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
		}, {})
	);

	const maxHoursPerWeek = totalWorkWeekHours.reduce((max, current) => {
		return current.actualHours > max ? current.actualHours : max;
	}, 0);

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
					const totalEstimatedWeeklyHours = project.assignments?.reduce(
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
					const displayHours = getDisplayHours(workWeek, totalEstimatedWeeklyHours as number);
					return (
						<td key={`${month.monthLabel}-${week}`} className={`relative px-1 py-1 font-normal min-h-[100px]`}>
							<ColumnChart height={displayHours} isBeforeWeek={isBeforeWeek(week, currentWeek, currentYear, month)} maxValue={maxHoursPerWeek} textColor="contrastBlue" />
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

