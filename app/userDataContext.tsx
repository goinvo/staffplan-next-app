"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { useQuery } from "@apollo/client";
import { ProjectType, ClientType, ViewerType } from "./typeInterfaces";
import {
	GET_USER_LIST,
	GET_ALL_PROJECTS_DATA,
	GET_CLIENT_DATA,
	GET_VIEWER,
} from "./gqlQueries";

export interface UserDataContextType {
	userList: any;
	setUserList: React.Dispatch<React.SetStateAction<any>>;
	projectList: ProjectType[];
	setProjectList: React.Dispatch<React.SetStateAction<ProjectType[]>>;
	clientList: ClientType[];
	setClientList: React.Dispatch<React.SetStateAction<ClientType[]>>;
	viewer: ViewerType;
	setViewer: React.Dispatch<React.SetStateAction<ViewerType>>;
	scrollToTodayFunction: () => void;
	setScrollToTodayFunction: React.Dispatch<React.SetStateAction<() => void>>;
}

// Initialize the context
const UserDataContext = createContext<UserDataContextType | undefined>(
	undefined
);

// Create a custom hook for easier use of context
export const useUserDataContext = () => {
	const context = useContext(UserDataContext);
	if (context === undefined) {
		throw new Error(
			"useUserDataContext must be used within a UserListProvider"
		);
	}
	return context;
};

// Create a context provider component
export const UserListProvider: React.FC<React.PropsWithChildren<{}>> = ({
	children,
}) => {
	const [clientSide, setClientSide] = useState(false);
	const [userList, setUserList] = useState<any>(null);
	const [projectList, setProjectList] = useState<any>(null);
	const [clientList, setClientList] = useState<any>(null);
	const [viewer, setViewer] = useState<any>(null);
	const [scrollToTodayFunction, setScrollToTodayFunction] = useState<any>(() => {});
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
	const {
		loading: projectDataLoading,
		error: projectDataError,
		data: projectData,
	} = useQuery(GET_ALL_PROJECTS_DATA, {
		context: {
			headers: {
				cookie: clientSide ? document.cookie : null,
			},
		},
		skip: !clientSide,
		errorPolicy: "all",
	});

	const {
		loading: clientDataLoading,
		error: clientDataError,
		data: clientData,
	} = useQuery(GET_CLIENT_DATA, {
		context: {
			headers: {
				cookie: clientSide ? document.cookie : null,
			},
		},
		skip: !clientSide,
		errorPolicy: "all",
	});
	const {
		loading: viewerLoading,
		error: viewerError,
		data: viewerData,
	} = useQuery(GET_VIEWER, {
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
			setUserList(userListData.currentCompany.users);
		}
	}, [userListData]);

	useEffect(() => {
		if (projectData && projectData.currentCompany?.projects) {
			setProjectList(projectData.currentCompany?.projects);
		}
	}, [projectData]);

	useEffect(() => {
		if (clientData) {
			setClientList(clientData.clients);
		}
	}, [clientData]);

	useEffect(() => {
		if (viewerData) {
			setViewer(viewerData.viewer);
		}
	}, [viewerData]);

	return (
		<UserDataContext.Provider
			value={{
				userList,
				setUserList,
				projectList,
				setProjectList,
				clientList,
				setClientList,
				viewer,
				setViewer,
				scrollToTodayFunction,
				setScrollToTodayFunction,
			}}
		>
			{children}
		</UserDataContext.Provider>
	);
};
