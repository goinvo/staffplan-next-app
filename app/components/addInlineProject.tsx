'use client';

import React, { useState, useRef } from "react";
import { useFormik } from 'formik';

import { ClientType, UserType } from "@/app/typeInterfaces";
import { AutocompleteInput } from "./autocompleteInput";
import { useMutation } from "@apollo/client";
import { UPSERT_PROJECT, UPSERT_CLIENT, UPSERT_ASSIGNMENT } from "@/app/gqlQueries";
import { useUserDataContext } from "../contexts/userDataContext";
import { useClientDataContext } from "../contexts/clientContext";
import { useProjectsDataContext } from "../contexts/projectsDataContext";

type AddInlineProjectProps = {
    user: UserType
}

type UpsertProjectVariables = {
    clientId: string,
    name: string,
    assignments: [{ userId: string }]
}

type UpsertAssignmentVariables = {
    projectId: string,
    userId: string,
    status: string
}

const AddInlineProject: React.FC<AddInlineProjectProps> = ({ user }) => {
    const [showNewClientModal, setShowNewClientModal] = useState<boolean>(false);
    const [confirmedClientToCreate, setConfirmedClientToCreate] = useState<boolean>(false);
    const clientInputRef = useRef<HTMLInputElement>(null);
    const { setUserList } = useUserDataContext()
    const { clientList, refetchClientList } = useClientDataContext()
    const { projectList, setProjectList } = useProjectsDataContext();

    const { id, assignments } = user;

    const [upsertClient] = useMutation(UPSERT_CLIENT, {
        errorPolicy: "all",
        onCompleted() {
            refetchClientList()
        },
    });

    const [upsertProject] = useMutation(UPSERT_PROJECT, {
        errorPolicy: "all",
        onCompleted({ upsertProject }) {
            if (upsertProject) {
                refetchClientList()
                setProjectList((prev) => [...prev, upsertProject]);
                setUserList((prev) =>
                    prev.map((user) =>
                        user.id === upsertProject.assignments?.[0].assignedUser.id
                            ? {
                                ...user,
                                assignments: [...user.assignments, ...upsertProject.assignments],
                            }
                            : user
                    )
                );
            }
        }
    });

    const [upsertAssignment] = useMutation(UPSERT_ASSIGNMENT, {
        errorPolicy: 'all',
        onCompleted({ upsertAssignment }) {
            refetchClientList()
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
            setProjectList((prevProjectList) => {
                return prevProjectList?.map((project) => {
                    if (project.id === upsertAssignment?.project?.id) {
                        return {
                            ...project,
                            assignments: [
                                ...(project.assignments || []),
                                upsertAssignment,
                            ],
                        };
                    }
                    return project;
                });
            });
        }
    });

    const validateForm = (values: { projectName: string, clientName: string }) => {
        const errors: { projectName?: string, clientName?: string } = {};
        if (!values.projectName) {
            errors.projectName = "Project name is required";
        }
        if (!values.clientName) {
            errors.clientName = "Client name is required";
        }

        const currentClient = clientList.find((client: ClientType) => client.name === values.clientName);

        if (currentClient) {
            const projectNameExists = assignments.some((assignment) =>
                assignment.project.name === values.projectName && assignment.project.client.id === currentClient.id
            );

            if (projectNameExists) {
                errors.projectName = "Project name already in use for this user";
            }
        }
        return errors;
    };

    const createNewProject = async (variables: UpsertProjectVariables) => {
        await upsertProject({
            variables
        });
    };

    const addNewAssignmentWithExistingProject = async (variables: UpsertAssignmentVariables) => {
        await upsertAssignment({
            variables
        });
    };

    const formik = useFormik({
        initialValues: {
            projectName: '',
            clientName: '',
        },
        validate: validateForm,
        onSubmit: async (values, { resetForm }) => {
            let clientId = clientList?.find(
                ({ name }: ClientType) => name === values.clientName
            )?.id;

            if (!clientId && !confirmedClientToCreate) {
                setShowNewClientModal(true);
                return;
            }

            if (confirmedClientToCreate) {
                const { data } = await upsertClient({
                    variables: { name: values.clientName },
                });
                clientId = data?.upsertClient?.id;
            }

            const foundProject = projectList.find((project) =>
                project.name === values.projectName && project.client.id === clientId
            );

            if (foundProject) {
                const projectInAssignments = assignments.some((assignment) =>
                    assignment.project.id === foundProject.id
                );

                if (!projectInAssignments) {
                    const variables: UpsertAssignmentVariables = {
                        projectId: String(foundProject.id),
                        userId: String(id),
                        status: 'proposed'
                    };

                    await addNewAssignmentWithExistingProject(variables);
                }
            } else {
                const variables: UpsertProjectVariables = {
                    clientId: String(clientId),
                    name: values.projectName,
                    assignments: [{ userId: String(id) }],
                };

                await createNewProject(variables);
            }
            setConfirmedClientToCreate(false);
            setShowNewClientModal(false);
            resetForm();
        },
    });

    const handleClientBlur = (e: React.ChangeEvent<HTMLInputElement>) => {
        formik.handleBlur(e);
        formik.submitForm()
    };

    const handleNewClientCancel = () => {
        setShowNewClientModal(false);
        setConfirmedClientToCreate(false);

        if (clientInputRef?.current) {
            clientInputRef?.current.focus();
        }
    };

    const handleNewClientConfirm = async () => {
        setConfirmedClientToCreate(true)
        formik.handleSubmit()
    };

    const handleClientChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        formik.handleChange(e);
    };

    const handleClientSelect = (client: ClientType) => {
        formik.setFieldValue("clientName", client.name);
    };

    const handleProjectNameBlur = (e: React.ChangeEvent<HTMLInputElement>) => {
        formik.handleBlur(e);
        formik.submitForm()
    }

    return (
        <tr className={`pl-5 sm:flex hidden border-b border-gray-300 hover:bg-hoverGrey min-h-[100px]`}>
            <td className='my-5 px-0 font-normal align-top max-w-2/5'>
                <form onSubmit={formik.handleSubmit} className="flex flex-row gap-4">
                    <div className="mr-1">
                        <AutocompleteInput
                            ref={clientInputRef}
                            items={clientList}
                            onItemSelect={handleClientSelect}
                            onChange={handleClientChange}
                            onBlur={handleClientBlur}
                            displayKey="name"
                            inputName="clientName"
                            placeholder="Client Name"
                            value={formik.values.clientName}
                            inputClassName="py-2 pl-3 max-w-[185px] max-h-[28px] rounded-md shadow-sm focus:ring-tiffany focus:border-tiffany text-tiny font-bold text-contrastBlue align-center"
                            dropdownClassName="max-w-[185px] p-2 rounded-sm text-tiny z-30"
                            listClassName="p-2 z-34"
                        />
                        {formik.touched.clientName && formik.errors.clientName ? (
                            <p className="text-red-500 text-xs pl-1">{formik.errors.clientName}</p>
                        ) : null}
                    </div>
                    <div className="ml-1">
                        <input
                            autoComplete="off"
                            id="projectName"
                            name="projectName"
                            type="text"
                            value={formik.values.projectName}
                            onChange={formik.handleChange}
                            onBlur={handleProjectNameBlur}
                            className="py-2 max-w-[185px] max-h-[28px] text-tiny font-bold shadow-top-input-shadow rounded-sm focus:border-tiffany focus:ring-2 focus:ring-tiffany border-none focus:border-tiffany outlined-none text-contrastBlue"
                            placeholder="Project Name"
                        />
                        {formik.touched.projectName && formik.errors.projectName ? (
                            <p className="text-red-500 max-w-[185px] text-xs pl-1">{formik.errors.projectName}</p>
                        ) : null}
                    </div>
                </form>
                {showNewClientModal && (
                    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
                        <div className="bg-white p-6 rounded-md shadow-md">
                            <p className="mb-4">Is &quot;{formik.values.clientName}&quot; a new client?</p>
                            <div className="flex justify-center">
                                <button
                                    className="mr-2 px-4 py-2 text-tiny font-bold bg-tiffany rounded-sm text-white"
                                    onClick={handleNewClientConfirm}
                                >
                                    Yes
                                </button>
                                <button
                                    className="px-4 py-2 text-tiny font-bold bg-contrastGrey rounded-sm text-white"
                                    onClick={handleNewClientCancel}
                                >
                                    No
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </td>
        </tr>
    );
};

export default AddInlineProject;
