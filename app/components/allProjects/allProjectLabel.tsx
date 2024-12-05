import React from "react";
import { PlusIcon } from "@heroicons/react/24/solid";
import { AllProjectLabelProps } from "../../typeInterfaces";
import EllipsisProjectMenu from "../ellipsisProjectMenu";
import IconButton from "../iconButton";
import { useProjectsDataContext } from "@/app/contexts/projectsDataContext";

export const AllProjectLabel = ({
	project,
	clickHandler,
	undoRowRef,
}: AllProjectLabelProps) => {
	const { setShowOneClientProjects } = useProjectsDataContext()
	return (
		<div className="flex justify-between items-start sm:flex-row flex-col pt-2">
			<IconButton
				className={'text-contrastBlue w-auto sm:w-[45%] sm:flex hidden text-start transform -translate-x-0.5'}
				Icon={PlusIcon} iconSize='h-4 w-4' text={project.client.name}
				onClick={() => setShowOneClientProjects(project.client.id.toString())} />
			<span className="sm:hidden block mr-2">{project.client.name}</span>
			<button
				onClick={() => clickHandler(project)}
				className='w-auto sm:w-[45%] sm:mr-0 mr-2 sm:mt-0 mt-2 font-bold text-contrastBlue text-start'
			>
				{project.name}
			</button>
			<div className="sm:block hidden">
				<EllipsisProjectMenu undoRowRef={undoRowRef} project={project} />
			</div>
		</div>
	);
};
