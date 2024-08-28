import React from "react";
import { useRouter } from "next/navigation";
import { DateTime } from "luxon";

import { AssignmentType, MonthsDataType, ProjectType } from "@/app/typeInterfaces";
import UserSummary from "../userSummary";
import { ProjectUserLabel } from "./projectUserLabel";
import { WorkWeekInput } from "./workWeekInput";


interface ProjectAssignmentRowProps {
	project: ProjectType;
	assignment: AssignmentType;
	isFirstMonth: boolean;
	isLastMonth: boolean;
	monthData: { monthLabel: string; year: number };
	months?: MonthsDataType[]
}

export const ProjectAssignmentRow = ({
	assignment,
	isFirstMonth,
	isLastMonth,
	project,
	months
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
		<tr className="px-2 py-2 flex border-b border-gray-300 hover:bg-hoverGrey">
			{isFirstMonth && (
				<ProjectUserLabel
					project={project}
					assignment={assignment}
					clickHandler={handleUserChange}
				/>
			)}
			{months?.map((month: MonthsDataType) => {
				return month.weeks.map((week) => {
					const withinProjectDates = isWeekWithinProject(week, month.year);
					return (
						<td key={`${month.monthLabel}-${week}`} className={`relative px-1 py-1 font-normal`}>
							<div className='flex flex-col space-y-3 font-normal'>
								<WorkWeekInput
									isUserTBD={isUserTBD}
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
		</tr>
	);
};
