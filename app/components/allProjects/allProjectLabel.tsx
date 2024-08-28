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
		<div className="flex justify-between items-center">
			<IconButton
				className={'text-contrastBlue w-24 flex items-center justify-start pt-2 text-start'}
				Icon={PlusIcon} iconSize='h-4 w-4' text={project.client.name}
				onClick={() => console.log('On client click')} />

			<button
				onClick={() => clickHandler(project)}
				className='w-24 pl-1 pt-2 font-bold flex items-center justify-start text-contrastBlue text-start'
			>
				{project.name}
			</button>
			<div className="flex items-start justify-start pt-2 hover:cursor-pointer">
				<EllipsisProjectMenu project={project} />
			</div>
		</div>
	);
};
