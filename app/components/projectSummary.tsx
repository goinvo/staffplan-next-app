import React from "react";
import { DateTime } from "luxon";

import { ProjectSummaryProps } from "../typeInterfaces";
import { useUserDataContext } from "../userDataContext";

import IconButton from "./iconButton";
import { ArchiveBoxIcon } from "@heroicons/react/24/outline";

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
		<td className="font-normal py-2 w-1/6 flex justify-center items-center">
			{viewsFilter.showSummaries ? (
				<div className="flex flex-col items-start">
					<div className="ml-auto">
						<IconButton className='text-black text-transparentGrey'
							onClick={() => console.log('On archive box btn click')}
							Icon={ArchiveBoxIcon}
							iconSize={'h6 w-6'} />
					</div>
					{project.fte ? (
						<span className="text-sm flex items-center">
							<span className="font-bold text-sm px-1">{project.fte}</span>
							FTE
						</span>
					) : null}
					{weeks() ? (
						<span className="text-sm flex items-center">
							<span className="font-bold text-sm px-1">{weeks()}</span>
							wks
						</span>
					) : null}
					{project.hours ? (
						<div className="flex justify-between">
							<label className="text-sm">target</label>
							<span className="font-bold text-sm px-1">
								{project.hours}
								<span className="text-sm font-normal pl-1">hrs</span>
							</span>
						</div>
					) : null}
					<div className="flex">
						<label className="text-sm">planned</label>
						<span className="font-bold text-sm px-1">
							{plannedHours}
							<span className="text-sm font-normal pl-1">hrs</span>
						</span>
					</div>
					<div className="flex">
						<label className="text-sm">burned</label>
						<span className="font-bold text-sm px-1">
							{burnedHours}
							<span className="text-sm font-normal pl-1">hrs</span>
						</span>
					</div>
					{shortHours() ? (
						<div className="flex">
							<label className="text-sm">short</label>
							<span className="font-bold text-sm px-1">
								{shortHours()}
								<span className="text-sm font-normal pl-1">hrs</span>
							</span>
						</div>
					) : null}
				</div>
			) : null}
		</td>
	);
}
export default ProjectSummary;
