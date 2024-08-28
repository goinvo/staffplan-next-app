import React from "react";
import { DateTime } from "luxon";

import { ArchiveBoxIcon } from "@heroicons/react/24/outline";

import { UserSummaryProps } from "../typeInterfaces";
import { useUserDataContext } from "../userDataContext";
import IconButton from "./iconButton";

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
		<td className="font-normal py-2 pl-4 w-1/6 flex items-center justify-between">
			{viewsFilter.showSummaries ? (
				<>
					{futurePlan() ? (
						<div className='space-y-4'>
							<label className="text-sm pr-1">future plan</label>
							<span className="font-bold text-sm">
								{futurePlan()}
								<span className="text-sm font-normal pl-1">hrs</span>
							</span>
						</div>
					) : null}
					<div className='space-y-4'>
						<label className="text-sm pr-1">burned</label>
						<span className="font-bold text-sm">
							{burnedHours}
							<span className="text-sm font-normal pl-1">hrs</span>
						</span>
					</div>
					{pastPlan() ? (
						<div className='space-y-4'>
							<label className="text-sm pr-1">past plan</label>
							<span className="font-bold text-sm">
								{pastPlan()}
								<span className="text-sm font-normal pl-1">hrs</span>
							</span>
						</div>
					) : null}
				</>
			) : null}
			<div className="flex items-start justify-center">
				<IconButton className='text-black flex items-start justify-center text-transparentGrey'
					onClick={() => console.log('On archive box btn click')}
					Icon={ArchiveBoxIcon}
					iconSize={'h6 w-6'} />
			</div>
		</td >
	);
};

export default UserSummary;
