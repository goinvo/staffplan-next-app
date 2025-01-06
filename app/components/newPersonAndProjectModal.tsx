
import React, { useState } from 'react';
import NewPersonForm from './newPersonForm';
import NewProjectForm from './newProjectForm';


interface ModalProps {
    closeModal: () => void
}

const NewPersonAndProjectModal = ({ closeModal }: ModalProps) => {
    const [selectedView, setSelectedView] = useState<'project' | 'person'>('project');

    return (
        <>
            <div className='flex flex-row justify-center'>
                {/* <button
                    className={`h-10 w-[170px] rounded-sm m-auto text-tiny border border-lightGrey ${selectedView === 'project' ? 'bg-lightGrey font-bold' : ''}`}
                    onClick={() => setSelectedView('project')}
                >New project
                </button> */}
                {/* <button
                    className={`h-10 w-[170px] rounded-sm mr-auto ml-3 text-tiny border border-contrastGrey ${selectedView === 'person' ? 'bg-contrastGrey font-bold' : ''}`}
                    onClick={() => setSelectedView('person')}
                >
                    New person
                </button> */}
            </div>

            {/* {selectedView === 'person' && <NewPersonForm closeModal={closeModal} />} */}
            {selectedView === 'project' && <NewProjectForm closeModal={closeModal} isModalView />}
        </>
    );
};

// uncomment commented codebase when backend will be done for creating new user

export default NewPersonAndProjectModal;
