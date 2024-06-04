"use client";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import withApollo from "@/lib/withApollo";
import { useMutation } from "@apollo/client";
import {
	UserType,
	AssignmentType,
	WorkWeekRenderDataType,
	WorkWeekType,
	selectedCell,
} from "../../typeInterfaces";
import { UPSERT_WORKWEEK } from "../../gqlQueries";
import WeekDisplay from "../../components/weekDisplay";
import { useUserDataContext } from "../../userDataContext";
import { LoadingSpinner } from "@/app/components/loadingSpinner";
import Image from "next/image";
import UserSummary from "@/app/components/userSummary";
import { sortSingleUser } from "@/app/helperFunctions";
import { AssignmentEditDrawer } from "@/app/components/assignmentEditDrawer";
import { PlusIcon } from "@heroicons/react/24/solid";
import AddAssignmentSinglePerson from "@/app/components/addAssignmentSinglePerson";
import { ScrollingCalendar } from "@/app/components/weekDisplayPrototype/scrollingCalendar";
import { UserAssignmentRow } from "@/app/components/userAssignmentPrototype/userAssignmentRow";
const UserPage: React.FC = () => {
	const router = useRouter();
	const params = useParams();
	const [clientSide, setClientSide] = useState(false);
	const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
	const [addAssignmentVisible, setAddAssignmentVisible] = useState(false);
	const [workWeekDataLookupMap, setWorkWeekDataLookupMap] = useState<
		Map<number, Map<number, WorkWeekRenderDataType>>[]
	>([]);
	const [rowIdtoAssignmentIdMap, setRowIdtoAssignmentIdMap] = useState<
		Map<number, number>
	>(new Map());

	const { setSingleUserPage, userList, setUserList, viewsFilter } =
		useUserDataContext();

	const addWorkWeekData = (
		workWeekData: WorkWeekRenderDataType,
		rowId: number
	) => {
		// Add data to the lookup map
		if (rowId != undefined) {
			// Add data to the lookup map
			if (!workWeekDataLookupMap[rowId]) {
				workWeekDataLookupMap[rowId] = new Map();
			}
			if (!workWeekDataLookupMap[rowId]?.has(workWeekData.year)) {
				workWeekDataLookupMap[rowId]?.set(workWeekData.year, new Map());
			}
			workWeekDataLookupMap[rowId]
				.get(workWeekData.year)
				?.set(workWeekData.cweek, workWeekData);
		} else {
			console.error("Error: Could not add work week data to lookup map");
		}
	};

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

		const workWeekData: WorkWeekRenderDataType[][] =
			selectedUserData.assignments.map((assignment: AssignmentType) => {
				return assignment.workWeeks.map((week: WorkWeekType) => {
					return {
						cweek: week.cweek,
						year: week.year,
						estimatedHours: week.estimatedHours,
						actualHours: week.actualHours,
						assignmentId: assignment.id,
					};
				});
			});

		workWeekData.forEach((assignmentWeeks: WorkWeekRenderDataType[], index) => {
			assignmentWeeks.forEach((week: WorkWeekRenderDataType) => {
				addWorkWeekData(week, index);
			});
			rowIdtoAssignmentIdMap.set(index, selectedUserData.assignments[index].id);
		});
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
	const handleProjectChange = (assignment: AssignmentType) => {
		router.push("/projects/" + encodeURIComponent(assignment.project.id));
	};
	const onClose = () => setAddAssignmentVisible(false);
	const onComplete = () => {
		setAddAssignmentVisible(false);
	};
	return (
		<>
			<ScrollingCalendar>
				{selectedUser?.assignments?.map((assignment: AssignmentType, index) => {
					return (
						<UserAssignmentRow
							key={index}
							assignment={assignment}
							monthData={{ monthLabel: "", year: 0 }}
							isFirstMonth={true}
							isLastMonth={true}
						/>
					);
				})}
			</ScrollingCalendar>
		</>
	);
};

export default withApollo(UserPage);
