"use client";
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode, useMemo } from "react";
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
    deleteAssignment: 'archive' | 'deleteMe' | '';
    newProjectAssignmentId: number | null;
    userList: UserType[] | [];
    filteredUserList: UserType[] | [];
    singleUserPage: UserType | null;
    sortOrder: SORT_ORDER;
    sortBy: string;
    viewsFilterPeople: string;
    viewsFilterSingleUser: string;
    assignmentsWithUndoActions: UndoableModifiedAssignment[]
    setDeleteAssignment: React.Dispatch<React.SetStateAction<'archive' | 'deleteMe' | ''>>;
    setNewProjectAssignmentId: React.Dispatch<React.SetStateAction<number | null>>;
    undoModifyAssignment: (assignmentId: number) => void;
    setViewsFilterSingleUser: React.Dispatch<React.SetStateAction<string>>;
    setUserList: React.Dispatch<React.SetStateAction<UserType[] | []>>;
    setFilteredUserList: React.Dispatch<React.SetStateAction<UserType[] | []>>;
    setSortOrder: React.Dispatch<React.SetStateAction<SORT_ORDER>>;
    setSortBy: React.Dispatch<React.SetStateAction<string>>;
    setViewsFilterPeople: React.Dispatch<React.SetStateAction<string>>;
    setSingleUserPage: React.Dispatch<React.SetStateAction<UserType | null>>;
    refetchUserList: () => void;
    sortUserList: (sorting: SORT_ORDER) => void;
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
    const [deleteAssignment, setDeleteAssignment] = useState<'archive' | 'deleteMe' | ''>('')
    const [newProjectAssignmentId, setNewProjectAssignmentId] = useState<number | null>(null);
    const [userList, setUserList] = useState<UserType[] | []>([]);
    const [filteredUserList, setFilteredUserList] = useState<UserType[] | []>([]);
    const [singleUserPage, setSingleUserPage] = useState<UserType | null>(null);
    const [sortOrder, setSortOrder] = useState<SORT_ORDER>(SORT_ORDER.ASC);
    const [sortBy, setSortBy] = useState<string>("Client");
    const [viewsFilterPeople, setViewsFilterPeople] = useState("abcUserName");
    const [viewsFilterSingleUser, setViewsFilterSingleUser] = useState("byClient");
    const [assignmentsWithUndoActions, setAssignmentsWithUndoActions] = useState<UndoableModifiedAssignment[]>([]);
    const { enqueueTask } = useTaskQueue();
    const { showArchivedAssignments, viewer, showInactiveUsers, isFirstShowInactiveUsers } = useGeneralDataContext();

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
    }, [userListData]);

    const sortUserList = (sorting: SORT_ORDER) => {
        const sortedUserList = sortUserListByOrder(sorting, userListData.currentCompany.users);
        setUserList(sortedUserList);
    }

    const refetchUserList = useCallback(() => {
        client.query({ query: GET_USER_LIST, context: { headers: { cookie: isClient ? document.cookie : null } }, errorPolicy: "all" })
            .then((result) => {
                const sortedUserList = sortUserListByOrder(sortOrder, result.data.currentCompany.users);
                setUserList(sortedUserList);
            });
    }, [client]);

    const setSelectedUserData = useCallback(
        (newSelectedId: number) => {
            if (!userList.length) return;
            const selectedUser = userList.find((user) => user.id?.toString() === newSelectedId.toString());
            if (!selectedUser) return;

            const newAssignment = newProjectAssignmentId ? selectedUser.assignments.filter(a => Number(a.project.id) === newProjectAssignmentId) : []
            const assignmentsToSort = newProjectAssignmentId
                ? selectedUser.assignments.filter((a) => Number(a.project.id) !== newProjectAssignmentId)
                : selectedUser.assignments;

            const filteredAssignments = showArchivedAssignments && viewer?.id.toString() === newSelectedId.toString()
                ? assignmentsToSort
                : assignmentsToSort.filter((a) => a.project.status !== "archived");

            const singleUser = sortSingleUserByOrder(sortOrder, sortBy, { ...selectedUser, assignments: filteredAssignments })
            const singleUserToSet = { ...singleUser, assignments: [...newAssignment, ...singleUser.assignments] };

            setSingleUserPage(singleUserToSet);
        },
        [userList, showArchivedAssignments, sortOrder, sortBy]
    );

    const sortedAndFilteredUsers = useMemo(() => {
        if (!userList.length) return [];

        const sortedList = sortUserListByOrder(sortOrder, userList);

        if (sortedList) {

            const filteredList = isFirstShowInactiveUsers
                ? [...sortedList.filter(user => user.isActive), ...sortedList.filter(user => !user.isActive)]
                : sortedList

            const finalFilteredList = !showInactiveUsers
                ? filteredList.filter((user) => user.isActive)
                : filteredList;
            
            return finalFilteredList;
        }
    }, [userList, sortOrder, showInactiveUsers]);
    
      useEffect(() => {
        if (sortedAndFilteredUsers) {
          setFilteredUserList(sortedAndFilteredUsers);
        }
      }, [sortedAndFilteredUsers]);

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
                deleteAssignment,
                newProjectAssignmentId,
                userList,
                filteredUserList, 
                singleUserPage,
                sortOrder,
                sortBy,
                viewsFilterPeople,
                viewsFilterSingleUser,
                assignmentsWithUndoActions,
                setDeleteAssignment,
                setNewProjectAssignmentId,
                handleFinalDelete,
                undoModifyAssignment,
                setViewsFilterSingleUser,
                setSortOrder,
                setSortBy,
                setViewsFilterPeople,
                setUserList,
                setFilteredUserList,
                setSingleUserPage,
                refetchUserList,
                sortUserList,
                setSelectedUserData,
                enqueueTimer,
            }}
        >
            {children}
        </UserDataContext.Provider>
    );
};