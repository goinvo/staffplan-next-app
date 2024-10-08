"use client";
import React from "react";

import { ProjectType } from "../typeInterfaces";
import { LoadingSpinner } from "../components/loadingSpinner";
import { ScrollingCalendar } from "../components/scrollingCalendar/scrollingCalendar";
import { AllProjectRow } from "../components/allProjects/allProjectRow";
import { useProjectsDataContext } from "../contexts/projectsDataContext";


const ProjectsView: React.FC = () => {

	const { filteredProjectList } = useProjectsDataContext();

	const columnHeaderTitles = [{ title: 'Clients', showIcon: true }, { title: 'Projects', showIcon: false }]

	const assignments = filteredProjectList?.flatMap((project: ProjectType) => project.assignments || []);

	return (
		<>
			{filteredProjectList.length ? (
				<ScrollingCalendar title='Projects' columnHeaderTitles={columnHeaderTitles} assignments={assignments}>
					{filteredProjectList?.map((project: ProjectType, index: number) => {
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
