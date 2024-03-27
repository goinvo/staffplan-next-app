"use client";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import withApollo from "@/lib/withApollo";
import { useMutation } from "@apollo/client";
import {
	UserType,
	AssignmentType,
	WorkWeekRenderDataType,
	WorkWeekType,
} from "../../typeInterfaces";
import { UPSERT_WORKWEEK } from "../../gqlQueries";
import WeekDisplay, { selectedCell } from "../../components/weekDisplay";
import { useUserDataContext } from "../../userDataContext";
import { LoadingSpinner } from "@/app/components/loadingSpinner";

const UserPage: React.FC = () => {
	const params = useParams();
	const [clientSide, setClientSide] = useState(false);
	const [selectedUser, setSelectedUser] = useState<UserType>({
		id: NaN,
		name: "Select",
	});
	const [selectedCell, setselectedCell] = useState<selectedCell>({
		week: 0,
		year: 0,
		rowId: 0,
	});
	const [workWeekDataLookupMap, setWorkWeekDataLookupMap] = useState<
		Map<number, Map<number, WorkWeekRenderDataType>>[]
	>([]);
	const [currEstHours, setCurrEstHours] = useState<string>("0");
	const [currActHours, setCurrActHours] = useState<string>("0");
	const [wasSelectedCellEdited, setWasSelectedCellEdited] =
		useState<boolean>(false);
	const [rowIdtoAssignmentIdMap, setRowIdtoAssignmentIdMap] = useState<
		Map<number, number>
	>(new Map());

	const { userList, setUserList } = useUserDataContext();

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

	const getUserIdFromName: (name: string) => number | null = (name: string) => {
		// Iterate through the list of users and find the one with the matching name
		if (userList) {
			for (const user of userList) {
				if (user.name === name) {
					// Return the user's ID as a number
					return parseInt(user.id);
				}
			}
		}
		return null;
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
			console.log("Error: Could not add work week data to lookup map");
		}
	};

	const updateUserListData = (
		workWeekData: WorkWeekRenderDataType,
		rowId: number
	) => {
		const newUserData = [...userList]; // Create a new array to avoid mutating the original userList
		const userIndex = newUserData.findIndex(
			(user: UserType) => user.id === selectedUser.id
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
		// If the value is not a number, set the value to 0
		setCurrEstHours(e.target.value);
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
				actualHours: parseInt(currActHours),
				assignmentId: rowIdtoAssignmentIdMap.get(selectedCell.rowId),
			};
			addWorkWeekData(newWorkWeekData, selectedCell.rowId);
			updateUserListData(newWorkWeekData, selectedCell.rowId);
		}
		setWasSelectedCellEdited(true);
	};

	const handleCurrActHoursChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setCurrActHours(e.target.value);
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
				estimatedHours: parseInt(currEstHours),
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
		isSelected: boolean
	) => {
		const workWeekData = lookupWorkWeekData(rowIndex, year, cweek);
		if (
			workWeekData &&
			(workWeekData.estimatedHours || workWeekData.actualHours)
		) {
			if (isSelected) {
				return (
					<>
						<div className="flex flex-row">Est:</div>
						<input
							className="flex flex-row"
							value={currEstHours || ""}
							onChange={(e) => handleCurrEstHoursChange(e)}
						></input>
						<div className="flex flex-row">Act:</div>
						<input
							className="flex flex-row"
							value={currActHours || ""}
							onChange={(e) => handleCurrActHoursChange(e)}
						></input>
					</>
				);
			} else {
				return (
					<>
						<div className="flex flex-row">Est:</div>
						<div className="flex flex-row">
							{workWeekData.estimatedHours || "0"}
						</div>
						<div className="flex flex-row">Act:</div>
						<div className="flex flex-row">
							{workWeekData.actualHours || "0"}
						</div>
					</>
				);
			}
		}
		if (isSelected) {
			return (
				<>
					<div className="flex flex-row">Est:</div>
					<input
						className="flex flex-row"
						value={currEstHours || ""}
						onChange={(e) => handleCurrEstHoursChange(e)}
					></input>
					<div className="flex flex-row">Act:</div>
					<input
						className="flex flex-row"
						value={currActHours || ""}
						onChange={(e) => handleCurrActHoursChange(e)}
					></input>
				</>
			);
		} else {
			return <></>;
		}
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

	const handleOnMouseOverWeek = (week: number, year: number, rowId: number) => {
		if (wasSelectedCellEdited) {
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
		setselectedCell({ week, year, rowId });
		const newWorkWeekData = lookupWorkWeekData(
			selectedCell.rowId,
			selectedCell.year,
			selectedCell.week
		);
		if (newWorkWeekData) {
			setCurrEstHours(newWorkWeekData.estimatedHours.toString());
			setCurrActHours(newWorkWeekData.actualHours.toString());
		} else {
			setCurrEstHours("0");
			setCurrActHours("0");
		}
	};

	const setSelectedUserData = (newSelectedId: number) => {
		if (!userList) return;

		const selectedUserData = userList.find(
			(user: UserType) => user.id?.toString() === newSelectedId.toString()
		);
		if (!selectedUserData) return;

		setSelectedUser(selectedUserData);

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
			const name = decodeURIComponent(params.name.toString());
			const userId = getUserIdFromName(name);

			if (userId) {
				setSelectedUserData(userId);
			}
		}
	}, [clientSide, userList, params.name]);

	if (!userList) return <LoadingSpinner />;
	return (
		<>
		<div>
			<h1>Assignments for {decodeURIComponent(params.name.toString())}</h1>
			{userList && selectedUser && selectedUser.assignments && (
				<WeekDisplay
				labelContents={selectedUser.assignments.map(
					(assignment: AssignmentType) => (
						<div key={assignment.id}>
								<div>{assignment.project.client.name}</div>
								<div>{assignment.project.name}</div>
							</div>
						)
						)}
						onMouseOverWeek={(week, year, rowId) => {
							handleOnMouseOverWeek(week, year, rowId);
						}}
						onMouseClickWeek={(week, year, rowId) => {
							console.log(week, year, rowId);
						}}
						renderCell={renderCell}
						selectedCell={selectedCell}
						/>
						)}
		</div>
						</>
	);
};

export default withApollo(UserPage);
