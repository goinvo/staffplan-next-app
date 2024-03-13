"use client";
import React from "react";
import withApollo from "@/lib/withApollo";
import { useQuery } from "@apollo/client";
import { useEffect, useState } from "react";
import { AssignmentType, ClientType, ProjectType } from "../typeInterfaces";
import { GET_PROJECT_DATA } from "../gqlQueries";
import WeekDisplay from "../components/weekDisplay";
import { Project } from "next/dist/build/swc";

const Projects: React.FC = () => {
	const [clientSide, setClientSide] = useState(false);
	const [projectsList, setProjectsList] = useState<ProjectType[]>([]);

	useEffect(() => {
		setClientSide(true);
	}, []);
	const { loading, error, data: projectData } = useQuery(GET_PROJECT_DATA, {
		context: {
			headers: {
				cookie: clientSide ? document.cookie : null,
			},
		},
		skip: !clientSide,
		errorPolicy: "all",
	});

	const handleProjectChange = (project: ProjectType) => {
		console.log("Viewing project: ", project);
	}

	useEffect(() => {
		if (projectData && projectData.clients) {
			const projects = projectData.clients.map((client: ClientType) => {
				return client.projects;
			});

			let allProjects: ProjectType[] = [];
			
			// For each project, add it if it doesn't exist in the list
			projects.forEach((project: ProjectType[]) => {
				project?.forEach((project) => {
					if (!projectsList.some((p) => p.id === project.id)) {
						allProjects.push(project);
					}
				});
			});
			setProjectsList(allProjects);
		}
		
	}, [projectData]);

	if (loading) return <p> LOADING PROJECTS</p>;
	if (error) return <p>ERROR PROJECTS</p>;
	return (
		<div>
			<WeekDisplay labelContents={
				projectsList.map((project) => (
					<div className="flex gap-x-4 gap-y-4 items-center justify-center" key={project.id}>
						<div className="flex w-16 h-16 timeline-grid-bg rounded-full overflow-hidden" onClick={() => handleProjectChange(project)}>Portrait</div>
						<div className="flex">{project.name}</div>
					</div>
				))
			} />
			{projectData ? (
				projectData.clients.map((client: ClientType) => {
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
