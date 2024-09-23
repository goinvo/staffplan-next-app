import React from "react";
import { PlusIcon } from "@heroicons/react/24/solid";

import { AssignmentType, ClientType, UserType } from "../../typeInterfaces";
import IconButton from "../iconButton";

interface ClientLabelProps {
	assignment: AssignmentType;
	clickHandler: (client: ClientType) => void;
	tempProjectOpen: boolean;
	setTempProjectOpen: React.Dispatch<React.SetStateAction<boolean>>;
	selectedUser: UserType|null;
}

export const ClientLabel = ({ assignment, clickHandler, tempProjectOpen, setTempProjectOpen, selectedUser }: ClientLabelProps) => {
	const activeTempProject = selectedUser?.assignments.some(a => {
	return	a.project.client.id === assignment.project.client.id && 
		a.project.isTempProject
	}
	);
	return (
		<IconButton
			className={'text-contrastBlue w-24 flex items-center justify-start pt-2 pl-0 text-start'}
			Icon={PlusIcon} iconSize='h-4 w-4' text={assignment.project.client.name}
			onClick={() => {
				if (!activeTempProject) {
					setTempProjectOpen(true)
					clickHandler(assignment.project.client);
				}
			}} />
	);
};
