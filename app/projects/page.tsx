"use client";
import React from "react";
import withApollo from "@/lib/withApollo";
import { useQuery } from "@apollo/client";
import { useEffect, useState } from "react";
import { ProjectType } from "../typeInterfaces";
import { useUserDataContext } from "../userDataContext";
import WeekDisplay from "../components/weekDisplay";

const Projects: React.FC = () => {
	const [clientSide, setClientSide] = useState(false);
	const { projectList } = useUserDataContext();

	console.log("Projects list: ", projectList);

	useEffect(() => {
		setClientSide(true);
	}, []);

	const handleProjectChange = (project: ProjectType) => {
		console.log("Viewing project: ", project);
	}

	if (!projectList) {
		return <div>Loading...</div>;
	}
	
	return (
		<div>
			<WeekDisplay labelContents={
				projectList.map((project) => (
					<div className="flex gap-x-4 gap-y-4 items-center justify-center" key={project.id}>
						<div className="flex w-16 h-16 timeline-grid-bg rounded-full overflow-hidden" onClick={() => handleProjectChange(project)}>Portrait</div>
						<div className="flex">{project.name}</div>
					</div>
				))
			} />
		</div>
	);
};

export default Projects;
