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
const UserPage: React.FC = () => {
	const router = useRouter();
	const params = useParams();
	const [clientSide, setClientSide] = useState(false);
	const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
	const [addAssignmentVisible, setAddAssignmentVisible] = useState(false);
	const [workWeekDataLookupMap, setWorkWeekDataLookupMap] = useState<
		Map<number, Map<number, WorkWeekRenderDataType>>[]
	>([]);
	const [wasSelectedCellEdited, setWasSelectedCellEdited] =
		useState<boolean>(false);
	const [rowIdtoAssignmentIdMap, setRowIdtoAssignmentIdMap] = useState<
		Map<number, number>
	>(new Map());

	const { setSingleUserPage, userList, setUserList, viewsFilter } =
		useUserDataContext();

	const [upsertWorkweek] = useMutation(UPSERT_WORKWEEK);

	const upsertWorkWeekValues = (values: WorkWeekRenderDataType) => {
		upsertWorkweek({
			variables: {
				assignmentId: values.assignmentId,
				cweek: values.cweek,
				year: values.year,
				estHours: values.estimatedHours,
				actHours: values.actualHours,
			},
		});
	};

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

	const updateUserListData = (
		workWeekData: WorkWeekRenderDataType,
		rowId: number
	) => {
		const newUserData = [...userList]; // Create a new array to avoid mutating the original userList
		const userIndex = newUserData.findIndex(
			(user: UserType) => user.id === selectedUser?.id
		);

		if (userIndex !== -1) {
			const user = newUserData[userIndex];
			const assignmentIndex = user.assignments.findIndex(
				(assignment: AssignmentType) =>
					assignment.id === workWeekData.assignmentId
			);

			if (assignmentIndex !== -1) {
				const assignment = user.assignments[assignmentIndex];
				const project = assignment.project;
				const newWorkWeeks = [...assignment.workWeeks]; // Create a new array for workWeeks
				const workWeekIndex = newWorkWeeks.findIndex(
					(week: WorkWeekType) =>
						week.cweek === workWeekData.cweek && week.year === workWeekData.year
				);

				if (workWeekIndex !== -1) {
					// Update the existing work week
					newWorkWeeks[workWeekIndex] = {
						...newWorkWeeks[workWeekIndex],
						estimatedHours: workWeekData.estimatedHours,
						actualHours: workWeekData.actualHours,
					};
				} else {
					// Add a new work week
					newWorkWeeks.push({
						cweek: workWeekData.cweek,
						year: workWeekData.year,
						estimatedHours: workWeekData.estimatedHours,
						actualHours: workWeekData.actualHours,
						project: project,
					});
				}

				// Create a new assignment object with the updated workWeeks array
				const newAssignment: AssignmentType = {
					...assignment,
					workWeeks: newWorkWeeks,
				};

				// Update the assignments array with the new assignment object
				const newAssignments = [
					...user.assignments.slice(0, assignmentIndex),
					newAssignment,
					...user.assignments.slice(assignmentIndex + 1),
				];

				// Update the user object with the new assignments array
				newUserData[userIndex] = {
					...user,
					assignments: newAssignments,
				};
			}
		}

		// Update the userList state with the new user data
		setUserList(newUserData);
	};

	const handleCurrEstHoursChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const selectedCell = JSON.parse(
			localStorage.getItem("selectedCell") || "{}"
		);
		localStorage.setItem("currEstHours", e.target.value);
		const newEstimatedHours = parseInt(e.target.value);
		const newWorkWeekData = lookupWorkWeekData(
			selectedCell.rowId,
			selectedCell.year,
			selectedCell.week
		);
		if (newWorkWeekData) {
			newWorkWeekData.estimatedHours = newEstimatedHours;
			addWorkWeekData(newWorkWeekData, selectedCell.rowId);
			updateUserListData(newWorkWeekData, selectedCell.rowId);
		} else {
			const newWorkWeekData = {
				cweek: selectedCell.week,
				year: selectedCell.year,
				estimatedHours: newEstimatedHours,
				actualHours: parseInt(localStorage.getItem("currActHours") || "0"),
				assignmentId: rowIdtoAssignmentIdMap.get(selectedCell.rowId),
			};
			addWorkWeekData(newWorkWeekData, selectedCell.rowId);
			updateUserListData(newWorkWeekData, selectedCell.rowId);
		}
		setWasSelectedCellEdited(true);
	};

	const handleCurrActHoursChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const selectedCell = JSON.parse(
			localStorage.getItem("selectedCell") || "{}"
		);
		localStorage.setItem("currActHours", e.target.value);
		const newActualHours = parseInt(e.target.value);

		const newAssignmentId = rowIdtoAssignmentIdMap.get(selectedCell.rowId);

		const newWorkWeekData = lookupWorkWeekData(
			selectedCell.rowId,
			selectedCell.year,
			selectedCell.week
		);
		if (newWorkWeekData) {
			newWorkWeekData.actualHours = newActualHours;
			addWorkWeekData(newWorkWeekData, selectedCell.rowId);
		} else {
			const newWorkWeekData = {
				cweek: selectedCell.week,
				year: selectedCell.year,
				estimatedHours: parseInt(localStorage.getItem("currEstHours") || "0"),
				actualHours: newActualHours,
				assignmentId: rowIdtoAssignmentIdMap.get(selectedCell.rowId),
			};
			addWorkWeekData(newWorkWeekData, selectedCell.rowId);
		}
		setWasSelectedCellEdited(true);
	};

	const renderCell = (
		cweek: number,
		year: number,
		rowIndex: number,
		isSelected: boolean,
		width?: number,
		height?: number,
		onFocus?: (week: number, year: number, rowId: number) => void,
		onBlur?: () => void
	) => {
		const workWeekData = lookupWorkWeekData(rowIndex, year, cweek);
		const estimatedHours = workWeekData?.estimatedHours || "0";
		const actualHours = workWeekData?.actualHours || "0";

		return (
			<>
				<input
					className="flex flex-row"
					value={
						isSelected
							? localStorage.getItem("currEstHours") ?? estimatedHours
							: estimatedHours
					}
					placeholder="Estimated Hours"
					onChange={(e) => handleCurrEstHoursChange(e)}
					onFocus={() => onFocus && onFocus(cweek, year, rowIndex)}
					onBlur={() => onBlur && onBlur()}
				/>
				<input
					className="flex flex-row"
					value={
						isSelected
							? localStorage.getItem("currActHours") ?? actualHours
							: actualHours
					}
					placeholder="Actual Hours"
					onChange={(e) => handleCurrActHoursChange(e)}
					onFocus={() => onFocus && onFocus(cweek, year, rowIndex)}
					onBlur={() => onBlur && onBlur()}
				/>
			</>
		);
	};

	const lookupWorkWeekData = (
		rowIndex: number,
		year: number,
		cweek: number
	) => {
		if (
			workWeekDataLookupMap[rowIndex] &&
			workWeekDataLookupMap[rowIndex]?.has(year) &&
			workWeekDataLookupMap[rowIndex]?.get(year)?.has(cweek)
		) {
			return workWeekDataLookupMap[rowIndex]?.get(year)?.get(cweek);
		}
		return null;
	};

	const handleCellFocus = (week: number, year: number, rowId: number) => {
		localStorage.setItem("selectedCell", JSON.stringify({ week, year, rowId }));
		const newWorkWeekData = lookupWorkWeekData(rowId, year, week);
		if (newWorkWeekData) {
			localStorage.setItem(
				"currEstHours",
				newWorkWeekData.estimatedHours.toString()
			);
			localStorage.setItem(
				"currActHours",
				newWorkWeekData.actualHours.toString()
			);
		} else {
			localStorage.setItem("currEstHours", "");
			localStorage.setItem("currActHours", "");
		}
	};

	const handleCellBlur = () => {
		if (wasSelectedCellEdited) {
			const selectedCell = JSON.parse(
				localStorage.getItem("selectedCell") || "{}"
			);
			const oldWorkWeekData = lookupWorkWeekData(
				selectedCell.rowId,
				selectedCell.year,
				selectedCell.week
			);
			if (oldWorkWeekData) {
				upsertWorkWeekValues(oldWorkWeekData);
				setWasSelectedCellEdited(false);
			}
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
			<div>
				{userList && selectedUser && selectedUser.assignments && (
					<WeekDisplay
						labelContentsLeft={selectedUser.assignments.map(
							(assignment: AssignmentType) => (
								<div key={assignment.id}>
									<div className="flex w-16 h-16 timeline-grid-bg rounded-full overflow-hidden">
										<Image
											src={`${assignment.project.client.avatarUrl}`}
											alt="client avatar"
											width={500}
											height={500}
										/>
									</div>
									<div>{assignment.project.client.name}</div>
									<div
										className="hover:cursor-pointer"
										onClick={() => handleProjectChange(assignment)}
									>
										{assignment.project.name}
									</div>
									{assignment.status === "active" ? null : (
										<div className="text-red-500"> Unconfirmed Assignment</div>
									)}
								</div>
							)
						)}
						labelContentsRight={selectedUser.assignments.map(
							(assignment: AssignmentType) => (
								<div
									key={assignment.id}
									className="flex gap-x-4 gap-y-4 items-center justify-center"
								>
									<UserSummary assignment={assignment} />
								</div>
							)
						)}
						onCellFocus={handleCellFocus}
						onCellBlur={handleCellBlur}
						renderCell={renderCell}
					/>
				)}
			</div>
			{/* <div>
				{selectedUser?.assignments
					? selectedUser?.assignments.map((assignment: AssignmentType) => {
							return (
								<AssignmentEditDrawer
									assignment={assignment}
									key={`${assignment.id}${selectedUser.id}`}
								/>
							);
					  })
					: null}
			</div> */}
			<div>
				<button
					className="bg-white border-2 border-accentgreen w-8 h-8 ml-2 rounded-full flex justify-center items-center"
					onClick={() => setAddAssignmentVisible(true)}
				>
					<PlusIcon className="fill-accentgreen" />
				</button>
				{addAssignmentVisible && (
					<AddAssignmentSinglePerson
						user={selectedUser}
						onClose={onClose}
						onComplete={onComplete}
					/>
				)}
			</div>
		</>
	);
};

export default withApollo(UserPage);
