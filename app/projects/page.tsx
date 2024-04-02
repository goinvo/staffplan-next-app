"use client";
import React from "react";
import { useEffect, useState } from "react";
import { ProjectType } from "../typeInterfaces";
import { useRouter, usePathname } from "next/navigation";
import { useUserDataContext } from "../userDataContext";
import { UserType, ProjectDataMapType } from "../typeInterfaces";
import { processProjectDataMap, getWorkWeeksForProjectByWeekAndYear, drawBars, drawFTELabels } from "../helperFunctions";
import WeekDisplay from "../components/weekDisplay";
import { LoadingSpinner } from "../components/loadingSpinner";
import { SVGAlphabet } from "../svgAlphabet";
import EllipsisProjectMenu from "../components/ellipsisProjectMenu";

const ProjectsView: React.FC = () => {
	const [selectedProject, setSelectedProject] = useState<UserType>({
		id: NaN,
		name: "Select",
	});
	const [projectAssignmentDataMap, setProjectAssignmentDataMap] = useState<ProjectDataMapType>({});
	const [rowIdtoProjectIdMap, setRowIdtoProjectIdMap] = useState<Map<number, number>>(new Map());
	const router = useRouter();
	const pathname = usePathname();

	const { projectList } = useUserDataContext();

	useEffect(() => {
		if (projectList) {
			// Setup the map of users to their assignments' work weeks
			const processedDataMap = processProjectDataMap(projectList);
			setProjectAssignmentDataMap(processedDataMap);

			console.log("projectList", projectList, "projectAssignmentDataMap", processedDataMap);

			// Setup the map of row ids to project ids
			projectList?.map((project: UserType, index: number) => {
				if (project.id && !rowIdtoProjectIdMap.has(index)) {
					rowIdtoProjectIdMap.set(index, project.id);
				}
			});
		}
	}, [projectList]);

	const handleProjectChange = (project: ProjectType) => {
		const projectId = JSON.stringify({selectedProjectId:project.id})
		const encodeProjectId = Buffer.from(projectId).toString("base64");
		router.push(pathname + "/" + encodeURIComponent(encodeProjectId));
	};

	const renderCell = (cweek: number, year: number, rowIndex: number, isSelected: boolean, width?: number, height?: number) => {
		const projectId = rowIdtoProjectIdMap.get(rowIndex);

		if (projectId) {
			const workWeeksForProject = getWorkWeeksForProjectByWeekAndYear(projectAssignmentDataMap, projectId, cweek, year) ?? [];

			if (workWeeksForProject.length > 0) {
				return (
					<div className="relative absolute" style={{ height: height }}>
						{drawBars(workWeeksForProject, width, height)}
						{drawFTELabels(workWeeksForProject, width, height)}
					</div>
				)
			}
		}

		return (<></>)

	}

	return (
		<>
			{
				projectList ? <WeekDisplay labelContentsLeft={
					projectList.map((project) => (
						<div className="flex gap-x-4 gap-y-4 items-center justify-center" key={project.id}>
							<div className="flex w-16 h-16 timeline-grid-bg rounded-full overflow-hidden" onClick={() => handleProjectChange(project)}><SVGAlphabet name={project.name} /></div>
							<div className="flex">{project.name}</div>
							<div>
								<EllipsisProjectMenu project={project} />
							</div>
						</div>
					))}
					renderCell={renderCell}
				/> : <LoadingSpinner />
			}
		</>
	);
};


export default ProjectsView;
