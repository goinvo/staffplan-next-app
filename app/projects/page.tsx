"use client";
import React from "react";
import { ProjectType } from "../typeInterfaces";
import { useUserDataContext } from "../userDataContext";
import { LoadingSpinner } from "../components/loadingSpinner";
import { ScrollingCalendar } from "../components/scrollingCalendar/scrollingCalendar";
import { AllProjectRow } from "../components/allProjects/allProjectRow";

const ProjectsView: React.FC = () => {
	const { projectList } = useUserDataContext();

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
