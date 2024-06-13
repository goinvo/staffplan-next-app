"use client";
import React from "react";
import { useState } from "react";
import { ProjectType } from "../typeInterfaces";
import { useUserDataContext } from "../userDataContext";
import { ProjectDataMapType } from "../typeInterfaces";
import { LoadingSpinner } from "../components/loadingSpinner";
import { ScrollingCalendar } from "../components/weekDisplayPrototype/scrollingCalendar";
import { AllProjectRow } from "../components/allProjectsPrototype/allProjectRow";

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
