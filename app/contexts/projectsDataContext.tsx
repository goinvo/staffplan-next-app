"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from "react";
import { useApolloClient, useQuery } from "@apollo/client";

import { ProjectType, AssignmentType } from "../typeInterfaces";
import { GET_ALL_PROJECTS_DATA } from "../gqlQueries";
import { sortProjectList, sortSingleProject } from "../helperFunctions";
import { useGeneralDataContext } from "./generalContext";

export interface ProjectsDataContextType {
  projectList: ProjectType[] | [];
  singleProjectPage: ProjectType;
  viewsFilterProject: string;
  filteredProjectList: ProjectType[] | [];
  sortedSingleProjectAssignments: AssignmentType[];
  viewsFilterSingleProject: string;
  setViewsFilterSingleProject: React.Dispatch<React.SetStateAction<string>>;
  setProjectList: React.Dispatch<React.SetStateAction<ProjectType[] | []>>;
  setFilteredProjectList: React.Dispatch<React.SetStateAction<ProjectType[] | []>>;
  setViewsFilterProject: React.Dispatch<React.SetStateAction<string>>;
  setSingleProjectPage: React.Dispatch<React.SetStateAction<ProjectType>>;
  refetchProjectList: () => void;
}

const ProjectsDataContext = createContext<ProjectsDataContextType | undefined>(
  undefined
);

export const useProjectsDataContext = () => {
  const context = useContext(ProjectsDataContext);
  if (context === undefined) {
    throw new Error(
      "useProjectsDataContext must be used within a ProjectsListProvider"
    );
  }
  return context;
};

export const ProjectsListProvider: React.FC<{ children?: ReactNode }> = ({
  children
}) => {
  const client = useApolloClient();
  const isClient = typeof window !== "undefined";
  const [projectList, setProjectList] = useState<ProjectType[] | []>([]);
  const [filteredProjectList, setFilteredProjectList] = useState<ProjectType[] | []>([])
  const [singleProjectPage, setSingleProjectPage] = useState<any>(null);
  const [viewsFilterProject, setViewsFilterProject] = useState<string>("abcProjectName")
  const [viewsFilterSingleProject, setViewsFilterSingleProject] = useState<string>("abcUserName")

  const { showArchivedProjects, showArchivedAssignments } = useGeneralDataContext()
  const {
    loading: projectDataLoading,
    error: projectDataError,
    data: projectData,
  } = useQuery(GET_ALL_PROJECTS_DATA, {
    context: {
      headers: {
        cookie: isClient ? document.cookie : null,
      },
    },
    skip: !isClient,
    errorPolicy: "all",
  });

  useEffect(() => {
    if (projectData && projectData.currentCompany?.projects) {
      const projectList = projectData.currentCompany?.projects
      setProjectList(projectList);
    }
  },
    //* Only need to fire effect once, when first data loaded
    [projectData]);

  const sortedAndFilteredProjects = useMemo(() => {
    if (!projectList.length) return [];
    const sortedList = sortProjectList(viewsFilterProject, projectList);
    if (!showArchivedProjects && sortedList) {
      return sortedList.filter((project: ProjectType) => project.status !== "archived");
    }

    return sortedList;
  }, [projectList, viewsFilterProject, showArchivedProjects]);

  useEffect(() => {
    if (sortedAndFilteredProjects) {
      setFilteredProjectList(sortedAndFilteredProjects)
    }

  }, [sortedAndFilteredProjects]);

  const sortedSingleProjectAssignments = useMemo(() => {
    const assignments = singleProjectPage?.assignments || [];
    const filteredAssignments = showArchivedAssignments
      ? assignments
      : assignments.filter((assignment: AssignmentType) => assignment.status !== 'archived');
    return sortSingleProject(
      viewsFilterSingleProject,
      filteredAssignments
    );
  }, [viewsFilterSingleProject, singleProjectPage, showArchivedAssignments]);

  const refetchProjectList = () => {
    client
      .query({
        query: GET_ALL_PROJECTS_DATA,
        context: {
          headers: {
            cookie: isClient ? document.cookie : null,
          },
        },
        errorPolicy: "all",
      })
      .then((result) => {
        const sortedProjectList = sortProjectList(
          viewsFilterProject,
          result.data.currentCompany.projects
        );
        if (!showArchivedProjects && sortedProjectList) {
          return setProjectList(sortedProjectList);
        }
        setProjectList(
          (sortedProjectList ?? []).filter(
            (project: ProjectType) => project.status !== "archived"
          )
        );
      });
  };

  return (
    <ProjectsDataContext.Provider
      value={{
        projectList,
        viewsFilterProject,
        singleProjectPage,
        filteredProjectList,
        sortedSingleProjectAssignments,
        viewsFilterSingleProject,
        setViewsFilterSingleProject,
        setFilteredProjectList,
        setProjectList,
        setViewsFilterProject,
        setSingleProjectPage,
        refetchProjectList,
      }}
    >
      {children}
    </ProjectsDataContext.Provider>
  );
}
