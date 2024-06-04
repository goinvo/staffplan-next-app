import React from "react";
import { UserSummaryProps } from "../typeInterfaces";
import { DateTime } from "luxon";
import { useUserDataContext } from "../userDataContext";
const UserSummary: React.FC<UserSummaryProps> = ({ assignment }) => {
	const { viewsFilter } = useUserDataContext();
	const burnedHours = assignment.workWeeks.reduce(
		(acc, curr) => acc + (curr.actualHours ?? 0),
		0
	);
	const pastPlan = () => {
		const now = DateTime.now();
		const startOfAssignment = DateTime.fromISO(assignment.startsOn ?? "");
		const timeBetween = now.diff(startOfAssignment, ["weeks"]).toObject();
		if (timeBetween.weeks && timeBetween.weeks > 0) {
			return assignment.estimatedWeeklyHours * Math.ceil(timeBetween.weeks);
		}
	};
	const futurePlan = () => {
		const now = DateTime.now();
		const endOfAssignment = DateTime.fromISO(assignment.endsOn ?? "");
		const timeBetween = endOfAssignment.diff(now, ["weeks"]).toObject();
		if (timeBetween.weeks && timeBetween.weeks > 0) {
			return assignment.estimatedWeeklyHours * Math.ceil(timeBetween.weeks);
		}
	};
	return (
		<>
			{viewsFilter.showSummaries ? (
				<div className="w-40 flex flex-col absolute right-0">
					{futurePlan() ? (
						<div className="flex justify-between items-end border-b-2 border-accentgreen bg-green-50 mb-1">
							<label className="text-sm">future plan</label>
							<span className="font-bold text-lg">
								{futurePlan()}
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
					{pastPlan() ? (
						<div className="flex justify-between items-end  border-b-2 border-gray-500 bg-gray-100 mb-1">
							<label className="text-sm">past plan</label>
							<span className="font-bold text-lg">
								{pastPlan()}
								<span className="text-sm font-normal">hrs</span>
							</span>
						</div>
					) : null}
				</div>
			) : null}
		</>
	);
};

export default UserSummary;
