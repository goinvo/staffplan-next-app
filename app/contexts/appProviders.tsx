import React, { ReactNode } from "react";
import { ProjectsListProvider } from "./projectsDataContext";
import { UserListProvider } from "./userDataContext";
import { GeneralDataProvider } from "./generalContext";
import { ModalProvider } from "./modalContext";
import { ClientDataProvider } from "./clientContext";

const AppProviders: React.FC<{ children: ReactNode }> = ({ children }) => {
    return (
        <GeneralDataProvider>
            <ModalProvider>
                <ProjectsListProvider>
                    <ClientDataProvider>
                        <UserListProvider>
                            {children}
                        </UserListProvider>
                    </ClientDataProvider>
                </ProjectsListProvider>
            </ModalProvider>
        </GeneralDataProvider >
    );
};

export default AppProviders;