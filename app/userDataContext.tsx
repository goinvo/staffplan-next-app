"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { useApolloClient, useQuery } from "@apollo/client";
import {
	ProjectType,
	ClientType,
	UserType,
	ViewerType,
	ViewsFiltersType,
} from "./typeInterfaces";
import {
	GET_USER_LIST,
	GET_ALL_CLIENTS_DATA,
	GET_ALL_PROJECTS_DATA,
	GET_CLIENT_DATA,
	GET_VIEWER,
} from "./gqlQueries";
import { sortProjectList, sortUserList } from "./helperFunctions";
import {
	currentQuarter,
	currentYear,
} from "./components/scrollingCalendar/scrollingCalendar";

export interface UserDataContextType {
	userList: any;
	setUserList: React.Dispatch<React.SetStateAction<any>>;
	dateRange: any;
	setDateRange: React.Dispatch<React.SetStateAction<any>>;
	projectList: ProjectType[];
	setProjectList: React.Dispatch<React.SetStateAction<ProjectType[]>>;
	clientList: ClientType[];
	setClientList: React.Dispatch<React.SetStateAction<ClientType[]>>;
	viewer: ViewerType;
	setViewer: React.Dispatch<React.SetStateAction<ViewerType>>;
	viewsFilter: ViewsFiltersType;
	setViewsFilter: React.Dispatch<React.SetStateAction<ViewsFiltersType>>;
	singleUserPage: UserType;
	setSingleUserPage: React.Dispatch<React.SetStateAction<UserType>>;
	singleProjectPage: ProjectType;
	setSingleProjectPage: React.Dispatch<React.SetStateAction<ProjectType>>;
	scrollToTodayFunction: () => void;
	refetchUserList: () => void;
	refetchProjectList: () => void;
	refetchClientList: () => void;
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
	const client = useApolloClient();
	const [clientSide, setClientSide] = useState(false);
	const [dateRange, setDateRange] = useState({
		quarter: currentQuarter,
		year: currentYear,
	});
	const [userList, setUserList] = useState<any>(null);
	const [projectList, setProjectList] = useState<any>(null);
	const [clientList, setClientList] = useState<any>(null);
	const [singleUserPage, setSingleUserPage] = useState<any>(null);
	const [singleProjectPage, setSingleProjectPage] = useState<any>(null);
	const [viewer, setViewer] = useState<any>(null);
	const [viewsFilter, setViewsFilter] = useState<ViewsFiltersType>({
		selectedProjectSort: "abcProjectName",
		selectedUserSort: "abcUserName",
		singleUserSort: "byClient",
		singleProjectSort: "abcUserName",
		assignmentSort: "slim",
		rollupSort: "none",
		showSummaries: true,
		showArchivedProjects: false,
		showInactiveUsers: false,
	});
	const scrollToTodayFunction = () => {
		setDateRange({
			quarter: currentQuarter,
			year: currentYear,
		});
	};
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
	} = useQuery(GET_ALL_CLIENTS_DATA, {
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
			const sortedUserList = sortUserList(
				viewsFilter.selectedUserSort,
				userListData.currentCompany.users
			);
			setUserList(sortedUserList);
		}
	}, [userListData, viewsFilter]);

	useEffect(() => {
		if (projectData && projectData.currentCompany?.projects) {
			const sortedProjectList = sortProjectList(
				viewsFilter.selectedProjectSort,
				projectData.currentCompany?.projects
			);
			if (viewsFilter.showArchivedProjects) {
				return setProjectList(sortedProjectList);
			}
			setProjectList(
				sortedProjectList?.filter(
					(project: ProjectType) => project.status !== "archived"
				)
			);
		}
	}, [projectData, viewsFilter]);

	useEffect(() => {
		if (clientData) {
			setClientList(clientData.currentCompany.clients);
		}
	}, [clientData]);

	useEffect(() => {
		if (viewerData) {
			setViewer(viewerData.viewer);
		}
	}, [viewerData]);
	const refetchClientList = () => {
		client
			.query({
				query: GET_CLIENT_DATA,
				context: {
					headers: {
						cookie: clientSide ? document.cookie : null,
					},
				},
				errorPolicy: "all",
			})
			.then((result) => {
				setClientList(result.data.clients);
			});
	};
	const refetchUserList = () => {
		client
			.query({
				query: GET_USER_LIST,
				context: {
					headers: {
						cookie: clientSide ? document.cookie : null,
					},
				},
				errorPolicy: "all",
			})
			.then((result) => {
				const sortedUserList = sortUserList(
					viewsFilter.selectedUserSort,
					result.data.currentCompany.users
				);
				setUserList(sortedUserList);
			});
	};

	const refetchProjectList = () => {
		client
			.query({
				query: GET_ALL_PROJECTS_DATA,
				context: {
					headers: {
						cookie: clientSide ? document.cookie : null,
					},
				},
				errorPolicy: "all",
			})
			.then((result) => {
				const sortedProjectList = sortProjectList(
					viewsFilter.selectedProjectSort,
					result.data.currentCompany.projects
				);
				if (viewsFilter.showArchivedProjects) {
					return setProjectList(sortedProjectList);
				}
				setProjectList(
					sortedProjectList?.filter(
						(project: ProjectType) => project.status !== "archived"
					)
				);
			});
	};
	return (
		<UserDataContext.Provider
			value={{
				userList,
				setUserList,
				projectList,
				setProjectList,
				clientList,
				setClientList,
				dateRange,
				setDateRange,
				viewer,
				setViewer,
				viewsFilter,
				setViewsFilter,
				scrollToTodayFunction,
				singleUserPage,
				setSingleUserPage,
				singleProjectPage,
				setSingleProjectPage,
				refetchClientList,
				refetchUserList,
				refetchProjectList,
			}}
		>
			{children}
		</UserDataContext.Provider>
	);
};
