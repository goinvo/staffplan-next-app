import React from "react";
import { UserLabelProps } from "../../typeInterfaces";
import { PlusIcon } from "@heroicons/react/24/solid";

export const ClientLabel = ({ assignment, clickHandler }: UserLabelProps) => {
	return (
		<div
			className="hover:cursor-pointer w-40 absolute -left-0 outline mt-5 overflow-hidden"
			onClick={() => clickHandler(assignment)}
		>
			<div className=" flex w-5 h-5 bg-gray-500 rounded-full overflow-hidden">
				<PlusIcon className="fill-white" />
			</div>
			<div>{assignment.project.client.name} </div>
		</div>
	);
};
