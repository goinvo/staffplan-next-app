"use client";
import React from "react";
import withApollo from "@/lib/withApollo";
import apolloClient from "@/lib/apollo-client";
import { gql, useQuery } from "@apollo/client";
import { useEffect, useState } from "react";
import UsersList from "../components/usersList";

const GET_DATA = gql`
{
	users {
	  name,
	  assignments {
		project {
		  name,
		  workWeeks {
			actualHours,
			estimatedHours,
			cweek,
			year
		  }
		}
	  }
	}
	}
`;

const Projects: React.FC = () => {
	const [clientSide, setClientSide] = useState(false);

	useEffect(() => {
		setClientSide(true);
	}, []);
	const { loading, error, data } = useQuery(GET_DATA, {
		context: {
			headers: {
				cookie: clientSide ? document.cookie : null,
			},
		},
		skip: !clientSide,
		errorPolicy: "all",
	});
	if (loading) return <p> LOADING</p>;
	if (error) return <p>ERROR</p>
	return <UsersList data={data} />;
};

export default withApollo(Projects)

