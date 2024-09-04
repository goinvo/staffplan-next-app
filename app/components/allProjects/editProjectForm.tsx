'use client';

import React, { useState, useRef } from 'react';
import { useFormik } from 'formik';
import { useParams, useRouter } from 'next/navigation';
import { useMutation } from "@apollo/client";

import { IoCheckmarkCircle } from "react-icons/io5";
import { ArchiveBoxIcon } from '@heroicons/react/24/solid';

import IconButton from '../iconButton';
import { useUserDataContext } from '../../userDataContext';
import { ProjectType, ClientType } from "../../typeInterfaces";
import { UPSERT_PROJECT, UPSERT_CLIENT } from "@/app/gqlQueries";

interface EditFormProps {
    onClose?: () => void;
}

const EditProjectForm: React.FC<EditFormProps> = ({
    onClose,
}) => {
    const {
        projectList,
        refetchProjectList,
        viewsFilter,
        refetchClientList,
        clientList
    } = useUserDataContext();

    const params = useParams();
    const router = useRouter()
    const selectedProjectId = decodeURIComponent(params.projectId.toString());
    const selectedProject = projectList.find(
        (project: ProjectType) => project.id.toString() === selectedProjectId
    )
    const { name, startsOn, endsOn, hours, client: { name: clientName, id: clientId }, id, status } = selectedProject as ProjectType
    const [archivedStatus, setArchivedStatus] = useState(status === 'archived');
    const [previousStatus] = useState(status);
    const [filteredClients, setFilteredClients] = useState<ClientType[]>(clientList);
    const [showDropdown, setShowDropdown] = useState<boolean>(false);
    const [showNewClientModal, setShowNewClientModal] = useState<boolean>(false);
    const clientInputRef = useRef<HTMLInputElement>(null);

    const [upsertProject] = useMutation(UPSERT_PROJECT, {
        errorPolicy: "all",
        onCompleted({ upsertProject }) {
            refetchProjectList();
            if (archivedStatus && !viewsFilter.showArchivedProjects) {
                router.push('/projects');
            }
        },
    });
    const [
        upsertClient,
        { data: mutationData, loading: mutationLoading, error: mutationError },
    ] = useMutation(UPSERT_CLIENT, {
        errorPolicy: "all",
        onCompleted({ upsertClient }) {
            refetchClientList()
        },
    });

    const formik = useFormik({
        initialValues: {
            projectName: name || '',
            clientName: clientName || '',
            clientId: clientId,
            budget: '',
            hours: hours,
            startsOn: startsOn || '',
            endsOn: endsOn || '',
            projectStatus: status
        },
        onSubmit: async (values) => {
            let clientId = clientList?.find(
                (client) => client.name.toLowerCase() === values.clientName.toLowerCase()
            )?.id;

            if (!clientId) {
                const { data } = await upsertClient({
                    variables: { name: values.clientName },
                });
                clientId = data?.upsertClient?.id;
            }
            const variables = {
                id: id,
                clientId: clientId,
                name: values.projectName,
                hours: +values.hours,
                ...(values.startsOn && { startsOn: values.startsOn }),
                ...(values.endsOn && { endsOn: values.endsOn }),
                status: values.projectStatus,
            };
            await upsertProject({
                variables,
            });

            onClose?.();
        },
    });

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (formik.dirty) {
            formik.handleSubmit();
        } else {
            onClose?.();
        }
    };


    const handleArchiveButtonClick = () => {
        setArchivedStatus(!archivedStatus);
        const newStatus = !archivedStatus ? 'archived' : (previousStatus !== 'archived' ? previousStatus : 'unconfirmed');
        formik.setFieldValue('projectStatus', newStatus);
    };

    const handleClientSelect = (clientName: string) => {
        formik.setFieldValue("clientName", clientName);
        setShowDropdown(false);
    };


    const handleClientChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = e.target.value.toLowerCase();
        formik.handleChange(e);

        if (inputValue) {
            const filtered = clientList.filter(client =>
                client.name.toLowerCase().includes(inputValue)
            );
            setFilteredClients(filtered);
            setShowDropdown(true);
        } else {
            setFilteredClients(clientList);
            setShowDropdown(false);
        }
    };

    const handleClientFocus = () => {
        setShowDropdown(true);
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

    const onAutocompleteClientInputBlur = () => {
        setTimeout(() => setShowDropdown(false), 100)
    };

    const handleNewClientCancel = () => {
        setShowNewClientModal(false)

        if (clientInputRef?.current) {
            clientInputRef?.current.focus();
        }
    }

    return (
        <form onSubmit={handleSubmit} className='flex flex-col space-y-2 my-2 text-contrastBlue'>
            <div className='flex flex-row justify-start pl-1'>
                <input
                    type="text"
                    name="projectName"
                    value={formik.values.projectName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="h-10 mr-2 px-2 rounded-sm shadow-top-input-shadow focus:border-tiffany focus:ring-2 focus:ring-tiffany border-none focus:border-tiffany outlined-none text-huge max-w-[300px]"
                    placeholder="Project Name"
                />
                {formik.touched.projectName && formik.errors.projectName ? (
                    <p className="text-red-500">{formik.errors.projectName}</p>
                ) : null}
                <IconButton className="text-tiffany" type='submit' Icon={IoCheckmarkCircle} iconSize='h-7 w-7 ml-1' />
            </div>
            <div className='flex flex-row justify-between'>
                <div className="relative flex items-center" onBlur={onAutocompleteClientInputBlur}>
                    <label htmlFor="clientName" className="pr-2 text-white font-normal text-tiny w-[55px] text-right">Client</label>
                    <input
                        ref={clientInputRef}
                        type="text"
                        name="clientName"
                        value={formik.values.clientName}
                        onChange={handleClientChange}
                        onBlur={handleClientBlur}
                        onFocus={handleClientFocus}
                        id="clientName"
                        autoComplete="off"
                        className="h-6 px-2 text-tiny shadow-top-input-shadow font-normal rounded-sm focus:border-tiffany focus:ring-2 focus:ring-tiffany border-none focus:border-tiffany outlined-none max-w-[100px]"
                        placeholder="Client"
                    />
                    {showDropdown && !!filteredClients.length && (
                        <ul className="absolute font-normal px-1 bg-white rounded-sm border border-gray-300 max-h-40 overflow-y-auto w-full z-10 left-0 top-full mt-1">
                            {filteredClients.map((client: ClientType) => (
                                <li
                                    key={client.id}
                                    className="hover:bg-gray-200 cursor-pointer"
                                    onMouseDown={() => handleClientSelect(client.name)}
                                >
                                    {client.name}
                                </li>
                            ))}
                        </ul>
                    )}
                    {formik.touched.clientName && formik.errors.clientName ? (
                        <p className="text-red-500 ml-2">{formik.errors.clientName}</p>
                    ) : null}
                </div>
                <IconButton
                    className={`text-black  ${archivedStatus ? 'text-tiffany' : 'text-transparentGrey'}`}
                    onClick={handleArchiveButtonClick}
                    Icon={ArchiveBoxIcon}
                    iconSize='h-7 w-7'
                />
            </div>
            <div className='flex flex-row justify-between'>
                <div className='flex items-center'>
                    <label htmlFor="budget" className="pr-2 text-white font-normal text-tiny w-[55px] text-right">Budget</label>
                    <input
                        type="text"
                        name="budget"
                        value={formik.values.budget}
                        disabled={true} // Temporary disabled for future integration.
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        id="budget"
                        className="h-6 px-2 shadow-top-input-shadow text-tiny font-normal rounded-sm focus:border-tiffany focus:ring-2 focus:ring-tiffany border-none focus:border-tiffany outlined-none max-w-[100px]"
                        placeholder="Budget"
                    />
                    {formik.touched.budget && formik.errors.budget ? (
                        <p className="text-red-500">{formik.errors.budget}</p>
                    ) : null}
                </div>
                <div className='flex items-center'>
                    <label htmlFor="hours" className="pr-2 text-white font-normal text-tiny w-[55px] text-right">Hours</label>
                    <input
                        type="text"
                        name="hours"
                        value={formik.values.hours}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        id="hours"
                        className="h-6 px-2 shadow-top-input-shadow text-tiny font-normal rounded-sm focus:border-tiffany focus:ring-2 focus:ring-tiffany border-none focus:border-tiffany outlined-none max-w-[100px]"
                        placeholder="Hours"
                    />
                    {formik.touched.hours && formik.errors.hours ? (
                        <p className="text-red-500">{formik.errors.hours}</p>
                    ) : null}
                </div>
            </div>

            <div className='flex flex-row justify-between'>
                <div className='flex items-center'>
                    <label htmlFor="startsOn" className="pr-2 text-white font-normal text-tiny w-[55px] text-right">Starts</label>
                    <input
                        type="date"
                        name="startsOn"
                        value={formik.values.startsOn}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        id="startsOn"
                        className="h-6 px-2 shadow-top-input-shadow text-tiny font-normal rounded-sm focus:border-tiffany focus:ring-2 focus:ring-tiffany border-none focus:border-tiffany outlined-none max-w-[100px]"
                        placeholder="Start date"
                    />
                    {formik.touched.startsOn && formik.errors.startsOn ? (
                        <p className="text-red-500">{formik.errors.startsOn}</p>
                    ) : null}
                </div>
                <div className='flex items-center'>
                    <label htmlFor="endsOn" className="pr-2 text-white font-normal text-tiny w-[55px] text-right">Ends</label>
                    <input
                        type="date"
                        name="endsOn"
                        value={formik.values.endsOn}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        id="endsOn"
                        className="h-6 px-2 shadow-top-input-shadow text-tiny font-normal rounded-sm focus:border-tiffany focus:ring-2 focus:ring-tiffany border-none focus:border-tiffany outlined-none max-w-[100px]"
                        placeholder="End date"
                    />
                    {formik.touched.endsOn && formik.errors.endsOn ? (
                        <p className="text-red-500">{formik.errors.endsOn}</p>
                    ) : null}
                </div>
            </div>
            {
                showNewClientModal && (
                    <div className="fixed inset-0 font-normal bg-gray-800 bg-opacity-50 flex justify-center items-center z-10">
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
                )
            }
        </form >
    );
};

export default EditProjectForm;
