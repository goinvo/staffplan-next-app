"use client";
import React from "react";
import { useEffect, useState } from "react";
import { ProjectType } from "../typeInterfaces";
import { useRouter, usePathname } from "next/navigation";
import { useUserDataContext } from "../userDataContext";
import WeekDisplay from "../components/weekDisplay";
import { LoadingSpinner } from "../components/loadingSpinner";
import { SVGAlphabet } from "../svgAlphabet";
import EllipsisProjectMenu from "../components/ellipsisProjectMenu";
const Projects: React.FC = () => {
	const [clientSide, setClientSide] = useState(false);
	const { projectList } = useUserDataContext();
	const router = useRouter();
	const pathname = usePathname();

	useEffect(() => {
		setClientSide(true);
	}, []);

	const handleProjectChange = (project: ProjectType) => {
		router.push(pathname + "/" + encodeURIComponent(project.name.toString()));
	}

	if (!projectList) {
		return  <LoadingSpinner />;
	}
	
	return (
		<div>
			<WeekDisplay labelContents={
				projectList.map((project) => (
					<div className="flex gap-x-4 gap-y-4 items-center justify-center" key={project.id}>
						<div className="flex w-16 h-16 timeline-grid-bg rounded-full overflow-hidden" onClick={() => handleProjectChange(project)}><SVGAlphabet name={project.name}/></div>
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
