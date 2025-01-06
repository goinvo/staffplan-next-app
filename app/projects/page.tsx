"use client";
import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

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
  const router = useRouter();
  const searchParams = useSearchParams();

	const [initialSorting, setInitialSorting] = useState<{title: string; sort: SORT_ORDER}>(() => {
    if (typeof window !== "undefined" && localStorage) {
      const savedInitialSorting = localStorage.getItem("projectsPageSorting");
      return savedInitialSorting
        ? JSON.parse(savedInitialSorting)
        : { title: "Projects", sort: SORT_ORDER.ASC };
    }
  });

  const { isProjectDataLoading, filteredProjectList, showOneClientProjects, setShowOneClientProjects, refetchProjectList } = useProjectsDataContext();
  const { isFirstShowArchivedProjects, isFirstHideArchivedProjects, setIsAddNewProject, setIsFirstShowArchivedProjects, setIsFirstHideArchivedProjects } = useGeneralDataContext();

	const columnHeaderTitles = [
    ...(!showOneClientProjects
      ? [
          {
            title: "Clients",
            showIcon: false,
            onClick: () => setShowOneClientProjects(""),
          },
        ]
      : []),
    {
      title: "Projects",
      showIcon: true,
      onIconClick: () => setIsAddNewProject(true),
    },
  ];

  useEffect(() => {
    if (isFirstShowArchivedProjects) {
      setTimeout(() => {
        setIsFirstShowArchivedProjects(false)
      }, 700)
    }

    if (isFirstHideArchivedProjects) {
      setTimeout(() => {
        setIsFirstHideArchivedProjects(false);
      }, 700);
    }

  }, [isFirstShowArchivedProjects, isFirstHideArchivedProjects])

  useEffect(() => {
    if (!showOneClientProjects && searchParams.has("client")) {
      router.push("/projects");
    }
    
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
