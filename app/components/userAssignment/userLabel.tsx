
import React from "react";
import { UserLabelProps } from "../../typeInterfaces";

export const UserLabel = ({ assignment, clickHandler }: UserLabelProps) => {
	return (
		<div className="ml-auto">
			<button className='w-24 pl-5 pt-2 font-bold flex items-center justify-start text-contrastBlue text-start' onClick={() => clickHandler(assignment)}>
				{assignment.project.name}
			</button>
		</div>
	);
};
