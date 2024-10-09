'use client'
import React from "react";

import { PlusIcon } from "@heroicons/react/24/solid";
import { AssignmentType, ClientType, UserType } from "../../typeInterfaces";
import IconButton from "../iconButton";
import { useUserDataContext } from "@/app/contexts/userDataContext";
import { sortSingleUser } from "@/app/helperFunctions";

interface ClientLabelProps {
	assignment: AssignmentType;
	selectedUser: UserType | null;
}

export const ClientLabel = ({ assignment, selectedUser }: ClientLabelProps) => {
	const { singleUserPage, setSingleUserPage, viewsFilterSingleUser } = useUserDataContext()

	const activeTempProject = singleUserPage?.assignments.some(a => {
		return a.project.client.id === assignment.project.client.id &&
			a.project.isTempProject
	}
	);
	const handleClientClick = (client: ClientType) => {
		if (!singleUserPage) return;

		const newAssignment: any = {

			id: Date.now(), // Generate a unique id
			startsOn: null,
			endsOn: null,
			estimatedWeeklyHours: 0,
			status: "active",
			project: {
				__typename: "Project",
				id: Date.now(), // Generate a unique id for the project
				name: "New Project",
				startsOn: null,
				endsOn: null,
				client: {
					id: client.id,
					name: client.name,
					avatarUrl: "http://www.gravatar.com/avatar/newavatar",
					description: ""
				},
				paymentFrequency: "",
				status: "",
				users: [],
				fte: 0,
				hours: 0,
				isTempProject: true,
			},
			workWeeks: [],
		};

		// Add new assignment and then sort
		const updatedAssignments = [...singleUserPage.assignments, newAssignment];
		const sortedAssignments = sortSingleUser(viewsFilterSingleUser, {
			...singleUserPage,
			assignments: updatedAssignments
		});

		setSingleUserPage(sortedAssignments);
	};

	return (
		<IconButton
			className={'text-contrastBlue w-24 flex items-center justify-start pt-2 pl-0 text-start'}
			Icon={PlusIcon} iconSize='h-4 w-4' text={assignment.project.client.name}
			onClick={() => {
				if (!activeTempProject) {
					handleClientClick(assignment.project.client)
				}
			}} />
	);
};
