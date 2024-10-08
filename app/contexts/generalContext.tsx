"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useQuery } from "@apollo/client";

import {
    ViewerType,
} from "../typeInterfaces";
import {
    GET_VIEWER,
} from "../gqlQueries";

import {
    getStartOfPreviousWeek
} from "../components/scrollingCalendar/helpers";

export interface GeneralDataContextType {
    dateRange: string;
    viewer: ViewerType | null;
    showSummaries: boolean;
    showArchivedProjects: boolean;
    showInactiveUsers: boolean;
    showArchivedAssignments: boolean;
    rollupSort: string;
    assignmentSort: string;
    setShowSummaries: React.Dispatch<React.SetStateAction<boolean>>;
    setShowArchivedProjects: React.Dispatch<React.SetStateAction<boolean>>;
    setShowInactiveUsers: React.Dispatch<React.SetStateAction<boolean>>;
    setShowArchivedAssignments: React.Dispatch<React.SetStateAction<boolean>>;
    setRollupSort: React.Dispatch<React.SetStateAction<string>>;
    setAssignmentSort: React.Dispatch<React.SetStateAction<string>>;
    setDateRange: React.Dispatch<React.SetStateAction<string>>;
    setViewer: React.Dispatch<React.SetStateAction<ViewerType | null>>;
    scrollToTodayFunction: () => void;
}


const GeneralDataContext = createContext<GeneralDataContextType | undefined>(
    undefined
);

export const useGeneralDataContext = () => {
    const context = useContext(GeneralDataContext);
    if (context === undefined) {
        throw new Error(
            "useGeneralDataContext must be used within a GeneralDataProvider"
        );
    }
    return context;
};

export const GeneralDataProvider: React.FC<{ children?: ReactNode }> = ({
    children,
}) => {
    const isClient = typeof window !== "undefined";
    const [dateRange, setDateRange] = useState<string>(
        getStartOfPreviousWeek()
    );
    const [viewer, setViewer] = useState<ViewerType | null>(null);
    const [showSummaries, setShowSummaries] = useState<boolean>(true);
    const [showArchivedProjects, setShowArchivedProjects] = useState<boolean>(false);
    const [showInactiveUsers, setShowInactiveUsers] = useState<boolean>(false);
    const [showArchivedAssignments, setShowArchivedAssignments] = useState<boolean>(false);
    const [rollupSort, setRollupSort] = useState('none')
    const [assignmentSort, setAssignmentSort] = useState('slim')
    const scrollToTodayFunction = () => {
        setDateRange(
            getStartOfPreviousWeek()
        );
    };

    const {
        loading: viewerLoading,
        error: viewerError,
        data: viewerData,
    } = useQuery(GET_VIEWER, {
        context: {
            headers: {
                cookie: isClient ? document.cookie : null,
            },
        },
        skip: !isClient,
        errorPolicy: "all",
    });

    useEffect(() => {
        if (viewerData) {
            setViewer(viewerData.viewer);
        }
    }, [viewerData]);


    return (
        <GeneralDataContext.Provider
            value={{
                viewer,
                dateRange,
                showSummaries,
                showArchivedProjects,
                showInactiveUsers,
                showArchivedAssignments,
                rollupSort,
                assignmentSort,
                setShowSummaries,
                setShowArchivedProjects,
                setShowInactiveUsers,
                setShowArchivedAssignments,
                setRollupSort,
                setAssignmentSort,
                setDateRange,
                setViewer,
                scrollToTodayFunction,
            }}
        >
            {children}
        </GeneralDataContext.Provider>
    );
};
