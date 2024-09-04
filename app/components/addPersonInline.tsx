import React from "react";
import { useMutation } from "@apollo/client";
import { FormikValues, Formik } from "formik";

import { FaUser } from "react-icons/fa";

import { UPSERT_PROJECT } from "@/app/gqlQueries";
import { useUserDataContext } from "@/app/userDataContext";

// import { MdQuestionMark } from "react-icons/md";

export const AddPersonInline = () => {
    const { refetchProjectList, refetchUserList } = useUserDataContext();
    const initialValues = {
        name: ''
    };

    const [upsertProject] = useMutation(UPSERT_PROJECT, {
        errorPolicy: "all",
        onCompleted({ upsertProject }) {
            refetchProjectList();
            refetchUserList();

        },
    });

    const onSubmitUpsert = (values: FormikValues) => {
        // const variables = {
        //     name: values.name,
        // };
        // upsertProject({
        //     variables: variables,
        // })
    };
    // <MdQuestionMark className="text-black h-3 w-3" />
    return (
        <tr className={`flex hover:bg-hoverGrey min-h-[100px] pt-2 mx-2`}>
            <td className='pl-2 pr-0 pt-1 pb-2 font-normal flex align-center w-1/3'>
                <div
                    className='flex flex-row justify-between items-start pl-1 pr-1'
                >

                    <div className="h-7 w-9 rounded-md bg-gray-400 flex items-center justify-center rounded mr-2">
                        <FaUser className="text-white h-5 w-5" />
                    </div>
                    <div className="mr-auto">
                        <Formik
                            onSubmit={(e) => onSubmitUpsert(e)}
                            initialValues={initialValues}
                        >
                            {({
                                handleChange,
                                values,
                                setErrors,
                                handleSubmit,
                                handleBlur,
                                errors,
                                touched,
                                isValid,
                            }) => (
                                <form className="flex items-center justify-start" onSubmit={handleSubmit}>
                                    <input
                                        autoComplete="off"
                                        id="name"
                                        name="name"
                                        value={values.name}
                                        onBlur={(e) => {
                                            handleBlur(e)
                                            handleSubmit()
                                        }}
                                        onChange={(e) => {
                                            handleChange(e);
                                        }}
                                        className="w-50 max-h-[28px] rounded-md shadow-sm focus:ring-accentgreen focus:border-accentgreen text-tiny font-bold text-contrastBlue"
                                        placeholder="Add Person"
                                    />
                                </form>
                            )}
                        </Formik>
                    </div >
                </div>
            </td>
        </tr>
    );
};

