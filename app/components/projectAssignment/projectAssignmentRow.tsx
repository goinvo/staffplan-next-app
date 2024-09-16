import React from "react";
import { useRouter } from "next/navigation";
import { DateTime } from "luxon";

import { AssignmentType, MonthsDataType, ProjectType } from "@/app/typeInterfaces";
import UserSummary from "../userSummary";
import { ProjectUserLabel } from "./projectUserLabel";
import { WorkWeekInput } from "./workWeekInput";
import { currentWeek, currentYear } from "../scrollingCalendar/helpers";


interface ProjectAssignmentRowProps {
	project: ProjectType;
	assignment: AssignmentType;
	isFirstMonth: boolean;
	isLastMonth: boolean;
	monthData: { monthLabel: string; year: number };
	months?: MonthsDataType[];
}

export const ProjectAssignmentRow = ({
	assignment,
	isFirstMonth,
	isLastMonth,
	project,
	months,
}: ProjectAssignmentRowProps) => {
	const router = useRouter();

	const isUserTBD = assignment.assignedUser === null;
	const handleUserChange = (assignment: AssignmentType) => {
		const user = assignment.assignedUser.id?.toString();
		if (user) {
			router.push("/people/" + encodeURIComponent(user?.toString() || ""));
		}
	};
	const isWeekWithinProject = (weekNumber: number, year: number) => {
		const weekDateFormatted = DateTime.fromObject({ weekNumber, weekYear: year, weekday: 1 }).toJSDate();
		if (project.startsOn && !project.endsOn) {
			const startsOn = new Date(project.startsOn);
			return weekDateFormatted >= startsOn;
		}
		if (project.startsOn && project.endsOn) {
			const startsOn = new Date(project.startsOn);
			const endsOn = new Date(project.endsOn);
			return weekDateFormatted >= startsOn && weekDateFormatted <= endsOn;
		}
		return true;
	};


	return (
		<tr className={`flex border-b border-gray-300 hover:bg-hoverGrey min-h-[100px] ${assignment.status === 'proposed' ? 'bg-diagonal-stripes' :
			''
			} pl-5`}>
			{isFirstMonth && (
				<ProjectUserLabel
					project={project}
					assignment={assignment}
					clickHandler={handleUserChange}
				/>
			)}
			{months?.map((month: MonthsDataType) => {
				return month.weeks.map((week) => {
					const withinProjectDates = isWeekWithinProject(week.weekNumberOfTheYear, month.year);
					return (
						<td key={`${month.monthLabel}-${week.weekNumberOfTheYear}`}
							className={`relative px-1 py-1 font-normal ${currentWeek === week.weekNumberOfTheYear && currentYear === month.year && 'bg-selectedColumnBg'}`}
						>
							<div
								className={`flex flex-col space-y-3 ${currentWeek === week.weekNumberOfTheYear && currentYear === month.year ? 'font-bold' : 'font-normal'}`}>
								<WorkWeekInput
									isUserTBD={isUserTBD}
									withinProjectDates={withinProjectDates}
									assignment={assignment}
									cweek={week.weekNumberOfTheYear}
									year={month.year}
									key={`input-${week.weekNumberOfTheYear}`}
								/>

							</div>
						</td>)
				});
			})}
			{isLastMonth && <UserSummary assignment={assignment} />}
		</tr >
	);
};
