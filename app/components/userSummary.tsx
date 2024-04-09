import React from "react";
import { UserSummaryProps } from "../typeInterfaces";
import { DateTime } from "luxon";

const UserSummary: React.FC<UserSummaryProps> = ({ assignment }) => {
	console.log(assignment, "assignment");
	const burnedHours = assignment.workWeeks.reduce(
		(acc, curr) => acc + (curr.actualHours ?? 0),
		0
	);
	return (
		<div className="w-40 flex flex-col">
			{assignment.estimatedWeeklyHours ? (
				<div className="flex justify-between items-end  border-b-2 border-gray-500 bg-gray-100 mb-1">
					<label className="text-sm">target</label>
					<span className="font-bold text-lg">
						{assignment.estimatedWeeklyHours}
						<span className="text-sm font-normal">hrs</span>
					</span>
				</div>
			) : null}
			<div className="flex justify-between items-end  border-b-2 border-gray-500 bg-gray-100 mb-1">
				<label className="text-sm">burned</label>
				<span className="font-bold text-lg">
					{burnedHours}
					<span className="text-sm font-normal">hrs</span>
				</span>
			</div>
		</div>
	);
};

export default UserSummary;
