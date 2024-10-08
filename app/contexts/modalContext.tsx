'use client'
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ModalContextType {
    isModalOpen: boolean;
    modalContent: ReactNode;
    openModal: (content: ReactNode) => void;
    closeModal: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);


export const ModalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [modalContent, setModalContent] = useState<ReactNode>(null);

    const openModal = (content: ReactNode) => {
        setModalContent(content);
        setIsModalOpen(true);
    };
    const closeModal = () => {
        setIsModalOpen(false);
        setModalContent(null);
    };

    return (
        <ModalContext.Provider value={{ isModalOpen, openModal, closeModal, modalContent }}>
            {children}
        </ModalContext.Provider>
    );
};

export const useModal = () => {
    const context = useContext(ModalContext);
    if (!context) {
        throw new Error('useModal must be used within a ModalProvider');
    }
    return context;
};
