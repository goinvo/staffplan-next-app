import {
	ProjectType,
	AllProjectRowProps,
	WorkWeekType,
} from "@/app/typeInterfaces";
import { useUserDataContext } from "@/app/userDataContext";
import React from "react";
import {
	assignmentContainsCWeek,
	getMondays,
} from "../weekDisplayPrototype/helpers";
import { DateTime } from "luxon";
import { useRouter } from "next/navigation";
import { AllProjectLabel } from "./allProjectLabel";
import ProjectSummary from "../projectSummary";

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
	monthData,
}: AllProjectRowProps) => {
	const router = useRouter();
	const { dateRange } = useUserDataContext();
	const mondays = getMondays(
		DateTime.local(dateRange.year, parseInt(monthData.monthLabel), 1).startOf(
			"day"
		)
	);
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

	return (
		<div className="flex">
			{isFirstMonth && (
				<AllProjectLabel clickHandler={handleProjectChange} project={project} />
			)}
			<div className="flex border-b ml-1 border-gray-300 justify-between w-full h-28">
				{mondays.cweeks.map((cweek, cweekIndex) => {
					const totalEstimatedWeeklyHours = project.assignments?.reduce(
						(acc, assignment) => {
							if (
								assignmentContainsCWeek(assignment, cweek as any, mondays.year)
							) {
								return acc + assignment.estimatedWeeklyHours;
							}
							return acc;
						},
						0
					);
					const workWeekElements = totalWorkWeekHours.map(
						(workWeek, workWeekIndex) => {
							if (
								(workWeek as WorkWeekType).cweek === cweek &&
								(workWeek as any).year === mondays.year
							) {
								if ((workWeek as any).actualHours > 0) {
									return (
										<div
											key={`${cweek}has-actual-hours`}
											className="bg-red-200 w-8 h-8 justify-center rounded-full items-center"
										>
											{(workWeek as any).actualHours}
										</div>
									);
								}
								if ((workWeek as any).actualHours <= 0) {
									return (
										<div
											key={`${cweek}${(workWeek as any).year}no-actual-hours`}
											className="bg-blue-200 w-8 h-8 justify-center rounded-full items-center"
										>
											{(workWeek as any).estimatedHours}
										</div>
									);
								}
							}
							return null;
						}
					);

					const hasWorkWeek = workWeekElements.some(
						(element) => element !== null
					);

					return (
						<div
							key={`cweek-${cweekIndex}`}
							className="flex-1 flex flex-col justify-center items-center border-r border-gray-300"
						>
							{hasWorkWeek && (project.assignments ?? []).length > 0 ? (
								workWeekElements
							) : (
								<div
									className="bg-green-200 w-8 h-8 justify-center rounded-full items-center"
									key={`${cweek}total-estimated-weekly-hours`}
								>
									{totalEstimatedWeeklyHours}
								</div>
							)}
						</div>
					);
				})}
			</div>
			{isLastMonth && (
				<div>
					<ProjectSummary project={project} />
				</div>
			)}
		</div>
	);
};
