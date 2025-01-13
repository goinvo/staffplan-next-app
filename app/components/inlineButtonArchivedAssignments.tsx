"use client";
import React from "react";

import { useParams } from "next/navigation";
import { useProjectsDataContext } from "../contexts/projectsDataContext";
import { useGeneralDataContext } from "../contexts/generalContext";
import { useUserDataContext } from "../contexts/userDataContext";

const InlineButtonArchivedAssignments: React.FC = () => {
  const params = useParams();

  const { viewer, showArchivedAssignments, setShowArchivedAssignments } = useGeneralDataContext();
  const { userList, singleUserPage, setSelectedUserData } = useUserDataContext();
  const { projectList } = useProjectsDataContext();

  const userId = decodeURIComponent(params?.userId?.toString());

  const archivedAssignments = viewer?.id.toString() === userId
    ? userList.find((user) => user.id?.toString() === viewer?.id.toString())?.assignments.filter((a) => a.project.status === "archived") || []
    : []

  const label = showArchivedAssignments
    ? `Hide ${archivedAssignments.length} archived ${archivedAssignments.length > 1 ? 'projects' : 'project'}`
    : `Show ${archivedAssignments.length} archived ${archivedAssignments.length > 1 ? 'projects' : 'project'}`

  return (
    <>
      {archivedAssignments.length > 0 ? (
        <div className="h-[100px] w-full border-t border-gray-300">
          <button
            className="ml-8 sm:ml-5 mt-2 py-1"
            onClick={() => setShowArchivedAssignments(!showArchivedAssignments)}
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

export default InlineButtonArchivedAssignments;