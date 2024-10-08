"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useApolloClient, useQuery } from "@apollo/client";

import {
    ClientType
} from "../typeInterfaces";
import {
    GET_ALL_CLIENTS_DATA,
    GET_CLIENT_DATA,
} from "../gqlQueries";


export interface ClientDataContextType {
    clientList: ClientType[] | [];
    setClientList: React.Dispatch<React.SetStateAction<ClientType[] | []>>;
    refetchClientList: () => void;
}


const ClientDataContext = createContext<ClientDataContextType | undefined>(
    undefined
);

export const useClientDataContext = () => {
    const context = useContext(ClientDataContext);
    if (context === undefined) {
        throw new Error(
            "useClientDataContext must be used within a ClientDataProvider"
        );
    }
    return context;
};

export const ClientDataProvider: React.FC<{ children?: ReactNode }> = ({
    children,
}) => {
    const client = useApolloClient()
    const isClient = typeof window !== "undefined";
    const [clientList, setClientList] = useState<ClientType[] | []>([]);
    const {
        loading: clientDataLoading,
        error: clientDataError,
        data: clientData,
    } = useQuery(GET_ALL_CLIENTS_DATA, {
        context: {
            headers: {
                cookie: isClient ? document.cookie : null,
            },
        },
        skip: !isClient,
        errorPolicy: "all",
    });

    useEffect(() => {
        if (clientData) {
            setClientList(clientData.currentCompany.clients);
        }
    }, [clientData]);

    const refetchClientList = () => {
        client
            .query({
                query: GET_CLIENT_DATA,
                context: {
                    headers: {
                        cookie: isClient ? document.cookie : null,
                    },
                },
                errorPolicy: "all",
            })
            .then((result) => {
                setClientList(result.data.clients);
            });
    };

    return (
        <ClientDataContext.Provider
            value={{
                clientList,
                setClientList,
                refetchClientList
            }}
        >
            {children}
        </ClientDataContext.Provider>
    );
};
