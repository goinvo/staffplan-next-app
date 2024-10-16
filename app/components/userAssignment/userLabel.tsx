
import React from "react";
import { UserLabelProps } from "../../typeInterfaces";

export const UserLabel = ({ assignment, clickHandler }: UserLabelProps) => {
	return (
		<div className="sm:ml-auto ml-0">
			<button className='sm:w-24 sm:pl-5 pl-0 pt-2 font-bold flex items-center justify-start text-contrastBlue text-start' onClick={() => clickHandler(assignment)}>
				{assignment.project.name}
			</button>
		</div>
	);
};
