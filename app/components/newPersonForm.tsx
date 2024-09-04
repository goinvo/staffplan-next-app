import React from 'react';
import { useFormik } from 'formik';

interface NewPersonFormProps {
    closeModal: () => void
}

const NewPersonForm = ({ closeModal }: NewPersonFormProps) => {
    const formik = useFormik({
        initialValues: {
            firstName: '',
            lastName: '',
            userEmail: '',
            isAdmin: false,
        },
        onSubmit: (values) => {
            const fullName = `${values.firstName} ${values.lastName}`;
            const newValues = {
                userName: fullName,
                userEmail: values.userEmail,
                isAdmin: values.isAdmin
            };
            console.log('Form values:', newValues);
            closeModal()
            // Here will be logic for create new user
        },
    });

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (formik.dirty) {
            formik.handleSubmit()
        } else {
            console.log('Nothing to submit')
        }
    };

    return (
        <form onSubmit={handleSubmit} className='flex flex-col'>
            <div className='flex flex-col mt-1 mb-1'>
                <label className='py-1 text-tiny' >First name</label>
                <input
                    type="text"
                    name="firstName"
                    value={formik.values.firstName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="h-10 px-2 rounded-sm shadow-top-input-shadow font-bold border-none focus:border-tiffany focus:ring-2 focus:ring-tiffany border-none focus:border-tiffany outlined-none y text-huge text-contrastBlue max-w-[370px]"
                    placeholder="First name"
                />
                {formik.touched.firstName && formik.errors.firstName ? (
                    <p className="text-red-500">{formik.errors.firstName}</p>
                ) : null}
            </div>
            <div className='flex flex-col mt-1 mb-1'>
                <label className='py-1 text-tiny'>Last name</label>
                <input
                    type="text"
                    name="lastName"
                    value={formik.values.lastName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="h-10 px-2 text-huge shadow-top-input-shadow font-bold border-none rounded-sm focus:border-tiffany focus:ring-2 focus:ring-tiffany border-none focus:border-tiffany outlined-none text-contrastBlue max-w-[370px]"
                    placeholder="Last name"
                />
            </div>
            <div className='flex flex-col mt-1 mb-1'>
                <label className='py-1 text-tiny'>Email</label>
                <input
                    type="text"
                    name="userEmail"
                    value={formik.values.userEmail}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="h-6 px-2 text-tiny shadow-top-input-shadow font-normal focus:border-tiffany focus:ring-2 focus:ring-tiffany border-none focus:border-tiffany outlined-none text-contrastBlue max-w-[370px]"
                    placeholder="email"
                />
                {formik.touched.userEmail && formik.errors.userEmail ? (
                    <div className="text-red-500">{formik.errors.userEmail}</div>
                ) : null}
            </div>
            <div className="flex items-center py-1 mt-1 mb-1">
                <input
                    type="checkbox"
                    name="isAdmin"
                    checked={formik.values.isAdmin}
                    onChange={formik.handleChange}
                    id="adminCheckbox"
                    className="h-4 w-4 appearance-none shadow-top-input-shadow border rounded-sm checked:bg-tiffany focus:outline-none focus:ring-2 focus:ring-tiffany transition-all"
                />
                <label htmlFor="adminCheckbox" className="font-normal text-contrastBlue text-tiny pl-2">Admin</label>
            </div>
            <button type='submit' className='w-full h-10 text-tiny font-bold bg-tiffany rounded-sm text-white py-1 mb-4 mt-2'>Save</button>
            <button onClick={closeModal} className='w-full h-10 text-tiny font-bold bg-contrastGrey rounded-sm text-white py-1 mb-1'>Cancel</button>
        </form>
    );
};

export default NewPersonForm;

