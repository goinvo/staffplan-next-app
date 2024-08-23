'use client';

import React from 'react';
import { useFormik } from 'formik';
import { IoCheckmarkCircle } from "react-icons/io5";
import { ArchiveBoxIcon } from '@heroicons/react/24/solid';

import IconButton from '../../iconButton/iconButton';

interface EditFormProps {
    projectName?: string;
    clientName?: string;
    budget?: string;
    hours?: string;
    startsOn?: string;
    endsOn?: string;
    onClose?: () => void;
    onSave?: (newValues: {
        projectName: string;
        clientName: string;
        budget: string;
        hours: string;
        startsOn: string;
        endsOn: string;
    }) => void;
}

const EditProjectForm: React.FC<EditFormProps> = ({
    projectName = "Flow Phase II",
    clientName = "Ipsos",
    budget = '$300000',
    hours = '1200',
    startsOn = '12/04/2022',
    endsOn = '12/07/2024',
    onClose,
    onSave
}) => {
    const formik = useFormik({
        initialValues: {
            projectName: projectName || '',
            clientName: clientName || '',
            budget: budget || '',
            hours: hours || '',
            startsOn: startsOn || '',
            endsOn: endsOn || ''
        },
        onSubmit: (values) => {
            console.log('Form values:', values);
            onSave?.(values);
            onClose?.();
            // Here will be logic for sending edited project info
        },
    });

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (formik.dirty) {
            formik.handleSubmit();
            onClose?.();
        } else {
            console.log('No changes to submit');
            onClose?.();
        }
    };

    return (
        <form onSubmit={handleSubmit} className='flex flex-col space-y-2 my-2 text-contrastBlue'>
            <div className='flex flex-row justify-start'>
                <input
                    type="text"
                    name="projectName"
                    value={formik.values.projectName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="h-10 px-2 rounded-md outline-none focus:outline-tiffany focus:ring-1 focus:ring-tiffany text-huge max-w-[300px]"
                    placeholder="Project Name"
                />
                {formik.touched.projectName && formik.errors.projectName ? (
                    <p className="text-red-500">{formik.errors.projectName}</p>
                ) : null}
                <IconButton className="text-tiffany" type='submit' Icon={IoCheckmarkCircle} iconSize='h-8 w-8 pl-1' />
            </div>
            <div className='flex flex-row justify-between'>
                <div className="flex items-center">
                    <label htmlFor="clientName" className="pr-2 text-white font-normal text-tiny w-[55px] text-right">Client</label>
                    <input
                        type="text"
                        name="clientName"
                        value={formik.values.clientName}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        id="clientName"
                        className="h-6 px-2 text-tiny font-normal rounded-md outline-none focus:outline-tiffany focus:ring-1 focus:ring-tiffany max-w-[100px]"
                        placeholder="Client"
                    />
                    {formik.touched.clientName && formik.errors.clientName ? (
                        <p className="text-red-500 ml-2">{formik.errors.clientName}</p>
                    ) : null}
                </div>
                <IconButton
                    className='text-black text-transparentGrey'
                    onClick={() => console.log('On archive box btn click')}
                    Icon={ArchiveBoxIcon}
                    iconSize='h-6 w-6'
                />
            </div>
            <div className='flex flex-row justify-between'>
                <div className='flex items-center'>
                    <label htmlFor="budget" className="pr-2 text-white font-normal text-tiny w-[55px] text-right">Budget</label>
                    <input
                        type="text"
                        name="budget"
                        value={formik.values.budget}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        id="budget"
                        className="h-6 px-2 text-tiny font-normal rounded-md outline-none focus:outline-tiffany focus:ring-1 focus:ring-tiffany max-w-[100px]"
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
                        className="h-6 px-2 text-tiny font-normal rounded-md outline-none focus:outline-tiffany focus:ring-1 focus:ring-tiffany max-w-[100px]"
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
                        type="text"
                        name="startsOn"
                        value={formik.values.startsOn}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        id="startsOn"
                        className="h-6 px-2 text-tiny font-normal rounded-md outline-none focus:outline-tiffany focus:ring-1 focus:ring-tiffany max-w-[100px]"
                        placeholder="Start date"
                    />
                    {formik.touched.startsOn && formik.errors.startsOn ? (
                        <p className="text-red-500">{formik.errors.startsOn}</p>
                    ) : null}
                </div>
                <div className='flex items-center'>
                    <label htmlFor="endsOn" className="pr-2 text-white font-normal text-tiny w-[55px] text-right">Ends</label>
                    <input
                        type="text"
                        name="endsOn"
                        value={formik.values.endsOn}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        id="endsOn"
                        className="h-6 px-2 text-tiny font-normal rounded-md outline-none focus:outline-tiffany focus:ring-1 focus:ring-tiffany max-w-[100px]"
                        placeholder="End date"
                    />
                    {formik.touched.endsOn && formik.errors.endsOn ? (
                        <p className="text-red-500">{formik.errors.endsOn}</p>
                    ) : null}
                </div>
            </div>
        </form >
    );
};

export default EditProjectForm;
