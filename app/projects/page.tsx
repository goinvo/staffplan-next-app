"use client";
import React from "react";
import withApollo from "@/lib/withApollo";
import { useQuery } from "@apollo/client";
import { useEffect, useState } from "react";
import { ProjectType } from "../typeInterfaces";
import { useUserDataContext } from "../userDataContext";
import WeekDisplay from "../components/weekDisplay";
import { LoadingSpinner } from "../components/loadingSpinner";
import { SVGAlphabet } from "../svgAlphabet";
import EllipsisProjectMenu from "../components/ellipsisProjectMenu";
const Projects: React.FC = () => {
	const [clientSide, setClientSide] = useState(false);
	const { projectList } = useUserDataContext();


	useEffect(() => {
		setClientSide(true);
	}, []);

	const handleProjectChange = (project: ProjectType) => {
	}

	if (!projectList) {
		return  <LoadingSpinner />;
	}
	
	return (
		<div>
			<WeekDisplay labelContents={
				projectList.map((project) => (
					<div className="flex gap-x-4 gap-y-4 items-center justify-center" key={project.id}>
						<div className="flex w-16 h-16 timeline-grid-bg rounded-full overflow-hidden" onClick={() => handleProjectChange(project)}>Portrait</div>
						<div className="flex">{project.name}</div>
						<div>
							<EllipsisProjectMenu project={project} />
						</div>
					</div>
				))}
			/>
		</div>
	);
};

export default Projects;
