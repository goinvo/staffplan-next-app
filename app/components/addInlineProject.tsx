'use client'

import React, { useState } from "react";

import { useModal } from "../modalContext";
import { ChooseClientModal } from "./chooseClientModal"

type AddInlineProjectProps = {
    userId?: number
}
const AddInlineProject: React.FC<AddInlineProjectProps> = ({ userId }) => {
    const { openModal, closeModal } = useModal()
    const [projectName, setProjectName] = useState('');

    const resetProjectName = () => {
        setProjectName('');
    };

    const handleBlur = (e: React.ChangeEvent<HTMLInputElement>) => {
        const projectName = e.target.value
        if (!projectName) return
        openModal(<ChooseClientModal closeModal={closeModal} projectName={projectName} userId={userId} resetProjectName={resetProjectName} />)
    }


    return (
        <tr className={`pl-5 flex border-b border-gray-300 hover:bg-hoverGrey min-h-[100px]`}>
            <td className='my-5 font-normal align-top w-1/3'>
                <input
                    autoComplete="off"
                    id="projectName"
                    name="projectName"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    onBlur={(e) => {
                        handleBlur(e)
                    }}
                    className="py-2 max-w-[185px] max-h-[28px] rounded-md shadow-sm focus:ring-tiffany focus:border-tiffany text-tiny font-bold text-contrastBlue align-center"
                    placeholder="Project Name"
                />
            </td>
        </tr>
    );
};

export default AddInlineProject;
