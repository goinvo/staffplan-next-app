
import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import NewPersonForm from './newPersonForm';
import NewProjectForm from './newProjectForm';


interface ModalProps {
    view?: 'project' | 'person'
    openModal: boolean
}

const NewPersonAndProjectModal = ({ view = 'person', openModal }: ModalProps) => {
    const [selectedView, setSelectedView] = useState<'project' | 'person'>(view);
    const [showModal, setShowModal] = useState<boolean>(openModal)

    return (
        <Dialog open={showModal} onClose={() => setShowModal(false)}>
            <div className="fixed inset-0 bg-black bg-opacity-30" aria-hidden="true" />
            <div className="fixed inset-0 flex items-center justify-center p-4">
                <Dialog.Panel className="timeline-grid-bg rounded-lg p-6 text-contrastBlue max-w-md mx-auto">
                    <div className='flex flex-row justify-center'>
                        <button
                            className={`h-10 w-[170px] rounded-sm ml-auto mr-3 text-tiny border border-contrastGrey ${selectedView === 'project' ? 'bg-contrastGrey font-bold' : ''}`}
                            onClick={() => setSelectedView('project')}
                        >New project
                        </button>
                        <button
                            className={`h-10 w-[170px] rounded-sm mr-auto ml-3 text-tiny border border-contrastGrey ${selectedView === 'person' ? 'bg-contrastGrey font-bold' : ''}`}
                            onClick={() => setSelectedView('person')}
                        >
                            New person
                        </button>
                    </div>
                    {selectedView === 'person' && <NewPersonForm closeModal={() => setShowModal(false)} />}
                    {selectedView === 'project' && <NewProjectForm closeModal={() => setShowModal(false)} />}
                </Dialog.Panel>
            </div>
        </Dialog >
    );
};

export default NewPersonAndProjectModal;
