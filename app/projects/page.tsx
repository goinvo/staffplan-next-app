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

	const { projectList } = useUserDataContext();

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
		router.push(pathname + "/" + encodeURIComponent(project.id));
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
							className="flex gap-x-4 gap-y-4 items-center relative"
							key={project.id}
						>
							<div className="flex w-16 h-16 timeline-grid-bg rounded-full overflow-hidden">
								<Image
									src={`${project.client.avatarUrl}`}
									alt="client avatar"
									width={500}
									height={500}
								/>
							</div>
							<div
								className="flex hover:cursor-pointer"
								onClick={() => handleProjectChange(project)}
							>
								{project.name}
							</div>
							<div>
								<EllipsisProjectMenu project={project} />
							</div>
							{/* svg status tag */}
							{project.status === "unconfirmed" && (
								<svg
									width="375"
									height="50"
									viewBox="-335 0 500 100"
									xmlns="http://www.w3.org/2000/svg"
									className="absolute -top-5"
								>
									<path
										d="M10,10 L150,10 L150,50 L20,50 Q10,50 10,40 Z"
										fill="gray"
									/>
									<line
										x1="10"
										y1="13"
										x2="-500"
										y2="13"
										stroke="gray"
										strokeWidth="5"
									/>
									<text x="15" y="40" fill="white" fontSize="20">
										Unconfirmed
									</text>
								</svg>
							)}
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
