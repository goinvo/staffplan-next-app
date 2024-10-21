
import React from "react";
import { UserLabelProps } from "../../typeInterfaces";

export const UserLabel = ({ assignment, clickHandler }: UserLabelProps) => {
	const isAssignmentProposed = assignment.status === 'proposed'
	return (
		<div className="sm:ml-auto ml-0 sm:w-24">
			<button className={`lg:pl-5 md:ml-2 lg:ml-0 pt-2 ${isAssignmentProposed ? 'sm:pl-4' : 'sm:pl-2'} font-bold flex items-center justify-start text-contrastBlue text-start`} onClick={() => clickHandler(assignment)}>
				{assignment.project.name}
			</button>
		</div>
	);
};
