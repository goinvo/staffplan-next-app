import React from "react";
import { AssignmentType, ClientType } from "../../typeInterfaces";
import { PlusIcon } from "@heroicons/react/24/solid";

interface ClientLabelProps {
	assignment: AssignmentType;
	clickHandler: (client: ClientType) => void;
	tempProjectOpen: boolean;
	setTempProjectOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const ClientLabel = ({ assignment, clickHandler, tempProjectOpen, setTempProjectOpen }: ClientLabelProps) => {
	return (
		<div
			className="hover:cursor-pointer w-40 absolute -left-0 outline mt-5 overflow-hidden"
			onClick={() => {
				if(tempProjectOpen === false){
					setTempProjectOpen(true)
					clickHandler(assignment.project.client);
				}
			}}
		>
			<div className=" flex w-5 h-5 bg-gray-500 rounded-full overflow-hidden">
				<PlusIcon className="fill-white" />
			</div>
			<div>{assignment.project.client.name} </div>
		</div>
	);
};
