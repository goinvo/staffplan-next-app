import React from 'react';
import { DateTime } from 'luxon';
import { ProjectSummaryProps } from '../typeInterfaces';
import { useGeneralDataContext } from '../contexts/generalContext';
import { calculatePlannedHoursPerProject } from './scrollingCalendar/helpers';


const ProjectSummary: React.FC<ProjectSummaryProps> = ({ project }) => {
	const { showSummaries } = useGeneralDataContext();

	const plannedHours = calculatePlannedHoursPerProject(project)

	const weeks = (): number => {
		if (project.startsOn && project.endsOn) {
			const startsOn = DateTime.fromISO(project.startsOn);
			const endsOn = DateTime.fromISO(project.endsOn);
			return Math.round(endsOn.diff(startsOn, 'weeks').weeks);
		}
		return 0;
	};

	const burnedHours = project.workWeeks?.reduce(
		(acc, curr) => acc + (curr.actualHours ?? 0),
		0
	);

	const shortHours = () => {
		if (project.hours) {
			return project.hours - ((burnedHours ?? 0) + (plannedHours ?? 0));
		}
	};

	const summaries = [
		{ label: 'target', value: project.hours, unit: 'hrs' },
		{ label: 'planned', value: plannedHours, unit: 'hrs', alwaysShow: true },
		{ label: 'burned', value: burnedHours, unit: 'hrs', alwaysShow: true },
		{ label: 'short', value: shortHours(), unit: 'hrs' },
	];
	const weeksAndFte = [
		{ unit: 'FTE', value: project.fte, separator: weeks() > 0 ? ',' : '' },
		{ unit: 'wks', value: weeks() }
	]
	return (
		<td className="font-normal ml-auto py-2 pr-4 pl-0 sm:w-1/6 w-1/2 flex justify-center items-center">
			{showSummaries && (
				<div className='sm:flex hidden flex-col'>
					<div className="sm:flex hidden justify-between w-full space-x-1">
						{weeksAndFte.map((item, index) => (
							item.value ? (
								<div key={index} className="flex items-center space-x-1">
									<span className="font-bold">{item.value}</span>
									<label className="text-sm">{item.unit + (item.separator || '')}</label>
								</div>
							) : null
						))}
					</div>
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
