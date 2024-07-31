import { AssignmentType, UserType } from "@/app/typeInterfaces";
import { useUserDataContext } from "@/app/userDataContext";
import React from "react";
import { getMondays } from "../scrollingCalendar/helpers";
import { DateTime } from "luxon";
import { useRouter } from "next/navigation";
import UserSummary from "../userSummary";
import { UserLabel } from "./userLabel";
import { WorkWeekInput } from "./workWeekInput";
import { ClientLabel } from "./clientLabel";

interface UserAssignmentRowProps {
	currentUser: UserType;
	setCurrentUserAssignments: React.Dispatch<
		React.SetStateAction<UserType | null>
	>;
	assignment: AssignmentType;
	isFirstMonth: boolean;
	isLastMonth: boolean;
	isFirstClient: boolean;
	monthData: { monthLabel: string; year: number };
}
export const UserAssignmentRow = ({
	assignment,
	currentUser,
	setCurrentUserAssignments,
	isFirstMonth,
	isLastMonth,
	isFirstClient,
	monthData,
}: UserAssignmentRowProps) => {
	const router = useRouter();
	const { dateRange } = useUserDataContext();
	const mondays = getMondays(
		DateTime.local(dateRange.year, parseInt(monthData.monthLabel), 1).startOf(
			"day"
		)
	);
	const handleProjectChange = (assignment: AssignmentType) => {
		router.push("/projects/" + encodeURIComponent(assignment.project.id));
	};

	const isWeekWithinProject = (weekDate: Date) => {
		const weekDateFormatted = new Date(weekDate);
		if (assignment.project.startsOn && !assignment.project.endsOn) {
			const startsOn = new Date(assignment.project.startsOn);
			return weekDateFormatted >= startsOn;
		}
		if (assignment.project.startsOn && assignment.project.endsOn) {
			const startsOn = new Date(assignment.project.startsOn);
			const endsOn = new Date(assignment.project.endsOn);
			return weekDateFormatted >= startsOn && weekDateFormatted <= endsOn;
		}
		return true;
	};
	
	console.log(currentUser.assignments,'selected user in user assignment')
	return (
		<div className="flex">
			{isFirstMonth && (
				<UserLabel assignment={assignment} clickHandler={handleProjectChange} />
			)}
			<div className="flex border-b ml-1 border-gray-300 justify-center items-center w-full h-40">
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
