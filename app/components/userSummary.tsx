import React from "react";
import { AssignmentType } from "../typeInterfaces";
import { DateTime } from "luxon";
interface UserSummaryProps {
	assignment: AssignmentType;
}

const UserSummary: React.FC<UserSummaryProps> = ({ assignment }) => {
    console.log(assignment, "assignment")
	return (
		<div>
		{assignment.id}
		</div>
	);
};

export default UserSummary;
