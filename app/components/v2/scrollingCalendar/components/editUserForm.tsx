'use client';

import React from 'react';
import { useFormik } from 'formik';

import { IoCheckmarkCircle } from "react-icons/io5";

import ImageUploader from './ImageUploader';
import IconButton from '../../iconButton/iconButton';

interface EditFormProps {
    avatarUrl: string;
    userName: string;
    userEmail?: string;
    onClose?: () => void;
    onSave?: (newValues: { avatarUrl: string; userName: string; userEmail?: string; }) => void;
}

const EditUserForm: React.FC<EditFormProps> = ({
    avatarUrl,
    userName,
    onClose
}) => {
    const [firstName, lastName] = userName.split(' ');

    const formik = useFormik({
        initialValues: {
            avatarUrl: avatarUrl,
            firstName: firstName || '',
            lastName: lastName || '',
            userEmail: '',
            isAdmin: false,
        },
        onSubmit: (values) => {
            const fullName = `${values.firstName} ${values.lastName}`;
            const newValues = {
                avatarUrl: values.avatarUrl,
                userName: fullName,
                userEmail: values.userEmail,
            };
            console.log('Form values:', newValues);
            // Here will be logic for sending edited user info
        },
    });

    const handleImageChange = (imageUrl: string) => {
        formik.setFieldValue('avatarUrl', imageUrl);
    };

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (formik.dirty) {
            formik.handleSubmit()
            onClose?.()
        } else {
            console.log('No changes to submit');
            onClose?.()
        }
    };

    return (
        <form onSubmit={handleSubmit} className='flex flex-row space-y-2 my-2 text-white'>
            <ImageUploader
                imageUrl={formik.values.avatarUrl}
                onImageChange={handleImageChange}
            />
            <div className="flex flex-col space-y-2 text-contrastBlue">
                <div className='flex items-center'>
                    <input
                        type="text"
                        name="firstName"
                        value={formik.values.firstName}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className="h-10 px-2 rounded-md outline-none focus:outline-tiffany focus:ring-1 focus:ring-tiffany text-huge max-w-[200px]"
                        placeholder="First name"
                    />
                    {formik.touched.firstName && formik.errors.firstName ? (
                        <p className="text-red-500">{formik.errors.firstName}</p>
                    ) : null}
                    <IconButton className="text-tiffany" type='submit' Icon={IoCheckmarkCircle} iconSize='h-8 w-8 pl-1' />
                </div>
                <div className='flex'>
                    <input
                        type="text"
                        name="lastName"
                        value={formik.values.lastName}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className="h-8 px-2 text-tiny font-normal rounded-md outline-none focus:outline-tiffany focus:ring-1 focus:ring-tiffany min-w-[200px]"
                        placeholder="Last name"
                    />
                </div>
                <div className='flex'>
                    <input
                        type="text"
                        name="userEmail"
                        value={formik.values.userEmail}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className="h-8 px-2 text-tiny font-normal rounded-md outline-none focus:outline-tiffany focus:ring-1 focus:ring-tiffany min-w-[200px]"
                        placeholder="email"
                    />
                    {formik.touched.userEmail && formik.errors.userEmail ? (
                        <div className="text-red-500">{formik.errors.userEmail}</div>
                    ) : null}
                </div>
                <div className="flex items-center space-x-2">
                    <input
                        type="checkbox"
                        name="isAdmin"
                        checked={formik.values.isAdmin}
                        onChange={formik.handleChange}
                        id="adminCheckbox"
                        className="h-6 w-6 appearance-none border rounded-sm checked:bg-tiffany focus:outline-none focus:ring-2 focus:ring-tiffany transition-all"
                    />
                    <label htmlFor="adminCheckbox" className="text-white font-normal text-tiny">Admin</label>
                </div>
            </div>
        </form>
    );
};

export default EditUserForm;
