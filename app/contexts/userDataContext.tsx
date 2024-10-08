"use client";
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { useApolloClient, useQuery } from "@apollo/client";

import {
    UserType,
    AssignmentType
} from "../typeInterfaces";
import {
    GET_USER_LIST
} from "../gqlQueries";
import { sortSingleUser, sortUserList } from "../helperFunctions";
import { useGeneralDataContext } from "./generalContext";

export interface UserDataContextType {
    userList: UserType[] | [];
    singleUserPage: UserType | null;
    viewsFilterPeople: string;
    viewsFilterSingleUser: string;
    setViewsFilterSingleUser: React.Dispatch<React.SetStateAction<string>>;
    setUserList: React.Dispatch<React.SetStateAction<UserType[] | []>>;
    setViewsFilterPeople: React.Dispatch<React.SetStateAction<string>>;
    setSingleUserPage: React.Dispatch<React.SetStateAction<UserType | null>>;
    refetchUserList: () => void;
    setSelectedUserData: (id: number) => void;
}

const UserDataContext = createContext<UserDataContextType | undefined>(
    undefined
);

export const useUserDataContext = () => {
    const context = useContext(UserDataContext);
    if (context === undefined) {
        throw new Error(
            "useUserDataContext must be used within a UserListProvider"
        );
    }
    return context;
};

export const UserListProvider: React.FC<{ children?: ReactNode, initialData?: any }> = ({
    children
}) => {
    const client = useApolloClient();
    const isClient = typeof window !== "undefined";
    const [userList, setUserList] = useState<UserType[] | []>([]);
    const [singleUserPage, setSingleUserPage] = useState<UserType | null>(null);
    const [viewsFilterPeople, setViewsFilterPeople] = useState<any>("abcUserName");
    const [viewsFilterSingleUser, setViewsFilterSingleUser] = useState('byClient')
    const { showArchivedProjects } = useGeneralDataContext()
    const {
        loading: userListLoading,
        error: userListError,
        data: userListData,
    } = useQuery(GET_USER_LIST, {
        context: {
            headers: {
                cookie: isClient ? document.cookie : null,
            },
        },
        skip: !isClient,
        errorPolicy: "all",
    });

    useEffect(() => {
        if (userListData) {
            const sortedUserList = sortUserList(
                viewsFilterPeople,
                userListData.currentCompany.users
            );
            setUserList(sortedUserList);
        }
    }, [userListData, viewsFilterPeople]);

    const refetchUserList = () => {
        client
            .query({
                query: GET_USER_LIST,
                context: {
                    headers: {
                        cookie: isClient ? document.cookie : null,
                    },
                },
                errorPolicy: "all",
            })
            .then((result) => {

                const sortedUserList = sortUserList(
                    viewsFilterPeople,
                    result.data.currentCompany.users
                );
                setUserList(sortedUserList);
            });
    };

    const setSelectedUserData = useCallback(
        (newSelectedId: number) => {
            if (!userList.length) return;

            const selectedUserData = userList.find(
                (user: UserType) => user.id?.toString() === newSelectedId.toString()
            );
            if (!selectedUserData) return;

            if (!showArchivedProjects) {
                const showArchivedProjectsUserData = selectedUserData.assignments.filter(
                    (assignment: AssignmentType) => assignment.status !== "archived"
                );
                return setSingleUserPage(
                    sortSingleUser(viewsFilterSingleUser, {
                        ...selectedUserData,
                        assignments: showArchivedProjectsUserData,
                    })
                );
            }

            setSingleUserPage(
                sortSingleUser(viewsFilterSingleUser, selectedUserData)
            );
        },
        [userList, showArchivedProjects, viewsFilterSingleUser]
    );
    return (
        <UserDataContext.Provider
            value={{
                userList,
                viewsFilterPeople,
                singleUserPage,
                viewsFilterSingleUser,
                setViewsFilterSingleUser,
                setViewsFilterPeople,
                setUserList,
                setSingleUserPage,
                refetchUserList,
                setSelectedUserData
            }}
        >
            {children}
        </UserDataContext.Provider>
    );
};
