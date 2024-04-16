"use client";
import React from "react";
import { useEffect, useState } from "react";
import { ProjectType } from "../typeInterfaces";
import { useRouter, usePathname } from "next/navigation";
import { useUserDataContext } from "../userDataContext";
import { UserType, ProjectDataMapType } from "../typeInterfaces";
import {
	processProjectDataMap,
	getWorkWeeksForProjectByWeekAndYear,
	drawBars,
	drawFTELabels,
} from "../helperFunctions";
import WeekDisplay from "../components/weekDisplay";
import { LoadingSpinner } from "../components/loadingSpinner";
import EllipsisProjectMenu from "../components/ellipsisProjectMenu";
import Image from "next/image";
import ProjectSummary from "../components/allProjectsSummary";

const ProjectsView: React.FC = () => {
	const [projectAssignmentDataMap, setProjectAssignmentDataMap] =
		useState<ProjectDataMapType>({});
	const [rowIdtoProjectIdMap, setRowIdtoProjectIdMap] = useState<
		Map<number, number>
	>(new Map());
	const router = useRouter();
	const pathname = usePathname();

	const { projectList, viewsFilter } = useUserDataContext();

	useEffect(() => {
		if (projectList) {
			// Setup the map of users to their assignments' work weeks
			const processedDataMap = processProjectDataMap(projectList);
			setProjectAssignmentDataMap(processedDataMap);

			// Clear the rowIdtoProjectIdMap
			setRowIdtoProjectIdMap(new Map());

			// Setup the map of row ids to project ids
			const newRowIdtoProjectIdMap = new Map<number, number>();
			projectList?.map((project: ProjectType, index: number) => {
				if (project.id && !newRowIdtoProjectIdMap.has(index)) {
					newRowIdtoProjectIdMap.set(index, project.id);
				}
			});

			setRowIdtoProjectIdMap(newRowIdtoProjectIdMap);
		}
	}, [projectList]);

	const handleProjectChange = (project: ProjectType) => {
		const projectId = JSON.stringify({ selectedProjectId: project.id });
		router.push(pathname + "/" + encodeURIComponent(projectId));
	};

	const renderCell = (
		cweek: number,
		year: number,
		rowIndex: number,
		isSelected: boolean,
		width?: number,
		height?: number
	) => {
		const projectId = rowIdtoProjectIdMap.get(rowIndex);

		if (projectId) {
			const workWeeksForProject =
				getWorkWeeksForProjectByWeekAndYear(
					projectAssignmentDataMap,
					projectId,
					cweek,
					year
				) ?? [];

			if (workWeeksForProject.length > 0) {
				return (
					<div className="relative absolute" style={{ height: height }}>
						{drawBars(workWeeksForProject, width, height)}
						{drawFTELabels(workWeeksForProject, width, height)}
					</div>
				);
			}
		}

		return <></>;
	};

	return (
		<>
			{projectList ? (
				<WeekDisplay
					labelContentsLeft={projectList.map((project) => (
						<div
							className="flex gap-x-4 gap-y-4 items-center justify-center"
							key={project.id}
						>
							<div
								className="flex w-16 h-16 timeline-grid-bg rounded-full overflow-hidden hover:cursor-pointer"
								onClick={() => handleProjectChange(project)}
							>
								<Image
									src={`${project.client.avatarUrl}`}
									alt="client avatar"
									width={500}
									height={500}
								/>
							</div>
							<div className="flex">{project.name}</div>
							<div>
								<EllipsisProjectMenu project={project} />
							</div>
						</div>
					))}
					labelContentsRight={projectList.map((project) => (
						<div
							className="flex gap-x-4 gap-y-4 items-center justify-center"
							key={project.id}
						>
							<ProjectSummary project={project} />
						</div>
					))}
					renderCell={renderCell}
				/>
			) : (
				<LoadingSpinner />
			)}
		</>
	);
};

export default ProjectsView;
