"use client";
import React, {useState} from "react";

import { ProjectType } from "../typeInterfaces";
import { LoadingSpinner } from "../components/loadingSpinner";
import { ScrollingCalendar } from "../components/scrollingCalendar/scrollingCalendar";
import { AllProjectRow } from "../components/allProjects/allProjectRow";
import { SORT_ORDER } from "../components/scrollingCalendar/constants";
import { useProjectsDataContext } from "../contexts/projectsDataContext";


const ProjectsView: React.FC = () => {
	const [initialSorting, setInitialSorting] = useState<{title: string; sort: SORT_ORDER}>(() => {
    if (typeof window !== "undefined" && localStorage) {
      const savedInitialSorting = localStorage.getItem("projectsPageSorting");
      return savedInitialSorting
        ? JSON.parse(savedInitialSorting)
        : { title: "Projects", sort: SORT_ORDER.ASC };
    }
  });

	const { filteredProjectList, setShowOneClientProjects } = useProjectsDataContext();

	const columnHeaderTitles = [
    {
      title: "Clients",
      showIcon: true,
      onClick: () => setShowOneClientProjects(""),
    },
		{
			title: "Projects",
			showIcon: false,
		},
  ];

	const assignments = filteredProjectList?.flatMap((project: ProjectType) => project.assignments || []);

	return (
    <>
      {filteredProjectList.length ? (
        <ScrollingCalendar
          title="Projects"
          columnHeaderTitles={columnHeaderTitles}
          assignments={assignments}
          initialSorting={initialSorting}
        >
          {filteredProjectList?.map((project: ProjectType, index: number) => {
            return (
              <AllProjectRow
                key={project.id}
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
