"use client";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import withApollo from "@/lib/withApollo";
import { UserType, AssignmentType } from "../../typeInterfaces";
import { useUserDataContext } from "../../userDataContext";
import { LoadingSpinner } from "@/app/components/loadingSpinner";
import { sortSingleUser } from "@/app/helperFunctions";
import { ScrollingCalendar } from "@/app/components/weekDisplayPrototype/scrollingCalendar";
import { UserAssignmentRow } from "@/app/components/userAssignmentPrototype/userAssignmentRow";
const UserPage: React.FC = () => {
	const router = useRouter();
	const params = useParams();
	const [clientSide, setClientSide] = useState(false);
	const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
	const [addAssignmentVisible, setAddAssignmentVisible] = useState(false);

	const { setSingleUserPage, userList, setUserList, viewsFilter } =
		useUserDataContext();

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

	// If the user list has been loaded and the user's name is in the URL, get the user's ID and load their assignments
	useEffect(() => {
		if (clientSide && userList) {
			const userId = decodeURIComponent(params.userId.toString());
			if (userId) {
				setSelectedUserData(parseInt(userId));
			}
		}
	}, [clientSide, userList, params.name, viewsFilter]);

	if (!userList) return <LoadingSpinner />;
	const onClose = () => setAddAssignmentVisible(false);
	const onComplete = () => {
		setAddAssignmentVisible(false);
	};
	return (
		<>
			{selectedUser && userList ? (
				<ScrollingCalendar>
					{selectedUser?.assignments?.map(
						(assignment: AssignmentType, index) => {
							return (
								<UserAssignmentRow
									key={index}
									assignment={assignment}
									monthData={{ monthLabel: "", year: 0 }}
									isFirstMonth={true}
									isLastMonth={true}
								/>
							);
						}
					)}
				</ScrollingCalendar>
			) : (
				<LoadingSpinner />
			)}
		</>
	);
};

export default withApollo(UserPage);
