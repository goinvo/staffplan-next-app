'use client'
import React, { useState } from "react";
import { UserSummaryProps } from "../typeInterfaces";
import { useGeneralDataContext } from '../contexts/generalContext';
import { calculatePlanFromToday } from "./scrollingCalendar/helpers";


const UserSummary: React.FC<UserSummaryProps> = ({ assignment }) => {
	const [showTooltip, setShowTooltip] = useState(false);
	const burnedHours = assignment.workWeeks.reduce(
		(acc, curr) => acc + (curr.actualHours ?? 0),
		0
	);
	const planHoursPerAssignment = calculatePlanFromToday(assignment)

	const { showSummaries } = useGeneralDataContext()

	const planTooltip = `Plan = Future Plan (${planHoursPerAssignment}) + Actual (${burnedHours})`;

	const summaries = [
		{ label: 'Plan', value: burnedHours + planHoursPerAssignment, unit: 'hrs', tooltip: planTooltip, alwaysShow: true },
		{ label: 'Actual', value: burnedHours, unit: 'hrs', alwaysShow: true },
	];

	return (
		<td className="font-normal py-2 sm:pl-4 pl-0 pr-0 ml-1 sm:ml-0 w-1/2 sm:w-1/6">
			{showSummaries && (
				<div
				className='pl-6 sm:flex hidden flex-col max-w-fit space-y-5 cursor-pointer'
				onMouseLeave={() => showTooltip && setShowTooltip(false)}
				onClick={() => setShowTooltip(!showTooltip)}
			>
				{summaries.map((sum, index) =>
					(sum.value || sum.alwaysShow) ? (
						<div
							key={index}
							className="sm:flex justify-between space-x-1 cursor-pointer relative"
						>
							<label
								className="cursor-pointer text-sm leading-[18px] whitespace-nowrap text-right flex-shrink-0
									min-w-10">
								{sum.label}
							</label>
							<span className="font-bold text-sm text-right min-w-20">
								{sum.value}
								<span className="text-sm font-normal pl-1">{sum.unit}</span>
							</span>
							{sum.tooltip && showTooltip && (
								<div className="absolute bottom-full bg-gray-700 text-white text-xs rounded px-2 py-1 z-10 shadow-lg min-w-32">
									{sum.tooltip}
								</div>
							)}
						</div>
					) : null
				)}
			</div>			
			)
			}
		</td >
	);
};

export default UserSummary;	