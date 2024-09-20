import React from "react";
import { PlusIcon } from "@heroicons/react/24/solid";

import { AssignmentType, ClientType } from "../../typeInterfaces";
import IconButton from "../iconButton";

interface ClientLabelProps {
	assignment: AssignmentType;
	clickHandler: (client: ClientType) => void;
	tempProjectOpen: boolean;
	setTempProjectOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const ClientLabel = ({ assignment, clickHandler, tempProjectOpen, setTempProjectOpen }: ClientLabelProps) => {
	return (
		<IconButton
			className={'text-contrastBlue w-24 flex items-center justify-start pt-2 pl-0 text-start'}
			Icon={PlusIcon} iconSize='h-4 w-4' text={assignment.project.client.name}
			onClick={() => {
				if (tempProjectOpen === false) {
					setTempProjectOpen(true)
					clickHandler(assignment.project.client);
				}
			}} />
	);
};
