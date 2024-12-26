"use client";
import React, {useEffect, useState} from "react";

import { ProjectType } from "../typeInterfaces";
import { LoadingSpinner } from "../components/loadingSpinner";
import { ScrollingCalendar } from "../components/scrollingCalendar/scrollingCalendar";
import { AllProjectRow } from "../components/allProjects/allProjectRow";
import { SORT_ORDER } from "../components/scrollingCalendar/constants";
import { useProjectsDataContext } from "../contexts/projectsDataContext";
import CreateProjectForm from "../components/createProjectForm";
import InlineButtonArchivedProject from "../components/inlineButtonArchivedProject";
import { useGeneralDataContext } from "../contexts/generalContext";
import { AddProjectForm } from "../components/allProjects/addProjectForm";


const ProjectsView: React.FC = () => {
	const [initialSorting, setInitialSorting] = useState<{title: string; sort: SORT_ORDER}>(() => {
    if (typeof window !== "undefined" && localStorage) {
      const savedInitialSorting = localStorage.getItem("projectsPageSorting");
      return savedInitialSorting
        ? JSON.parse(savedInitialSorting)
        : { title: "Projects", sort: SORT_ORDER.ASC };
    }
  });

  const { isProjectDataLoading, filteredProjectList, setShowOneClientProjects } = useProjectsDataContext();
  const { setIsAddNewProject } = useGeneralDataContext();

	const columnHeaderTitles = [
    {
      title: "Clients",
      showIcon: false,
      onClick: () => setShowOneClientProjects(""),
    },
    {
      title: "Projects",
      showIcon: true,
      onIconClick: () => setIsAddNewProject(true),
    },
  ];

  useEffect(() => {
    return () => setIsAddNewProject(false)
  }, [])

	const assignments = filteredProjectList?.flatMap((project: ProjectType) => project.assignments || []);

	return (
    <>
      {isProjectDataLoading ? (
        <LoadingSpinner />
      ) : filteredProjectList.length ? (
        <ScrollingCalendar
          title="Projects"
          columnHeaderTitles={columnHeaderTitles}
          assignments={assignments}
          initialSorting={initialSorting}
        >
          {[
            <AddProjectForm
              key="addForm"
            />,
            ...filteredProjectList.map((project: ProjectType) => (
              <AllProjectRow
                key={project.id}
                project={project}
                monthData={{ monthLabel: "", year: 0 }}
                isFirstMonth={true}
                isLastMonth={true}
              />
            )),
            ]}
            <InlineButtonArchivedProject/>
        </ScrollingCalendar>
      ) : (
        <CreateProjectForm/>
      )}
    </>
  );
};

export default ProjectsView;
