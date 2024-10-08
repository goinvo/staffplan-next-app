import React from 'react';
import { Dialog } from '@headlessui/react';
import { useModal } from '../contexts/modalContext';

const ModalController = () => {
    const { isModalOpen, closeModal, modalContent } = useModal();

    return (
        <Dialog open={isModalOpen} onClose={closeModal}>
            <div className="fixed inset-0 bg-black bg-opacity-30" aria-hidden="true" />
            <div className="fixed inset-0 flex items-center justify-center p-4">
                <Dialog.Panel className="timeline-grid-bg rounded-2xl p-4 text-contrastBlue max-w-md mx-auto">
                    {modalContent}
                </Dialog.Panel>
            </div>
        </Dialog>
    );
};

export default ModalController;
