import React from "react";
import { ProjectType } from "../typeInterfaces";
import { DateTime } from "luxon";
interface ProjectSummaryProps {
	project: ProjectType;
}

const ProjectSummary: React.FC<ProjectSummaryProps> = ({ project }) => {
	const plannedHours = project.assignments?.reduce((acc, curr) => {
        if (curr.status === "active") {
                console.log(project.name, curr, "acc")
				return acc + curr.estimatedWeeklyHours;
			}
            return acc
		}, 0);
	const weeks = () => {
		if (project.startsOn && project.endsOn) {
			const startsOn = DateTime.fromISO(project.startsOn);
			const endsOn = DateTime.fromISO(project.endsOn);
			return Math.round(endsOn.diff(startsOn, "weeks").weeks);
		}
	};
	return (
		<div>
			<p>FTE:{project.fte}</p>
			{weeks ? <p>weeks:{weeks()}</p> : null}
			<p>target:{project.hours}</p>
			<p>planned:{plannedHours}</p>
		</div>
	);
};

export default ProjectSummary;
