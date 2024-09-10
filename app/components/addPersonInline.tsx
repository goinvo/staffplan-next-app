'use client'

import React, { useState } from "react";
import { useFormik } from "formik";

import { useMutation } from "@apollo/client";
import { UserType, AssignmentType, ProjectType } from "@/app/typeInterfaces";
import { FaUser } from "react-icons/fa";
import { UPSERT_ASSIGNMENT } from "@/app/gqlQueries";
import { useUserDataContext } from "@/app/userDataContext";

type AddPersonInlineProps = {
    assignment: AssignmentType;
    project: ProjectType
}
export const AddPersonInline = ({ project, assignment }: AddPersonInlineProps) => {
    const { refetchProjectList, refetchUserList, userList } = useUserDataContext();
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [upsertAssignment, { loading: mutationLoading, },] = useMutation(UPSERT_ASSIGNMENT, {
        errorPolicy: "all",
        onCompleted: async () => {
            await refetchProjectList();
            await refetchUserList();
            setIsSubmitted(true);
        },
    });
    const initialValues = {
        id: assignment.id,
        userId: "",
    };
    const formik = useFormik({
        initialValues: initialValues,
        onSubmit: (values) => {
            const variables = {
                id: assignment.id,
                userId: values.userId,
                projectId: project ? project.id : "",
                status: "proposed",
            };
            upsertAssignment({
                variables: variables,
            });
        },
    });

    const availableUsers = userList?.filter((user: UserType) => {
        return !user.assignments?.some((userAssignment: AssignmentType) => {
            return userAssignment.project.id === project.id;
        });
    });

    return (
        !isSubmitted && (<tr className={`flex hover:bg-hoverGrey min-h-[100px] pl-5 ${assignment.status === 'proposed' ? 'bg-diagonal-stripes' :
            ''}`}>
            <td className='px-0 pr-0 pt-2 pb-2 font-normal flex align-center w-1/3'>
                <div className='flex flex-row justify-between items-start'>
                    <div className="h-[28px] w-[38px] rounded-md bg-blueGreyLight flex items-center justify-center rounded mr-2">
                        <FaUser className="text-white h-6 w-4" />
                    </div>
                    <div>
                        <form className="flex items-center justify-start" onSubmit={formik.handleSubmit}>
                            <select
                                name="userId"
                                id="userId"
                                onChange={(e) => {
                                    formik.handleChange(e);
                                    formik.handleSubmit();
                                }}
                                onBlur={formik.handleBlur}
                                value={formik.values.userId}
                                disabled={mutationLoading}
                                className={`w-[185px] h-[28px] pl-2 py-0 text-start rounded-md focus:ring-tiffany focus:border-tiffany text-tiny font-bold align-middle border-none shadow-top-input-shadow ${!formik.values.userId ? 'text-contrastGrey' : 'text-contrastBlue'
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
            </td>
        </tr >)
    );
};


