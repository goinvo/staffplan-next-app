import React from 'react';
import { DateTime } from 'luxon';
import { ProjectSummaryProps } from '../typeInterfaces';
import { useGeneralDataContext } from '../contexts/generalContext';
import { calculatePlanFromToday, calculatePlannedHoursPerProject } from './scrollingCalendar/helpers';


const ProjectSummary: React.FC<ProjectSummaryProps> = ({ project }) => {
	const { showSummaries } = useGeneralDataContext();

	const plannedHours = project.assignments?.reduce((total, assignment) => {
		return total + calculatePlanFromToday(assignment);
	}, 0);

	const burnedHours = project.assignments?.reduce((total, assignment) => {
		return total + assignment.workWeeks.reduce(
			(acc, curr) => acc + (curr.actualHours ?? 0),
			0
		);
	}, 0);

	const getDeltaValue = () => {
		if (!project?.hours) {
			return;
		}
		const delta = (plannedHours ?? 0) + (burnedHours ?? 0) - project?.hours
		return delta > 0 ? `+${delta}` : `${delta}`;
	}

	const summaries = [
		{ label: 'Target', value: project.hours, unit: 'hrs' },
		{ label: 'Plan', value: (plannedHours ?? 0) + (burnedHours ?? 0), unit: 'hrs', alwaysShow: true },
		{ label: 'Actual', value: burnedHours, unit: 'hrs', alwaysShow: true },
		{ label: 'Delta', value: getDeltaValue(), unit: 'hrs', alwaysShow: true },
	];
	return (
		<td className="font-normal ml-auto py-2 pr-4 pl-0 sm:w-1/6 w-1/2 flex justify-center items-center">
			{showSummaries && (
				<div className='sm:flex hidden flex-col'>
					{summaries.map((summary, index) =>
						(summary.value || summary.alwaysShow) ? (
							<div key={index} className="sm:flex hidden justify-between space-x-1">
								<label className="text-sm whitespace-nowrap">{summary.label}</label>
								<span className="font-bold text-sm">
									{summary.value}
									<span className="text-sm font-normal pl-1">{summary.unit}</span>
								</span>
							</div>
						) : null
					)}
				</div>
			)
			}
		</td >
	);
};

export default ProjectSummary;
