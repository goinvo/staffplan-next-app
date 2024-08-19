import { AssignmentType, ProjectType } from "@/app/typeInterfaces";
import { useUserDataContext } from "@/app/userDataContext";
import React from "react";
import { getMondays } from "../scrollingCalendar/helpers";
import { DateTime } from "luxon";
import { useRouter } from "next/navigation";
import UserSummary from "../userSummary";
import { ProjectUserLabel } from "./projectUserLabel";
import { WorkWeekInput } from "./workWeekInput";

interface ProjectAssignmentRowProps {
	project: ProjectType;
	assignment: AssignmentType;
	isFirstMonth: boolean;
	isLastMonth: boolean;
	monthData: { monthLabel: string; year: number };
}

export const ProjectAssignmentRow = ({
	assignment,
	isFirstMonth,
	isLastMonth,
	monthData,
	project,
}: ProjectAssignmentRowProps) => {
	const router = useRouter();
	const { dateRange } = useUserDataContext();
	const mondays = getMondays(
		DateTime.local(dateRange.year, parseInt(monthData.monthLabel), 1).startOf(
			"day"
		)
	);
	const isUserTBD = assignment.assignedUser === null;
	const handleUserChange = (assignment: AssignmentType) => {
		const user = assignment.assignedUser.id?.toString();
		if (user) {
			router.push("/people/" + encodeURIComponent(user?.toString() || ""));
		}
	};

	const isWeekWithinProject = (weekDate: Date) => {
		const weekDateFormatted = new Date(weekDate);
		if (project.startsOn && !project.endsOn) {
			const startsOn = new Date(project.startsOn);
			return weekDateFormatted >= startsOn;
		}
		if (project.startsOn && project.endsOn) {
			const startsOn = new Date(project.startsOn);
			const endsOn = new Date(project.endsOn);
			return weekDateFormatted >= startsOn && weekDate <= endsOn;
		}
		return true;
	};

	return (
		<div className="flex">
			{isFirstMonth && (
				<ProjectUserLabel
					project={project}
					assignment={assignment}
					clickHandler={handleUserChange}
				/>
			)}
			<div className="flex border-b ml-1 border-gray-300 justify-between w-full h-32">
				{mondays.cweeks.map((cweek, cweekIndex) => {
					const mondayDate = DateTime.fromObject({
						weekNumber: cweek ? cweek : 1,
						weekYear: mondays.year,
						weekday: 1,
					}).toJSDate();
					return (
						<div
							key={`cweek-${cweekIndex}`}
							className="flex-1 flex flex-col items-center"
						>
							<WorkWeekInput
								
								isUserTBD={isUserTBD}
								withinProjectDates={isWeekWithinProject(mondayDate)}
								assignment={assignment}
								cweek={cweek}
								year={mondays.year}
								key={`input-${cweekIndex}`}
							/>
						</div>
					);
				})}
			</div>
			{isLastMonth && <UserSummary assignment={assignment} />}
		</div>
	);
};
