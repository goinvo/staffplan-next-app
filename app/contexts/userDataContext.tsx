"use client";
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { useApolloClient, useQuery } from "@apollo/client";
import { UserType, AssignmentType, UndoableModifiedAssignment } from "../typeInterfaces";
import { SORT_ORDER } from "../components/scrollingCalendar/constants";
import { GET_USER_LIST } from "../gqlQueries";
import { sortSingleUser, sortSingleUserByOrder, sortUserList, sortUserListByOrder } from "../helperFunctions";
import { useGeneralDataContext } from "./generalContext";
import { useTaskQueue } from '../hooks/useTaskQueue'
import useBeforeUnload from "../hooks/useBeforeUnload";

type EnqueueTimerParams = {
    assignment: AssignmentType;
    updatedAssignment: AssignmentType;
    finalAction: () => Promise<void>;
    undoAction?: (modifiedAssignments: UndoableModifiedAssignment[]) => void;
    finalApiCall?: () => void;
};
export interface UserDataContextType {
    userList: UserType[] | [];
    singleUserPage: UserType | null;
    sortOrder: SORT_ORDER;
    sortBy: string;
    viewsFilterPeople: string;
    viewsFilterSingleUser: string;
    assignmentsWithUndoActions: UndoableModifiedAssignment[]
    undoModifyAssignment: (assignmentId: number) => void;
    setViewsFilterSingleUser: React.Dispatch<React.SetStateAction<string>>;
    setUserList: React.Dispatch<React.SetStateAction<UserType[] | []>>;
    setSortOrder: React.Dispatch<React.SetStateAction<SORT_ORDER>>;
    setSortBy: React.Dispatch<React.SetStateAction<string>>;
    setViewsFilterPeople: React.Dispatch<React.SetStateAction<string>>;
    setSingleUserPage: React.Dispatch<React.SetStateAction<UserType | null>>;
    refetchUserList: () => void;
    setSelectedUserData: (id: number) => void;
    handleFinalDelete: (assignment: AssignmentType) => void;
    enqueueTimer: (params: EnqueueTimerParams) => void;
}

const UserDataContext = createContext<UserDataContextType | undefined>(undefined);

export const useUserDataContext = () => {
    const context = useContext(UserDataContext);
    if (!context) {
        throw new Error("useUserDataContext must be used within a UserListProvider");
    }
    return context;
};


export const UserListProvider: React.FC<{ children?: ReactNode; initialData?: any }> = ({ children }) => {
    const client = useApolloClient();
    const isClient = typeof window !== "undefined";
    const [userList, setUserList] = useState<UserType[] | []>([]);
    const [singleUserPage, setSingleUserPage] = useState<UserType | null>(null);
    const [sortOrder, setSortOrder] = useState<SORT_ORDER>(SORT_ORDER.ASC);
    const [sortBy, setSortBy] = useState<string>("Client");
    const [viewsFilterPeople, setViewsFilterPeople] = useState("abcUserName");
    const [viewsFilterSingleUser, setViewsFilterSingleUser] = useState("byClient");
    const [assignmentsWithUndoActions, setAssignmentsWithUndoActions] = useState<UndoableModifiedAssignment[]>([]);
    const { enqueueTask } = useTaskQueue();
    const { showArchivedProjects } = useGeneralDataContext();

    const { loading: userListLoading, error: userListError, data: userListData } = useQuery(GET_USER_LIST, {
        context: { headers: { cookie: isClient ? document.cookie : null } },
        skip: !isClient,
        errorPolicy: "all",
    });

    useEffect(() => {
      if (userListData) {
        const sortedUserList = sortUserListByOrder(sortOrder, userListData.currentCompany.users);
        setUserList(sortedUserList);
      }
    }, [userListData, sortOrder]);

    const refetchUserList = useCallback(() => {
        client.query({ query: GET_USER_LIST, context: { headers: { cookie: isClient ? document.cookie : null } }, errorPolicy: "all" })
            .then((result) => {
                const sortedUserList = sortUserList(viewsFilterPeople, result.data.currentCompany.users);
                setUserList(sortedUserList);
            });
    }, [client, viewsFilterPeople]);

    const setSelectedUserData = useCallback(
        (newSelectedId: number) => {
            if (!userList.length) return;
            const selectedUser = userList.find((user) => user.id?.toString() === newSelectedId.toString());
            if (!selectedUser) return;

            const filteredAssignments = showArchivedProjects
                ? selectedUser.assignments
                : selectedUser.assignments.filter((a) => a.status !== "archived");

            setSingleUserPage(sortSingleUserByOrder(sortOrder, sortBy, { ...selectedUser, assignments: filteredAssignments }));
        },
        [userList, showArchivedProjects, sortOrder, sortBy]
    );

    // Clear timeouts for all undoable modification assignments
    useBeforeUnload(() => {
        assignmentsWithUndoActions.forEach(({ timerId, finalApiCall }) => {
            finalApiCall?.();
            clearTimeout(timerId);
        });
    })

    const handleFinalDelete = useCallback((assignment: AssignmentType) => {
        setAssignmentsWithUndoActions((prev) => prev.filter(({ assignment: a }) => a.id !== assignment.id));
    }, []);

    const undoModifyAssignment = useCallback(async (assignmentId: number) => {
        const restored = assignmentsWithUndoActions.find(({ assignment }) => assignment.id === assignmentId);
        if (!restored) return;
        if (restored?.undoAction) {
            restored.undoAction(assignmentsWithUndoActions)
        }
        clearTimeout(restored.timerId);
        setAssignmentsWithUndoActions((prev) => prev.filter(({ assignment }) => assignment.id !== assignmentId));
    }, [assignmentsWithUndoActions]);


    const enqueueTimer = ({ assignment, updatedAssignment, finalAction, undoAction, finalApiCall }: EnqueueTimerParams) => {
        const timerId = enqueueTask(async () => {
            await finalAction();
            handleFinalDelete(updatedAssignment);
        }, 20000);

        setAssignmentsWithUndoActions((prev) => [
            ...prev,
            { assignment, timerId, undoAction, finalApiCall }
        ]);
    };

    return (
        <UserDataContext.Provider
            value={{
                userList,
                singleUserPage,
                sortOrder,
                sortBy,
                viewsFilterPeople,
                viewsFilterSingleUser,
                assignmentsWithUndoActions,
                handleFinalDelete,
                undoModifyAssignment,
                setViewsFilterSingleUser,
                setSortOrder,
                setSortBy,
                setViewsFilterPeople,
                setUserList,
                setSingleUserPage,
                refetchUserList,
                setSelectedUserData,
                enqueueTimer,
            }}
        >
            {children}
        </UserDataContext.Provider>
    );
};