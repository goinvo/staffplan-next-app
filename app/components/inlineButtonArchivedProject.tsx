"use client";
import React from "react";

import { useProjectsDataContext } from "../contexts/projectsDataContext";
import { useGeneralDataContext } from "../contexts/generalContext";

const InlineButtonArchivedProject: React.FC = () => {

  const { showArchivedProjects, setShowArchivedProjects, setIsFirstShowArchivedProjects, setIsFirstHideArchivedProjects } = useGeneralDataContext();
  const { showOneClientProjects, projectList } = useProjectsDataContext();

  const archivedProjects = showOneClientProjects
    ? projectList.filter((p) => (p.client.id.toString() === showOneClientProjects && p.status === "archived"))
    : projectList.filter((p) => p.status === "archived");

  const label = showArchivedProjects
    ? `Hide ${archivedProjects.length} archived ${archivedProjects.length > 1 ? 'projects' : 'project'}`
    : `Show ${archivedProjects.length} archived ${archivedProjects.length > 1 ? 'projects' : 'project'}`

  return (
    <>
      {archivedProjects.length > 0 ? (
        <div className="h-[100px] w-full">
          <button
            className="ml-5 mt-2 py-1"
            onClick={() => {
              
              if (showArchivedProjects) {
                setIsFirstHideArchivedProjects(true);
                setTimeout(() => {setShowArchivedProjects(false)}, 600)
              }
              
              if (!showArchivedProjects) {
                setIsFirstShowArchivedProjects(true);
                setShowArchivedProjects(true);
              }
            }}
          >
            {label}
          </button>
        </div>
      ) : (
        <></>
      )}
    </>
  );
};

export default InlineButtonArchivedProject;
