import { AssignmentType } from "@/app/typeInterfaces";
import { useUserDataContext } from "@/app/userDataContext";
import React from "react";
import { getMondays } from "./helpers";
import { DateTime } from "luxon";

interface UserAssignmentRowProps {
	assignment: AssignmentType;
	monthData: { monthLabel: string; year: number };
}
export const UserAssignmentRow = ({
	assignment,
	monthData,
}: UserAssignmentRowProps) => {
	const { dateRange } = useUserDataContext();

	const mondays = getMondays(
		DateTime.local(dateRange.year, parseInt(monthData.monthLabel), 1).startOf(
			"day"
		)
	);
	return (
		<div>
			<div>ASSIGNMENT ROW: {assignment.id}</div>
			<div>PROJECT: {assignment.project.name}</div>
			<div className="flex border-b border-gray-300">
				{mondays.cweeks.map((cweek, cweekIndex) => {
					const workWeekElements = assignment.workWeeks.map(
						(workWeek, workWeekIndex) => {
                            console.log(workWeek,' work week')
							if (workWeek.cweek === cweek && workWeek.year === mondays.year) {
								return (
									<div key={`workWeek-${workWeekIndex}`} className="flex flex-col items-center">
										<input
											value={workWeek.estimatedHours}
											className="border border-red-500 w-10 rounded p-2 mb-1"
										/>
										<input
											value={workWeek.actualHours}
											className="border border-red-500 w-10 rounded p-2 mb-1"
										/>
									</div>
								);
							}
							return null;
						}
					);

					const hasWorkWeek = workWeekElements.some(
						(element) => element !== null
					);

					return (
						<div key={`cweek-${cweekIndex}`} className="flex-1 flex flex-col items-center">
							{hasWorkWeek ? (
								workWeekElements
							) : (
								<div key={`input-${cweekIndex}`} className="flex flex-col items-center">
									<input
										value={assignment.estimatedWeeklyHours}
										className="border w-10 border-gray-300 rounded p-2 mb-1"
									/>
									<input
										value={0}
										className="border border-green-500 w-10 rounded p-2 mb-1"
									/>
								</div>
							)}
						</div>
					);
				})}
			</div>
		</div>
	);
};