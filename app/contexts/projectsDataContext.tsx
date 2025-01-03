"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from "react";
import { useApolloClient, useQuery } from "@apollo/client";

import { ProjectType, AssignmentType, UndoableModifiedProject } from "../typeInterfaces";
import { GET_ALL_PROJECTS_DATA } from "../gqlQueries";
import { sortProjectList, sortProjectListByOrder, sortSingleProject, sortSingleProjectByOrder } from "../helperFunctions";
import { useGeneralDataContext } from "./generalContext";
import { useTaskQueue } from "../hooks/useTaskQueue";
import useBeforeUnload from "../hooks/useBeforeUnload";
import { SORT_ORDER } from "../components/scrollingCalendar/constants";

type EnqueueTimerParams = {
  project: ProjectType;
  updatedProject: ProjectType;
  finalAction: () => Promise<void>;
  undoAction: (modifiedAssignments: UndoableModifiedProject[]) => void
  finalApiCall?: () => void;
};

export interface ProjectsDataContextType {
  newAssignedUsersId: number[];
  isProjectDataLoading: boolean;
  newProjectId: number | null;
  projectList: ProjectType[] | [];
  singleProjectPage: ProjectType;
  sortOrder: SORT_ORDER;
  sortBy: string;
  sortOrderSingleProject: SORT_ORDER;
  viewsFilterProject: string;
  filteredProjectList: ProjectType[] | [];
  sortedSingleProjectAssignments: AssignmentType[];
  viewsFilterSingleProject: string;
  projectsWithUndoActions: UndoableModifiedProject[];
  showOneClientProjects: string;
  setNewAssignedUsersId: React.Dispatch<React.SetStateAction<number[]>>;
  setIsProjectDataLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setNewProjectId: React.Dispatch<React.SetStateAction<number | null>>;
  undoModifyProject: (projectId: number) => void;
  setViewsFilterSingleProject: React.Dispatch<React.SetStateAction<string>>;
  setProjectList: React.Dispatch<React.SetStateAction<ProjectType[] | []>>;
  setFilteredProjectList: React.Dispatch<
    React.SetStateAction<ProjectType[] | []>
  >;
  setSortOrder: React.Dispatch<React.SetStateAction<SORT_ORDER>>;
  setSortBy: React.Dispatch<React.SetStateAction<string>>;
  setSortOrderSingleProject: React.Dispatch<React.SetStateAction<SORT_ORDER>>;
  setViewsFilterProject: React.Dispatch<React.SetStateAction<string>>;
  setSingleProjectPage: React.Dispatch<React.SetStateAction<ProjectType>>;
  refetchProjectList: () => void;
  enqueueTimer: (params: EnqueueTimerParams) => void;
  setShowOneClientProjects: React.Dispatch<React.SetStateAction<string>>;
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
  const [newAssignedUsersId, setNewAssignedUsersId] = useState<number[]>([]);
  const [isProjectDataLoading, setIsProjectDataLoading] = useState(true)
  const [newProjectId, setNewProjectId] = useState<number | null>(null);
  const [projectList, setProjectList] = useState<ProjectType[] | []>([]);
  const [filteredProjectList, setFilteredProjectList] = useState<ProjectType[] | []>([])
  const [singleProjectPage, setSingleProjectPage] = useState<any>(null);
  const [sortOrder, setSortOrder] = useState<SORT_ORDER>(SORT_ORDER.ASC);
  const [sortBy, setSortBy] = useState<string>("Projects");
  const [sortOrderSingleProject, setSortOrderSingleProject] = useState<SORT_ORDER>(SORT_ORDER.ASC);
  const [viewsFilterProject, setViewsFilterProject] = useState<string>("abcProjectName")
  const [viewsFilterSingleProject, setViewsFilterSingleProject] = useState<string>("abcUserName")
  const [projectsWithUndoActions, setProjectsWithUndoActions] = useState<UndoableModifiedProject[]>([]);
  const [showOneClientProjects, setShowOneClientProjects] = useState<string>('')
  const { isFirstShowArchivedProjects, showArchivedProjects, showArchivedAssignments } = useGeneralDataContext()
  const { enqueueTask } = useTaskQueue();
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
    setIsProjectDataLoading(projectDataLoading);
  }, [projectDataLoading])

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
    
    const newProject = newProjectId ? projectList.filter((project) => Number(project.id) === newProjectId) : []
    const projectListToSort = newProjectId
      ? projectList.filter((project) => Number(project.id) !== newProjectId)
      : projectList;
    
    const sortedList = sortProjectListByOrder(sortOrder, sortBy, projectListToSort);

    if (sortedList) {
      const filteredByClient = showOneClientProjects
        ? sortedList.filter((project: ProjectType) => project.client.id.toString() === showOneClientProjects)
        : sortedList;
      
      const filteredArchivedProjects = isFirstShowArchivedProjects
        ? [...filteredByClient.filter((project: ProjectType) => project.status !== "archived"), ...filteredByClient.filter((project: ProjectType) => project.status === "archived")]
        : filteredByClient
      
      const finalFilteredList = !showArchivedProjects
        ? filteredByClient.filter((project: ProjectType) => project.status !== "archived")
        : filteredArchivedProjects

      return [...newProject, ...finalFilteredList];
    }
  }, [projectList, sortOrder, sortBy, showArchivedProjects, showOneClientProjects]);

  useEffect(() => {
    if (sortedAndFilteredProjects) {
      setFilteredProjectList(sortedAndFilteredProjects)
    }

  }, [sortedAndFilteredProjects]);

  const sortedSingleProjectAssignments = useMemo(() => {
    const assignments = (singleProjectPage?.assignments || []) as AssignmentType[];

    const assignmentsTBD = assignments.filter((a) => !a?.assignedUser);
    const assignmentsNotToSort = assignments
      .filter((a) => (a?.assignedUser && newAssignedUsersId.includes(Number(a?.assignedUser?.id))))
      .sort((a, b) => {
        const indexA = newAssignedUsersId.indexOf(Number(a?.assignedUser?.id));
        const indexB = newAssignedUsersId.indexOf(Number(b?.assignedUser?.id));
        return indexB - indexA;
      });
    const assignmentsToSort = assignments.filter((a) => (a?.assignedUser && !newAssignedUsersId.includes(Number(a?.assignedUser?.id))));

    const assignmentsToSet = [...assignmentsTBD, ...assignmentsNotToSort, ...sortSingleProjectByOrder(sortOrderSingleProject, assignmentsToSort)];

    return assignmentsToSet
  }, [sortOrderSingleProject, singleProjectPage, newAssignedUsersId.length]);

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
        const sortedProjectList = sortProjectListByOrder(
          sortOrder,
          sortBy,
          result.data.currentCompany.projects
        );
        if (showArchivedProjects && sortedProjectList) {
          return setProjectList(sortedProjectList);
        }
        setProjectList(
          (sortedProjectList ?? []).filter(
            (project: ProjectType) => project.status !== "archived"
          )
        );
      });
  };

  const handleFinalDelete = useCallback((updatedProject: ProjectType) => {
    setProjectsWithUndoActions((prev) => prev.filter(({ project: p }) => p.id !== updatedProject.id));
  }, []);

  // Clear timeouts 
  useBeforeUnload(() => {
    projectsWithUndoActions.forEach(({ timerId, finalApiCall }) => {
      clearTimeout(timerId);
      finalApiCall?.();
    });
  })
  const undoModifyProject = useCallback(async (projectId: number) => {
    const restored = projectsWithUndoActions.find(({ project }) => project.id === projectId);
    if (!restored) return;
    if (restored?.undoAction) {
      restored.undoAction(projectsWithUndoActions)
    }
    clearTimeout(restored.timerId);
    setProjectsWithUndoActions((prev) => prev.filter(({ project }) => project.id !== projectId));
  }, [projectsWithUndoActions]);

  const enqueueTimer = ({ project, updatedProject, finalAction, undoAction }: EnqueueTimerParams) => {
    const timerId = enqueueTask(async () => {
      await finalAction();
      handleFinalDelete(updatedProject);
    }, 20000);

    setProjectsWithUndoActions((prev) => [
      ...prev,
      { project, timerId, undoAction }
    ]);
  };

  return (
    <ProjectsDataContext.Provider
      value={{
        newAssignedUsersId,
        isProjectDataLoading,
        newProjectId,
        projectList,
        viewsFilterProject,
        singleProjectPage,
        sortOrder,
        sortBy,
        sortOrderSingleProject,
        filteredProjectList,
        sortedSingleProjectAssignments,
        viewsFilterSingleProject,
        projectsWithUndoActions,
        showOneClientProjects,
        setNewAssignedUsersId,
        setIsProjectDataLoading,
        setNewProjectId,
        undoModifyProject,
        enqueueTimer,
        setSortOrder,
        setSortBy,
        setSortOrderSingleProject,
        setViewsFilterSingleProject,
        setFilteredProjectList,
        setProjectList,
        setViewsFilterProject,
        setSingleProjectPage,
        refetchProjectList,
        setShowOneClientProjects,
      }}
    >
      {children}
    </ProjectsDataContext.Provider>
  );
}
