"use client";
import React from "react";
import withApollo from "@/lib/withApollo";
import { useQuery } from "@apollo/client";
import { useEffect, useState } from "react";
import { ProjectType } from "../typeInterfaces";
import { GET_ALL_PROJECTS_DATA } from "../gqlQueries";
import WeekDisplay from "../components/weekDisplay";
import { LoadingSpinner } from "../components/loadingSpinner";
import { SVGAlphabet } from "../svgAlphabet";
const Projects: React.FC = () => {
	const [clientSide, setClientSide] = useState(false);
	const [projectsList, setProjectsList] = useState<ProjectType[]>([]);

	useEffect(() => {
		setClientSide(true);
	}, []);
	const {
		loading: projectDataLoading,
		error,
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

	const handleProjectChange = (project: ProjectType) => {
		console.log("Viewing project: ", project);
	};

	useEffect(() => {
		if (projectData && projectData.currentCompany?.projects) {
			let allProjects: ProjectType[] = [];

			console.log("Projects: ", projectData.currentCompany?.projects);

			setProjectsList(projectData.currentCompany?.projects);
		}
	}, [projectData]);
	if (projectDataLoading) return <LoadingSpinner />;
	if (error) return <p>ERROR PROJECTS</p>;
	return (
		<div>
			<WeekDisplay
				labelContents={projectsList.map((project) => (
					<div
						className="flex gap-x-4 gap-y-4 items-center justify-center"
						key={project.id}
					>
						<div
							className="flex w-16 h-16 timeline-grid-bg rounded-full overflow-hidden"
							onClick={() => handleProjectChange(project)}
						>
							<SVGAlphabet name={project.name} />
						</div>
						<div className="flex">{project.name}</div>
					</div>
				))}
			/>
		</div>
	);
};

export default withApollo(Projects);
