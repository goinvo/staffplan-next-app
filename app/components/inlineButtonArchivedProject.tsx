"use client";
import React from "react";

import { useProjectsDataContext } from "../contexts/projectsDataContext";
import { useGeneralDataContext } from "../contexts/generalContext";

const InlineButtonArchivedProject: React.FC = () => {

  const { showArchivedProjects, setShowArchivedProjects } = useGeneralDataContext();
  const { projectList } = useProjectsDataContext();

  const archivedProjects = projectList.filter((p) => p.status === "archived");

  const label = showArchivedProjects
    ? `Hide ${archivedProjects.length} archived ${archivedProjects.length > 1 ? 'projects' : 'project'}`
    : `Show ${archivedProjects.length} archived ${archivedProjects.length > 1 ? 'projects' : 'project'}`

  return (
    <>
      {archivedProjects.length > 0 ? (
        <div className="h-[100px] w-full">
          <button
            className="ml-5 mt-2 py-1"
            onClick={() => setShowArchivedProjects(!showArchivedProjects)}
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
