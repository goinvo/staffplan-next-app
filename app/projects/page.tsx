"use client";
import React from "react";
import withApollo from "@/lib/withApollo";
import { useQuery } from "@apollo/client";
import { useEffect, useState } from "react";
import { AssignmentType, ClientType } from "../people/typeInterfaces";
import { GET_PROJECT_DATA } from "../people/gqlQueries";

const Projects: React.FC = () => {
	const [clientSide, setClientSide] = useState(false);
	useEffect(() => {
		setClientSide(true);
	}, []);
	const { loading, error, data } = useQuery(GET_PROJECT_DATA, {
		context: {
			headers: {
				cookie: clientSide ? document.cookie : null,
			},
		},
		skip: !clientSide,
		errorPolicy: "all",
	});
	if (loading) return <p> LOADING PROJECTS</p>;
	if (error) return <p>ERROR PROJECTS</p>;
	return (
		<div>
			{data ? (
				data.clients.map((client: ClientType) => {
					return (
						<div key={`${client.id} + ${client.name}`}>
							<p className="font-black underline">{client.name}</p>
							<ul>
								{client.projects?.map((project) => {
									return (
										<li key={`${project.name} + ${project.id}`}>
											<span className="font-bold">
												Project Name: {project.name}
											</span>
											<ul className="p-3">
												<li>Payment Frequency: {project.paymentFrequency}</li>
												<li>Status: {project.status}</li>
												{project.startsOn ? (
													<li>Starts On: {project.startsOn} </li>
												) : (
													""
												)}
												{project.endsOn ? (
													<li>Ends On: {project.endsOn} </li>
												) : (
													""
												)}
												<span className="font-bold underline">
													Users Assigned To: {project.name}
												</span>
												<ul className="list-inside list-decimal border p-5">
													{project.assignments?.map(
														(assignment: AssignmentType) => {
															return (
																<li
																	key={`${project.name} + ${assignment.assignedUser.name}`}
																>
																	{assignment.assignedUser.name}
																	<p>Starts: {assignment.startsOn}</p>
																	<p>Ends: {assignment.endsOn}</p>
																</li>
															);
														}
													)}
												</ul>
											</ul>
										</li>
									);
								})}
							</ul>
						</div>
					);
				})
			) : (
				<p>No Data</p>
			)}
		</div>
	);
};

export default withApollo(Projects);
