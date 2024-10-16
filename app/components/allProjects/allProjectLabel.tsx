import React from "react";
import { PlusIcon } from "@heroicons/react/24/solid";
import { AllProjectLabelProps } from "../../typeInterfaces";
import EllipsisProjectMenu from "../ellipsisProjectMenu";
import IconButton from "../iconButton";

export const AllProjectLabel = ({
	project,
	clickHandler,
}: AllProjectLabelProps) => {
	return (
		<div className="flex justify-between items-start sm:flex-row flex-col pt-2">
			<IconButton
				className={'text-contrastBlue w-24 sm:flex hidden text-start whitespace-nowrap'}
				Icon={PlusIcon} iconSize='h-4 w-4' text={project.client.name}
				onClick={() => console.log('On client click')} />
			<span className="sm:hidden block">{project.client.name}</span>
			<button
				onClick={() => clickHandler(project)}
				className='w-24 mr-2 sm:mt-0 mt-2 font-bold text-contrastBlue text-start'
			>
				{project.name}
			</button>
			<div className="sm:block hidden">
				<EllipsisProjectMenu project={project} />
			</div>
		</div>
	);
};
