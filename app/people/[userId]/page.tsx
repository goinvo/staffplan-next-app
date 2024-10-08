"use client";
import { useParams } from "next/navigation";
import React, { useEffect, useState, useRef } from "react";
import withApollo from "@/lib/withApollo";
import { AssignmentType, ClientType } from "../../typeInterfaces";
import { LoadingSpinner } from "@/app/components/loadingSpinner";
import { sortSingleUser } from "@/app/helperFunctions";
import { ScrollingCalendar } from "@/app/components/scrollingCalendar/scrollingCalendar";
import { UserAssignmentRow } from "@/app/components/userAssignment/userAssignmentRow";
import AddAssignmentSingleUser from "@/app/components/addAssignmentSingleUser";
import { MinusIcon, PlusIcon } from "@heroicons/react/24/solid";
import AddInlineProject from "@/app/components/addInlineProject";
import { useUserDataContext } from "@/app/contexts/userDataContext";

const UserPage: React.FC = () => {
	const params = useParams();
	const [addAssignmentVisible, setAddAssignmentVisible] = useState(false);
	const inputRefs = useRef<Array<[Array<HTMLInputElement | null>, Array<HTMLInputElement | null>]>>([]);

	const { userList, viewsFilterSingleUser, singleUserPage, setSelectedUserData, setSingleUserPage } = useUserDataContext();

	useEffect(() => {
		if (userList.length) {
			const userId = decodeURIComponent(params?.userId?.toString());
			if (userId) {
				setSelectedUserData(parseInt(userId));
			}
		}
	}, [userList, params.userId, setSelectedUserData]);

	if (!userList.length) return <LoadingSpinner />;

	const onClose = () => setAddAssignmentVisible(false);
	const onComplete = () => {
		setAddAssignmentVisible(false);
	};
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

	const columnsHeaderTitles = [{ title: 'Client', showIcon: true }, { title: 'Project', showIcon: false }]
	return (
		<>
			{singleUserPage && userList.length ? (
				<ScrollingCalendar columnHeaderTitles={columnsHeaderTitles} avatarUrl={singleUserPage.avatarUrl} userName={singleUserPage.name} assignments={singleUserPage.assignments}>
					{singleUserPage?.assignments?.map(
						(assignment: AssignmentType, rowIndex: number, allAssignments: AssignmentType[]) => {
							const isFirstClient = rowIndex === allAssignments.findIndex((a) => a.project.client.id === assignment.project.client.id);
							return (
								<UserAssignmentRow
									key={rowIndex}
									assignment={assignment}
									isFirstMonth={true}
									isLastMonth={true}
									isFirstClient={isFirstClient}
									clickHandler={handleClientClick}
									selectedUser={singleUserPage}
									rowIndex={rowIndex}
									totalRows={singleUserPage?.assignments?.length || 0}
									inputRefs={inputRefs}
								/>
							);
						}
					)}
					{singleUserPage && <AddInlineProject user={singleUserPage} />}
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
						user={singleUserPage}
						onClose={onClose}
						onComplete={onComplete}
					/>
				)}
			</div>
		</>
	);
};

export default withApollo(UserPage);
