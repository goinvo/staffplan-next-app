import React from "react";
import { ProjectSummaryProps } from "../typeInterfaces";
import { DateTime } from "luxon";
import { useUserDataContext } from "../userDataContext";
const ProjectSummary: React.FC<ProjectSummaryProps> = ({ project }) => {
	const { viewsFilter } = useUserDataContext();
	const plannedHours = project.assignments?.reduce((acc, curr) => {
		if (curr.status === "active") {
			return acc + curr.estimatedWeeklyHours;
		}
		return acc;
	}, 0);

	const weeks = () => {
		if (project.startsOn && project.endsOn) {
			const startsOn = DateTime.fromISO(project.startsOn);
			const endsOn = DateTime.fromISO(project.endsOn);
			return Math.round(endsOn.diff(startsOn, "weeks").weeks);
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

	return (
		<>
			{viewsFilter.showSummaries ? (
				<div className="w-40 flex flex-col">
					<span>
						{project.fte ? (
							<span className="mr-4 text-sm">
								<span className="font-bold text-lg">{project.fte}</span>
								FTE
							</span>
						) : null}
						{weeks() ? (
							<span className="text-sm">
								<span className="font-bold text-lg">{weeks()}</span>
								wks
							</span>
						) : null}
					</span>
					{project.hours ? (
						<div className="flex justify-between items-end  border-b-2 border-gray-500 bg-gray-100 mb-1">
							<label className="text-sm">target</label>
							<span className="font-bold text-lg">
								{project.hours}
								<span className="text-sm font-normal">hrs</span>
							</span>
						</div>
					) : null}
					<div className="flex justify-between items-end border-b-2 border-accentgreen bg-green-50 mb-1">
						<label className="text-sm">planned</label>
						<span className="font-bold text-lg">
							{plannedHours}
							<span className="text-sm font-normal">hrs</span>
						</span>
					</div>
					<div className="flex justify-between items-end  border-b-2 border-gray-500 bg-gray-100 mb-1">
						<label className="text-sm">burned</label>
						<span className="font-bold text-lg">
							{burnedHours}
							<span className="text-sm font-normal">hrs</span>
						</span>
					</div>
					{shortHours() ? (
						<div className="flex justify-between items-end  border-b-2 border-orange-500 bg-orange-50">
							<label className="text-sm">short</label>
							<span className="font-bold text-lg">
								{shortHours()}
								<span className="text-sm font-normal">hrs</span>
							</span>
						</div>
					) : null}
				</div>
			) : null}
		</>
	);
};

export default ProjectSummary;
