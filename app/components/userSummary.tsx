'use client'
import React from "react";

import { UserSummaryProps } from "../typeInterfaces";
import { useGeneralDataContext } from '../contexts/generalContext';
import { calculatePlan } from "./scrollingCalendar/helpers";


const UserSummary: React.FC<UserSummaryProps> = ({ assignment }) => {
	const burnedHours = assignment.workWeeks.reduce(
		(acc, curr) => acc + (curr.actualHours ?? 0),
		0
	);
	const { showSummaries } = useGeneralDataContext()

	const summaries = [
		{ label: 'future plan', value: calculatePlan(assignment, { isFuture: true }), unit: 'hrs' },
		{ label: 'burned', value: burnedHours, unit: 'hrs', alwaysShow: true },
		{ label: 'past plan', value: calculatePlan(assignment, { isFuture: false }), unit: 'hrs' },
	];

	return (
		<td className="font-normal py-2 sm:pl-4 pl-0 pr-0 ml-1 sm:ml-0 w-1/2 sm:w-1/6">
			<div className="flex justify-between">
				{showSummaries && (
					<div>
						{summaries.map((sum, index) =>
							sum.value || sum.alwaysShow ? (
								<div key={index} className="sm:flex hidden justify-between">
									<label className="text-sm pr-1 whitespace-nowrap">{sum.label}</label>
									<span className="font-bold text-sm">
										{sum.value}
										<span className="text-sm font-normal pl-1">{sum.unit}</span>
									</span>
								</div>
							) : null
						)}
					</div>
				)}
			</div>
		</td >
	);
};

export default UserSummary;	