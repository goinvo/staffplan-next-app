import { AssignmentType } from "@/app/typeInterfaces";
import { useUserDataContext } from "@/app/userDataContext";
import React from "react";
import { getMondays } from "../weekDisplayPrototype/helpers";
import { DateTime } from "luxon";
import { useRouter } from "next/navigation";
import UserSummary from "../userSummary";
import { ProjectUserLabel } from "./projectUserLabel";
import { WorkWeekInput } from "./workWeekInput";

interface ProjectAssignmentRowProps {
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
}: ProjectAssignmentRowProps) => {
	const router = useRouter();
	const { dateRange } = useUserDataContext();
	const mondays = getMondays(
		DateTime.local(dateRange.year, parseInt(monthData.monthLabel), 1).startOf(
			"day"
		)
	);
	const handleUserChange = (assignment: AssignmentType) => {
		const user = assignment.assignedUser.id?.toString();
		if (user) {
			router.push("/people/" + encodeURIComponent(user));
		}
	};
	return (
		<div className="flex">
			{isFirstMonth && (
				<ProjectUserLabel
					assignment={assignment}
					clickHandler={handleUserChange}
				/>
			)}
			<div className="flex border-b ml-1 border-gray-300 justify-between w-full h-32">
				{mondays.cweeks.map((cweek, cweekIndex) => {
					const workWeekElements = assignment.workWeeks.map(
						(workWeek, workWeekIndex) => {
							if (workWeek.cweek === cweek && workWeek.year === mondays.year) {
								return (
									<WorkWeekInput
										key={`workWeek-${workWeekIndex}`}
										cweek={cweek}
										year={mondays.year}
										workWeek={workWeek}
										assignment={assignment}
									/>
								);
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
							className="flex-1 flex flex-col items-center"
						>
							{hasWorkWeek ? (
								workWeekElements
							) : (
								<WorkWeekInput
									assignment={assignment}
									cweek={cweek}
									year={mondays.year}
									key={`input-${cweekIndex}`}
								/>
							)}
						</div>
					);
				})}
			</div>
			{isLastMonth && <UserSummary assignment={assignment} />}
		</div>
	);
};
