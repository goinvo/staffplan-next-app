'use client'
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useQuery } from "@apollo/client";
import {
	UserType,
	AssignmentType,
	WorkWeekRenderDataType,
	WorkWeekType,
    ProjectType,
} from "./typeInterfaces";
import {
	GET_USER_ASSIGNMENTS,
	GET_USER_LIST,
    GET_ALL_PROJECTS_DATA,
} from "./gqlQueries";

export interface UserDataContextType {
    userList: any;
    setUserList: React.Dispatch<React.SetStateAction<any>>;
    projectList: ProjectType[];
    setProjectList: React.Dispatch<React.SetStateAction<ProjectType[]>>;
}

// Initialize the context
const UserDataContext = createContext<UserDataContextType | undefined>(undefined);

// Create a custom hook for easier use of context
export const useUserDataContext = () => {
    const context = useContext(UserDataContext);
    if (context === undefined) {
        throw new Error('useUserDataContext must be used within a UserListProvider');
    }
    return context;
};

// Create a context provider component
export const UserListProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
    const [clientSide, setClientSide] = useState(false);
    const [userList, setUserList] = useState<any>(null);
    const [projectList, setProjectList] = useState<any>(null);

    const {
        loading: userListLoading,
        error: userListError,
        data: userListData,
    } = useQuery(GET_USER_LIST, {
        context: {
            headers: {
                cookie: clientSide ? document.cookie : null,
            },
        },
        skip: !clientSide,
        errorPolicy: "all",
    });

	useEffect(() => {
		setClientSide(true);
	}, []);
	const { loading, error, data: projectData } = useQuery(GET_ALL_PROJECTS_DATA, {
		context: {
			headers: {
				cookie: clientSide ? document.cookie : null,
			},
		},
		skip: !clientSide,
		errorPolicy: "all",
	});

    useEffect(() => {
        setClientSide(true);
    }, []);

    useEffect(() => {
        if (userListData) {
            console.log("User list data: ", userListData);
            setUserList(userListData.currentCompany.users);
        }
    }, [userListData]);

    useEffect(() => {
		if (projectData && projectData.currentCompany?.projects) {
            console.log("Project data: ", projectData);
			setProjectList(projectData.currentCompany?.projects);
		}
		
	}, [projectData]);

    return (
        <UserDataContext.Provider value={{ userList, setUserList, projectList, setProjectList }}>
            {children}
        </UserDataContext.Provider>
    );
};
