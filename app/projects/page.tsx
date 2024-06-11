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
import ProjectSummary from "../components/projectSummary";
import { ScrollingCalendar } from "../components/weekDisplayPrototype/scrollingCalendar";
import { AllProjectRow } from "../components/allProjectsPrototype/allProjectRow";

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
				<ScrollingCalendar>
					{projectList?.map((project: ProjectType, index: number) => {
						return (
							<AllProjectRow
								key={index}
								project={project}
								monthData={{ monthLabel: "", year: 0 }}
								isFirstMonth={true}
								isLastMonth={true}
							/>
						);
					})}
				</ScrollingCalendar>
			) : (
				<LoadingSpinner />
			)}
		</>
	);
};

export default ProjectsView;
