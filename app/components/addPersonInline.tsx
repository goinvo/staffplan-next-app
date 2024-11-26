'use client'
import React, { useState } from "react";

import { useMutation } from "@apollo/client";
import { UserType, AssignmentType, ProjectType } from "@/app/typeInterfaces";
import { FaUser } from "react-icons/fa";
import { UPSERT_ASSIGNMENT } from "@/app/gqlQueries";
import { useUserDataContext } from "../contexts/userDataContext";
import { useProjectsDataContext } from "../contexts/projectsDataContext";

type AddPersonInlineProps = {
    assignment: AssignmentType;
    project?: ProjectType;
};

export const AddPersonInline = ({ project, assignment }: AddPersonInlineProps) => {

    const { userList, setUserList } = useUserDataContext()

    const { setProjectList } = useProjectsDataContext();
    const [selectedUserId, setSelectedUserId] = useState<string>("");

    const [upsertAssignment, { loading: mutationLoading }] = useMutation(UPSERT_ASSIGNMENT, {
        errorPolicy: "all",
        onCompleted: async ({ upsertAssignment }) => {
            if (upsertAssignment) {
                setProjectList((prevProjectList) => {
                    return prevProjectList?.map((project) => {
                        if (project.id === upsertAssignment?.project?.id) {
                            const updatedAssignments = (project.assignments || []).map((assignment) =>
                                assignment.id === upsertAssignment.id ? upsertAssignment : assignment
                            );

                            return {
                                ...project,
                                assignments: updatedAssignments,
                            };
                        }
                        return project;
                    });
                });
                setUserList((prev) =>
                    prev.map((user) =>
                        user.id === upsertAssignment.assignedUser.id
                            ? {
                                ...user,
                                assignments: [...user.assignments, upsertAssignment],
                            }
                            : user
                    )
                );
            }
        },
    });

    const availableUsers = userList?.filter((user: UserType) => {
        return !user.assignments?.some((userAssignment: AssignmentType) => {
            return userAssignment.project.id === project?.id;
        });
    });

    const handleUserChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const userId = e.target.value;
        setSelectedUserId(userId);
        if (userId) {
            const variables = {
                id: assignment.id,
                userId: userId,
                projectId: project ? project.id : "",
                status: "proposed",
            };
            upsertAssignment({
                variables: variables,
            });
        }
    };

    return (
        <div className='flex flex-row justify-between items-start'>
            <div className="hidden lg:flex h-[28px] w-[38px] rounded-md bg-blueGreyLight items-center justify-center rounded mr-2">
                <FaUser className="text-white h-6 w-4" />
            </div>
            <div>
                <form className="flex items-center justify-start">
                    <select
                        name="userId"
                        id="userId"
                        onChange={handleUserChange}
                        value={selectedUserId}
                        disabled={mutationLoading}
                        className={`md:min-w-[185px] h-[28px] pl-2 py-0 text-start rounded-md focus:ring-tiffany focus:border-tiffany text-tiny font-bold align-middle border-none shadow-top-input-shadow ${!selectedUserId ? 'text-contrastGrey' : 'text-contrastBlue'
                            }`}
                    >
                        <option value="" disabled hidden>
                            Add person
                        </option>
                        {availableUsers?.map((user: UserType) => (
                            <option key={user.id} value={user.id} className="font-bold text-contrastBlue">
                                {user.name}
                            </option>
                        ))}
                    </select>
                </form>
            </div>
        </div>
    );
};
