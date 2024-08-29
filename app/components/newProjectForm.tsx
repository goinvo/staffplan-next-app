import React from 'react';
import { useFormik } from 'formik';

interface NewProjectFormProps {
    closeModal: () => void
}

const NewPersonForm = ({ closeModal }: NewProjectFormProps) => {

    const formik = useFormik({
        initialValues: {
            projectName: '',
            clientName: '',
            budget: '',
            hours: '',
            startsOn: '',
            endsOn: ''
        },
        onSubmit: (values) => {
            console.log('Form values:', values);
            // Here will be logic for create new project
            closeModal()
        },
    });

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (formik.dirty) {
            formik.handleSubmit();
        } else {
            console.log('Nothing to submit')
        }
    };


    return (
        <form onSubmit={handleSubmit} className='flex flex-col' >
            <div className='flex flex-col mt-2 mb-2'>
                <label className='py-1 text-tiny' >Project name</label>
                <input
                    type="text"
                    name="projectName"
                    value={formik.values.projectName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="h-10 px-2 rounded-sm font-bold focus:border-tiffany focus:ring-2 focus:ring-tiffany border-none focus:border-tiffany outlined-none text-huge text-contrastBlue min-w-[370px]"
                    placeholder="Project name"
                />
                {formik.touched.projectName && formik.errors.projectName ? (
                    <p className="text-red-500">{formik.errors.projectName}</p>
                ) : null}
            </div>
            <div className='flex flex-col mt-1 mb-1'>
                <label className='py-1 text-tiny'>Client</label>
                <input
                    type="text"
                    name="clientName"
                    value={formik.values.clientName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="h-6 px-2 text-tiny rounded-sm focus:border-tiffany focus:ring-2 focus:ring-tiffany border-none focus:border-tiffany outlined-none  text-contrastBlue max-w-[370px]"
                    placeholder="Client name"
                />
            </div>
            <div className='flex flex-col mt-1 mb-1'>
                <label className='py-1 text-tiny'>Budget (optional)</label>
                <input
                    type="text"
                    name="budget"
                    value={formik.values.budget}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="h-6 px-2 text-tiny font-normal rounded-sm focus:border-tiffany focus:ring-2 focus:ring-tiffany border-none focus:border-tiffany outlined-none  text-contrastBlue max-w-[370px]"
                    placeholder="Budget"
                />
                {formik.touched.budget && formik.errors.budget ? (
                    <div className="text-red-500">{formik.errors.budget}</div>
                ) : null}
            </div>
            <div className='flex flex-col mt-1 mb-1'>
                <label className='py-1 text-tiny'>Hours (optional)</label>
                <input
                    type="text"
                    name="hours"
                    value={formik.values.hours}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="h-6 px-2 text-tiny font-normal rounded-sm focus:border-tiffany focus:ring-2 focus:ring-tiffany border-none focus:border-tiffany outlined-none  text-contrastBlue max-w-[370px]"
                    placeholder="Hours"
                />
                {formik.touched.hours && formik.errors.hours ? (
                    <div className="text-red-500">{formik.errors.hours}</div>
                ) : null}
            </div>
            <div className='flex flex-row justify-between'>
                <div className='flex flex-col mt-1 mb-1'>
                    <label className='py-1 text-tiny'>Start Date (optional)</label>
                    <input
                        type="date"
                        name="startsOn"
                        value={formik.values.startsOn}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className="h-6 px-2 text-tiny font-normal rounded-sm focus:border-tiffany focus:ring-2 focus:ring-tiffany border-none focus:border-tiffany outlined-none  text-contrastBlue max-w-[170px]"
                        placeholder="Start Date"
                    />
                    {formik.touched.hours && formik.errors.hours ? (
                        <div className="text-red-500">{formik.errors.hours}</div>
                    ) : null}
                </div>
                <div className='flex flex-col mt-1 mb-1'>
                    <label className='py-1 text-tiny'>Ends Date (optional)</label>
                    <input
                        type="date"
                        name="endsOn"
                        value={formik.values.endsOn}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className="h-6 px-2 text-tiny font-normal rounded-sm focus:border-tiffany focus:ring-2 focus:ring-tiffany border-none focus:border-tiffany outlined-none  text-contrastBlue max-w-[170px]"
                        placeholder="Ends On"
                    />
                    {formik.touched.hours && formik.errors.endsOn ? (
                        <div className="text-red-500">{formik.errors.endsOn}</div>
                    ) : null}
                </div>
            </div>
            <button type='submit' className='w-full h-10 text-tiny font-bold bg-tiffany rounded-sm text-white py-1 mb-4 mt-2'>Save</button>
            <button onClick={closeModal} className='w-full h-10 text-tiny font-bold bg-contrastGrey rounded-sm text-white py-1 mb-1'>Cancel</button>
        </form >
    );
};

export default NewPersonForm;
