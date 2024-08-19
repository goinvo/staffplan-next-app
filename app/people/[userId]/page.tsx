"use client";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import withApollo from "@/lib/withApollo";
import { UserType, AssignmentType, ClientType } from "../../typeInterfaces";
import { useUserDataContext } from "../../userDataContext";
import { LoadingSpinner } from "@/app/components/loadingSpinner";
import { sortSingleUser } from "@/app/helperFunctions";
import { ScrollingCalendar } from "@/app/components/scrollingCalendar/scrollingCalendar";
import { UserAssignmentRow } from "@/app/components/userAssignment/userAssignmentRow";
import AddAssignmentSingleUser from "@/app/components/addAssignmentSingleUser";
import { MinusIcon, PlusIcon, XMarkIcon } from "@heroicons/react/24/solid";

const UserPage: React.FC = () => {
	const params = useParams();
	const [clientSide, setClientSide] = useState(false);
	const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
	const [addAssignmentVisible, setAddAssignmentVisible] = useState(false);

	const { setSingleUserPage, userList, viewsFilter } = useUserDataContext();

	const setSelectedUserData = (newSelectedId: number) => {
		if (!userList) return;

		const selectedUserData = userList.find(
			(user: UserType) => user.id?.toString() === newSelectedId.toString()
		);
		if (!selectedUserData) return;
		setSingleUserPage(selectedUserData);
		if (!viewsFilter.showArchivedProjects) {
			const showArchivedProjectsUserData = selectedUserData.assignments.filter(
				(assignment: AssignmentType) => assignment.status !== "archived"
			);
			return setSelectedUser(
				sortSingleUser(viewsFilter.singleUserSort, {
					...selectedUserData,
					assignments: showArchivedProjectsUserData,
				})
			);
		}
		setSelectedUser(
			sortSingleUser(viewsFilter.singleUserSort, selectedUserData)
		);
	};

	useEffect(() => {
		setClientSide(true);
	}, []);

	useEffect(() => {
		if (clientSide && userList) {
			const userId = decodeURIComponent(params.userId.toString());
			if (userId) {
				setSelectedUserData(parseInt(userId));
			}
		}
	}, [clientSide, userList, params.userId, viewsFilter]);

	if (!userList) return <LoadingSpinner />;
	const onClose = () => setAddAssignmentVisible(false);
	const onComplete = () => {
		setAddAssignmentVisible(false);
	};
	const handleClientClick = (client:ClientType) => {
		if (!selectedUser) return;
	
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
				isTempProject:true,
			},
			workWeeks: [],
		};
	
		// Add new assignment and then sort
		const updatedAssignments = [...selectedUser.assignments, newAssignment];
		const sortedAssignments = sortSingleUser(viewsFilter.singleUserSort, {
			...selectedUser,
			assignments: updatedAssignments
		});
		
		setSelectedUser(sortedAssignments);
		setSingleUserPage(sortedAssignments);
	};
	
	return (
		<>
			<div>
				{selectedUser && userList ? (
					<ScrollingCalendar>
						{selectedUser?.assignments?.map(
							(assignment: AssignmentType, index, allAssignments) => {
								const isFirstClient = index === allAssignments.findIndex((a) => a.project.client.id === assignment.project.client.id);
								return (
									<UserAssignmentRow
										key={index}
										assignment={assignment}
										monthData={{ monthLabel: "", year: 0 }}
										isFirstMonth={true}
										isLastMonth={true}
										isFirstClient={isFirstClient}
										clickHandler={handleClientClick} 
									/>
								);
							}
						)}
					</ScrollingCalendar>
				) : (
					<LoadingSpinner />
				)}
				<div className="mt-5">
					<button
						className="bg-white border-2 border-accentgreen w-8 h-8 ml-2 rounded-full flex justify-center items-center"
						onClick={() => setAddAssignmentVisible(!addAssignmentVisible)}
					>
						{addAssignmentVisible ? (
							<MinusIcon className="fill-accentgreen" />
						) : (
							<PlusIcon className="fill-accentgreen" />
						)}
					</button>
					{addAssignmentVisible && (
						<AddAssignmentSingleUser
							user={selectedUser}
							onClose={onClose}
							onComplete={onComplete}
						/>
					)}
				</div>
			</div>
		</>
	);
};

export default withApollo(UserPage);
