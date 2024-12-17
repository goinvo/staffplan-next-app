import React, { useState } from "react";
import { ProjectSummaryProps } from "../typeInterfaces";
import { useGeneralDataContext } from "../contexts/generalContext";
import { calculatePlanFromToday } from "./scrollingCalendar/helpers";

const ProjectSummary: React.FC<ProjectSummaryProps> = ({ project }) => {
	const { showSummaries } = useGeneralDataContext();
	const [showTooltip, setShowTooltip] = useState(false);
	const plannedHours = project.assignments?.reduce((total, assignment) => {
		return total + calculatePlanFromToday(assignment);
	}, 0);

	const burnedHours = project.assignments?.reduce((total, assignment) => {
		return (
			total +
			assignment.workWeeks.reduce(
				(acc, curr) => acc + (curr.actualHours ?? 0),
				0
			)
		);
	}, 0);

	const getDeltaValue = () => {
		if (!project?.hours) {
			return;
		}
		const delta = (plannedHours ?? 0) + (burnedHours ?? 0) - project?.hours;
		return delta > 0 ? `+${delta}` : `${delta}`;
	};

	const summaries = [
		{ label: "Target", value: project.hours, unit: "hrs" },
		{
			label: "Plan",
			value: (plannedHours ?? 0) + (burnedHours ?? 0),
			unit: "hrs",
			alwaysShow: true,
			tooltip: `Plan = Actual (${burnedHours}) + Plan (${plannedHours})`,
		},
		{ label: "Actual", value: burnedHours, unit: "hrs", alwaysShow: true },
		{
			label: "Delta",
			value: getDeltaValue(),
			unit: "hrs",
			alwaysShow: true,
			tooltip: `Delta = Plan (${
				(plannedHours ?? 0) + (burnedHours ?? 0)
			}) + Actual (${burnedHours}) - Target (${project.hours})`,
		},
	];
	return (
		<td className="font-normal ml-auto py-2 pr-4 pl-0 sm:w-1/6 w-1/2 flex justify-center items-center">
			{showSummaries && (
				<div
					className={`sm:flex ${
						showSummaries ? "block" : "hidden"
					} flex-col relative`}
					onMouseLeave={() => showTooltip && setShowTooltip(false)}
					onClick={() => setShowTooltip(!showTooltip)}
				>
					{summaries.map((summary, index) =>
						summary.value || summary.alwaysShow ? (
							<div
								key={index}
								className={`sm:flex justify-between space-x-1 cursor-pointer ${
									summary.label === "Target"
										? "border-b border-contrastGrey border-opacity-20"
										: ""
								} ${
									summary.label === "Delta"
										? "border-t border-contrastGrey border-opacity-20"
										: ""
								} relative`}
							>
								<label
									className="cursor-pointer text-sm leading-[18px] whitespace-nowrap text-right flex-shrink-0"
									style={{ width: "40px" }}
								>
									{summary.label}
								</label>
								<span className="font-bold text-sm">
									{summary.value}
									<span className="text-sm font-normal pl-1">
										{summary.unit}
									</span>
								</span>
								{summary.tooltip && showTooltip && (
									<div className="absolute bottom-full right-0 bg-gray-700 text-white text-xs rounded px-2 py-1 z-50 shadow-lg min-w-40">
										{summary.tooltip}
									</div>
								)}
							</div>
						) : null
					)}
				</div>
			)}
		</td>
	);
};

export default ProjectSummary;
