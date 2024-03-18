"use client";
import { useParams, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import withApollo from "@/lib/withApollo";
import { useQuery, useLazyQuery, useMutation } from "@apollo/client";
import { UserType, AssignmentType, WorkWeekRenderDataType, WorkWeekType } from "../../typeInterfaces";
import { UPSERT_WORKWEEK, GET_USER_ASSIGNMENTS, GET_USER_LIST } from "../../gqlQueries";
import WeekDisplay, { selectedCell } from "../../components/weekDisplay";

const UserPage: React.FC = () => {
	const params = useParams();
	const searchParams = useSearchParams();
	const [clientSide, setClientSide] = useState(false);
	const [selectedUser, setSelectedUser] = useState<UserType>({
		id: NaN,
		name: "Select",
	});
	const [selectedCell, setselectedCell] = useState<selectedCell>({ week: 0, year: 0, rowId: 0 });
	const [workWeekDataLookupMap, setWorkWeekDataLookupMap] = useState<Map<number, Map<number, WorkWeekRenderDataType>>[]>([]);
	const [currEstHours, setCurrEstHours] = useState<string>("0");
	const [currActHours, setCurrActHours] = useState<string>("0");
	const [wasSelectedCellEdited, setWasSelectedCellEdited] = useState<boolean>(false);
	const [rowIdtoAssignmentIdMap, setRowIdtoAssignmentIdMap] = useState<Map<number, number>>(new Map());

	const [
		upsertWorkweek,
		{ data: mutationData, loading: mutationLoading, error: mutationError },
	] = useMutation(UPSERT_WORKWEEK, {
		onCompleted(mutationData) {
		},
	});

	const [
		getUserAssignments,
		{
			data: userAssignmentData,
			loading: userAssignmentLoading,
			error: userAssignmentError,
			called,
		},
	] = useLazyQuery(GET_USER_ASSIGNMENTS, {
		variables: { selectedUserId: selectedUser.id },
	});

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

	const {
		loading: userListLoading,
		error: userListError,
		data: userListData,
	} = useQuery(GET_USER_LIST, {
		context: {
			headers: {
				cookie: clientSide ? document.cookie : null,
			},
		},
		skip: !clientSide,
		errorPolicy: "all",
	});

	const getUserIdFromName: (name: string) => number | null = (name: string) => {
		// Iterate through the list of users and find the one with the matching name
		if (userListData && userListData.currentCompany && userListData.currentCompany.users) {
			for (const user of userListData.currentCompany.users) {
				if (user.name === name) {
					// Return the user's ID as a number
					return parseInt(user.id);
				}
			}
		}
		return null;
	};

	const addWorkWeekData = (workWeekData: WorkWeekRenderDataType, rowId: number) => {
		// Add data to the lookup map
		if (rowId != undefined) {
			if (!workWeekDataLookupMap[rowId]) {
				workWeekDataLookupMap[rowId] = new Map();
			}
			if (!workWeekDataLookupMap[rowId]?.has(workWeekData.year)) {
				workWeekDataLookupMap[rowId]?.set(workWeekData.year, new Map());
			}
			workWeekDataLookupMap[rowId].get(workWeekData.year)?.set(workWeekData.cweek, workWeekData);
		} else {
			console.log("Error: Could not add work week data to lookup map");
		}
	}

	const handleCurrEstHoursChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		// If the value is not a number, set the value to 0
		setCurrEstHours(e.target.value);
		const newEstimatedHours = parseInt(e.target.value);
		const newWorkWeekData = lookupWorkWeekData(selectedCell.rowId, selectedCell.year, selectedCell.week);
		if (newWorkWeekData) {
			newWorkWeekData.estimatedHours = newEstimatedHours;
			addWorkWeekData(newWorkWeekData, selectedCell.rowId);
		} else {
			const newWorkWeekData = { cweek: selectedCell.week, year: selectedCell.year, estimatedHours: newEstimatedHours, actualHours: parseInt(currActHours), assignmentId: rowIdtoAssignmentIdMap.get(selectedCell.rowId) };
			addWorkWeekData(newWorkWeekData, selectedCell.rowId);
		}
		setWasSelectedCellEdited(true);
	}

	const handleCurrActHoursChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setCurrActHours(e.target.value);
		const newActualHours = parseInt(e.target.value);
		const newWorkWeekData = lookupWorkWeekData(selectedCell.rowId, selectedCell.year, selectedCell.week);
		if (newWorkWeekData) {
			newWorkWeekData.actualHours = newActualHours;
			addWorkWeekData(newWorkWeekData, selectedCell.rowId);
		} else {
			const newWorkWeekData = { cweek: selectedCell.week, year: selectedCell.year, estimatedHours: parseInt(currEstHours), actualHours: newActualHours, assignmentId: rowIdtoAssignmentIdMap.get(selectedCell.rowId) };
			addWorkWeekData(newWorkWeekData, selectedCell.rowId);
		}
		setWasSelectedCellEdited(true);
	}

	const renderCell = (cweek: number, year: number, rowIndex: number, isSelected: boolean) => {
		const workWeekData = lookupWorkWeekData(rowIndex, year, cweek);
		if (workWeekData && (workWeekData.estimatedHours || workWeekData.actualHours)) {
			if (isSelected) {
				return (
					<>
						<div className="flex flex-row">Est:</div>
						<input className="flex flex-row" value={currEstHours || ""} onChange={(e) => handleCurrEstHoursChange(e)}></input>
						<div className="flex flex-row">Act:</div>
						<input className="flex flex-row" value={currActHours || ""} onChange={(e) => handleCurrActHoursChange(e)}></input>
					</>
				)
			} else {
				return (
					<>
						<div className="flex flex-row">Est:</div>
						<div className="flex flex-row">{workWeekData.estimatedHours || "0"}</div>
						<div className="flex flex-row">Act:</div>
						<div className="flex flex-row">{workWeekData.actualHours || "0"}</div>
					</>
				)
			}
		}
		if (isSelected) {
			return (
				<>
					<div className="flex flex-row">Est:</div>
					<input className="flex flex-row" value={currEstHours || ""} onChange={(e) => handleCurrEstHoursChange(e)}></input>
					<div className="flex flex-row">Act:</div>
					<input className="flex flex-row" value={currActHours || ""} onChange={(e) => handleCurrActHoursChange(e)}></input>
				</>
			)
		} else {
			return (<></>)
		}
	}

	const lookupWorkWeekData = (rowIndex: number, year: number, cweek: number) => {
		if (workWeekDataLookupMap[rowIndex] && workWeekDataLookupMap[rowIndex]?.has(year) && workWeekDataLookupMap[rowIndex]?.get(year)?.has(cweek)) {
			return workWeekDataLookupMap[rowIndex]?.get(year)?.get(cweek);
		}
		return null;
	}

	const handleOnMouseOverWeek = (week: number, year: number, rowId: number) => {
		if (wasSelectedCellEdited) {
			const oldWorkWeekData = lookupWorkWeekData(selectedCell.rowId, selectedCell.year, selectedCell.week);
			if (oldWorkWeekData) {
				upsertWorkWeekValues(oldWorkWeekData);
				setWasSelectedCellEdited(false);
				console.log("upserted");
			}
		}
		setselectedCell({ week, year, rowId });
		const newWorkWeekData = lookupWorkWeekData(selectedCell.rowId, selectedCell.year, selectedCell.week);
		if (newWorkWeekData) {
			setCurrEstHours(newWorkWeekData.estimatedHours.toString());
			setCurrActHours(newWorkWeekData.actualHours.toString());
		} else {
			setCurrEstHours("0");
			setCurrActHours("0");
		}
	}

	useEffect(() => {
		setClientSide(true);
	}, []);

	// If the user list has been loaded and the user's name is in the URL, get the user's ID and load their assignments
	useEffect(() => {
		if (clientSide && userListData) {
			const name = decodeURIComponent(params.name.toString());
			const userId = getUserIdFromName(name);
			if (userId) {
				setSelectedUser({ id: userId, name });
				getUserAssignments({ variables: { selectedUserId: userId } });
			}
		}
	}, [clientSide, userListData, params.name]);

	// If the user's assignments have been loaded, create a lookup map for the work weeks and map the rows to the assignment IDs
	useEffect(() => {
		if (!userAssignmentData) return;
		const workWeekData: WorkWeekRenderDataType[][] = userAssignmentData.userAssignments.map(
			(assignment: AssignmentType) => {
				return assignment.workWeeks.map((week: WorkWeekType) => {
					return { cweek: week.cweek, year: week.year, estimatedHours: week.estimatedHours, actualHours: week.actualHours, assignmentId: assignment.id };
				});
			}
		);
		workWeekData.forEach((assignmentWeeks: WorkWeekRenderDataType[], index) => {
			assignmentWeeks.forEach((week: WorkWeekRenderDataType) => {
				addWorkWeekData(week, index);
			});
			rowIdtoAssignmentIdMap.set(index, userAssignmentData.userAssignments[index].id);
		});

		console.log(workWeekDataLookupMap, "LOOKUPMAP");
	}, [userAssignmentData]);

	if (called && userAssignmentLoading)
		return (
			<p>
				Loading User Assignments for{" "}
				{decodeURIComponent(params.name.toString())}
			</p>
		);
	if (userListLoading) return <p>Finding user...</p>;
	if (userListError) return <p>Error Loading Users List</p>;
	if (userAssignmentError)
		return (
			<p>
				Error Loading User Assignments for{" "}
				{decodeURIComponent(params.name.toString())}
			</p>
		);

	return (
		<div>
			<h1>Assignments for {decodeURIComponent(params.name.toString())}</h1>
			{userAssignmentData &&
				userAssignmentData.userAssignments &&
				<WeekDisplay labelContents={userAssignmentData.userAssignments.map((assignment: AssignmentType) => (
					<div key={assignment.id}>
						<div>{assignment.project.client.name}</div>
						<div>{assignment.project.name}</div>
					</div>
				))}
					onMouseOverWeek={(week, year, rowId) => { handleOnMouseOverWeek(week, year, rowId) }}
					onMouseClickWeek={(week, year, rowId) => { console.log(week, year, rowId) }}
					renderCell={renderCell}
					selectedCell={selectedCell}
				/>}
		</div>
	);
};

export default withApollo(UserPage);
