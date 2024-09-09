'use client'

import React, { useState, useRef } from "react";
import { useFormik, FormikValues } from 'formik';

import { ClientType, ProjectType } from "../typeInterfaces";
import { useUserDataContext } from "../userDataContext";
import { useMutation } from "@apollo/client";
import { UPSERT_PROJECT, UPSERT_CLIENT } from "@/app/gqlQueries";
import { AutocompleteInput } from "./autocompleteInput";

export const ChooseClientModal = ({ projectName, closeModal, userId, resetProjectName }: any) => {
    const {
        projectList,
        clientList,
        setClientList,
        refetchProjectList,
        refetchUserList
    } = useUserDataContext();

    const [showNewClientModal, setShowNewClientModal] = useState<boolean>(false);
    const clientInputRef = useRef<HTMLInputElement>(null);

    const [
        upsertClient,
        { data: mutationData, loading: mutationLoading, error: mutationError },
    ] = useMutation(UPSERT_CLIENT, {
        errorPolicy: "all",
        onCompleted({ upsertClient }) {
            setClientList([...clientList, upsertClient]);
        },
    });

    const [upsertProject] = useMutation(UPSERT_PROJECT, {
        errorPolicy: "all",
        onCompleted({ upsertProject }) {
            refetchProjectList();
            refetchUserList();
        },
    });

    const validateForm = (values: FormikValues) => {
        const errors: Partial<Record<keyof FormikValues, string | {}>> = {};
        if (!values.clientName) errors.clientName = "Client is required";

        const currentClient = clientList.find((client: ClientType) => client.name === values.clientName);
        if (values.projectName && currentClient) {
            const projectNameExists = projectList.find((project: ProjectType) =>
                project.name === values.projectName && currentClient.id === project.client.id);
            if (projectNameExists) {
                errors.clientName = "Project name already in use";
            }
        }

        return errors;
    }

    const formik = useFormik({
        initialValues: {
            clientName: '',
            projectName: projectName
        },
        validate: validateForm,
        onSubmit: async (values) => {
            let clientId = clientList?.find(
                ({ name }: ClientType) => name === values.clientName
            )?.id;
            const variables = {
                clientId,
                name: projectName,
                assignments: [{ userId: userId }]
            };
            if (!clientId) {
                const { data } = await upsertClient({
                    variables: { name: values.clientName },
                });
                clientId = data?.upsertClient?.id;
            }
            upsertProject({
                variables: variables,
            })
            closeModal()
            resetProjectName()
        },
    });

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (formik.dirty) {
            formik.handleSubmit();
        }
    };

    const handleClientChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        formik.handleChange(e);
    };

    const handleClientBlur = (e: React.ChangeEvent<HTMLInputElement>) => {
        formik.handleBlur(e)
        const inputValue = e.target.value

        if (inputValue) {
            const existedClient = clientList?.find(
                ({ name }: ClientType) => name === inputValue
            );
            if (!existedClient) {
                setShowNewClientModal(true);
            }

        }
    };

    const handleClientSelect = (client: ClientType) => {
        formik.setFieldValue("clientName", client.name);
    };

    const handleNewClientCancel = () => {
        setShowNewClientModal(false)

        if (clientInputRef?.current) {
            clientInputRef?.current.focus();
        }
    }

    const handleCancelNewProject = () => {
        resetProjectName()
        closeModal()
    }
    return (
        <form onSubmit={handleSubmit} className='flex flex-col' >
            <div className='flex flex-col mt-1 mb-1'>
                <span className="text-center text-md">Choose the client</span>
                <AutocompleteInput
                    ref={clientInputRef}
                    items={clientList}
                    onItemSelect={handleClientSelect}
                    onChange={handleClientChange}
                    onBlur={handleClientBlur}
                    displayKey="name"
                    inputName="clientName"
                    placeholder="Client"
                    inputClassName="h-8 px-2 w-[200px] rounded-sm"
                    dropdownClassName="w-[200px]"
                    listClassName="p-2"
                    tabIndex={-1}
                    value={formik.values.clientName}
                />
                {formik.touched.clientName && formik.errors.clientName ? (
                    <p className="text-tiny px-2 text-red-500">{formik.errors.clientName}</p>
                ) : null}
            </div>
            {showNewClientModal && (
                <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
                    <div className="bg-white p-6 rounded-md shadow-md">
                        <p className="mb-4">Is &quot;{formik.values.clientName}&quot; a new client?</p>
                        <div className="flex justify-center">
                            <button
                                className="mr-2 px-4 py-2 text-tiny font-bold bg-tiffany rounded-sm text-white"
                                onClick={() => setShowNewClientModal(false)}
                            >
                                Yes
                            </button>
                            <button
                                className="px-4 py-2 text-tiny font-bold bg-contrastGrey rounded-sm text-white"
                                onClick={() => handleNewClientCancel()}
                            >
                                No
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <div className="flex justify-between my-4">
                <button
                    type='submit'
                    className='w-full mx-2 h-6 text-tiny font-bold bg-tiffany rounded-sm text-white'
                    disabled={!formik.isValid}
                >
                    Save
                </button>
                <button onClick={handleCancelNewProject} className='w-full mx-2 h-6 text-tiny font-bold bg-contrastGrey rounded-sm text-white'>Cancel</button>
            </div>
        </form >
    );
};