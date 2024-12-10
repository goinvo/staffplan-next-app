'use client'
import React from "react";

import { PlusIcon } from "@heroicons/react/24/solid";
import { AssignmentType, ClientType, UserType } from "../../typeInterfaces";
import IconButton from "../iconButton";
import { useUserDataContext } from "@/app/contexts/userDataContext";
import { sortSingleUserByOrder } from "@/app/helperFunctions";

interface ClientLabelProps {
	assignment: AssignmentType;
	selectedUser: UserType | null;
}

export const ClientLabel = ({ assignment }: ClientLabelProps) => {
	const { singleUserPage, setSingleUserPage, sortOrder, sortBy } = useUserDataContext()

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
		const sortedAssignments = sortSingleUserByOrder(sortOrder, sortBy, {
      ...singleUserPage,
      assignments: updatedAssignments,
    });

		setSingleUserPage(sortedAssignments);
	};

	return (
		<>
			<IconButton
				className={'text-contrastBlue sm:flex hidden items-center justify-start sm:pt-2 pl-0 text-start transform -translate-x-0.5'}
				Icon={PlusIcon} iconSize='h-4 w-4' text={assignment.project.client.name}
				onClick={() => {
					if (!activeTempProject) {
						handleClientClick(assignment.project.client)
					}
				}} />
			<div className="sm:hidden flex items-center relative" onClick={() => {
				if (!activeTempProject) {
					handleClientClick(assignment.project.client);
				}
			}}>
				<PlusIcon className="w-3 h-3 absolute transform -translate-x-5" />
				<span>{assignment.project.client.name}</span>
			</div >
		</>
	);
};
