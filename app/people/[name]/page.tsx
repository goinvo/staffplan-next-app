'use client'
import { useParams, useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import withApollo from '@/lib/withApollo';
import { gql, useQuery, useLazyQuery, useMutation } from "@apollo/client";
import { ProjectType, UserType } from "../../components/addAssignmentModal";
import { parseProjectDates, parseWorkWeekDate, workWeekComponentsArr, AssignmentType, calWeekDatesArr, workWeekArr } from "../../people/helperFunctions";
import WeekDisplay, { selectedCell } from "../../components/weekDisplay";
import { WorkWeekType, UPSERT_WORKWEEK } from '../../components/workWeek';
import { set } from 'date-fns';

type WorkWeekRenderData = {
	cweek: number;
	year: number;
	estimatedHours: number;
	actualHours: number;
	assignmentId: number;
}

const GET_USER_ASSIGNMENTS = gql`
	query getUserAssignments($selectedUserId: ID!) {
		userAssignments(userId: $selectedUserId) {
			id
			startsOn
			endsOn
			status
			assignedUser {
				name
				id
			}
			workWeeks {
				id
				actualHours
				assignmentId
				cweek
				estimatedHours
				year
			}
			project {
				name
				id
				client {
					name
				}
				startsOn
				endsOn
			}
		}
	}
`;

const GET_USER_LIST = gql`
	{
		users {
			id
			name
		}
	}
`;

const UserPage: React.FC = () => {
	const params = useParams();
	const searchParams = useSearchParams();
	const [clientSide, setClientSide] = useState(false);
	const [selectedUser, setSelectedUser] = useState<UserType>({
		id: null,
		name: "Select",
	});
	const [selectedCell, setselectedCell] = useState<selectedCell>({ week: 0, year: 0, rowId: 0 });
	const [workWeekDataLookupMap, setWorkWeekDataLookupMap] = useState<Map<number, Map<number, Map<number, WorkWeekRenderData>>>>(new Map());
	const [currEstHours, setCurrEstHours] = useState<string>("0");
	const [currActHours, setCurrActHours] = useState<string>("0");
	const [wasSelectedCellEdited, setWasSelectedCellEdited] = useState<boolean>(false);
	const [rowIdtoAssignmentIdMap, setRowIdtoAssignmentIdMap] = useState<Map<number, number>>(new Map());

	const [
		upsertWorkweek,
		{ data: mutationData, loading: mutationLoading, error: mutationError },
	] = useMutation(UPSERT_WORKWEEK, {
		onCompleted(mutationData) {
			console.log(mutationData, "DATADATA");
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

	const upsertWorkWeekValues = (values: WorkWeekRenderData) => {
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
		if (userListData && userListData.users) {
			for (const user of userListData.users) {
				if (user.name === name) {
					// Return the user's ID as a number
					return parseInt(user.id);
				}
			}
		}
		return null;
	}

	const addWorkWeekDataToLookupMap = (workWeekData: WorkWeekRenderData) => {
		if (!workWeekDataLookupMap.has(workWeekData.assignmentId)) {
			workWeekDataLookupMap.set(workWeekData.assignmentId, new Map());
		}
		if (!workWeekDataLookupMap.get(workWeekData.assignmentId)?.has(workWeekData.year)) {
			workWeekDataLookupMap.get(workWeekData.assignmentId)?.set(workWeekData.year, new Map());
		}
		workWeekDataLookupMap.get(workWeekData.assignmentId)?.get(workWeekData.year)?.set(workWeekData.cweek, workWeekData);
	}

	const handleCurrEstHoursChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		// If the value is not a number, set the value to 0
		setCurrEstHours(e.target.value);
		const newEstimatedHours = parseInt(e.target.value);
		const newWorkWeekData = lookupWorkWeekData(selectedCell.rowId, selectedCell.year, selectedCell.week);
		if (newWorkWeekData && !isNaN(newEstimatedHours)) {
			newWorkWeekData.estimatedHours = newEstimatedHours;
			setWorkWeekDataLookupMap(workWeekDataLookupMap.set(selectedCell.rowId, new Map().set(selectedCell.year, new Map().set(selectedCell.week, newWorkWeekData))));
			setWasSelectedCellEdited(true);
		} else {
			console.log("Error: Could not find work week data for selected cell");
			// TODO: Add a new work week data entry to the lookup map
			// addWorkWeekDataToLookupMap({ cweek: selectedCell.week, year: selectedCell.year, estimatedHours: newEstimatedHours, actualHours: 0, assignmentId: rowIdtoAssignmentIdMap.get(selectedCell.rowId) });
		}
	}

	const handleCurrActHoursChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setCurrActHours(e.target.value);
		const newActualHours = parseInt(e.target.value);
		const newWorkWeekData = lookupWorkWeekData(selectedCell.rowId, selectedCell.year, selectedCell.week);
		if (newWorkWeekData && !isNaN(newActualHours)) {
			newWorkWeekData.actualHours = newActualHours;
			setWorkWeekDataLookupMap(workWeekDataLookupMap.set(selectedCell.rowId, new Map().set(selectedCell.year, new Map().set(selectedCell.week, newWorkWeekData))));
			setWasSelectedCellEdited(true);
		} else {
			console.log("Error: Could not find work week data for selected cell");
			// TODO: Add a new work week data entry to the lookup map
			// addWorkWeekDataToLookupMap({ cweek: selectedCell.week, year: selectedCell.year, estimatedHours: 0, actualHours: newActualHours, assignmentId: rowIdtoAssignmentIdMap.get(selectedCell.rowId) });
		}
	}

	const renderCell = (cweek: number, year: number, rowIndex: number, isSelected: boolean) => {
		const workWeekData = lookupWorkWeekData(rowIndex, year, cweek);
		if (workWeekData && (workWeekData.estimatedHours && workWeekData.actualHours)) {
			if (isSelected) {
				return (
					<>
						<div className="flex flex-row">Est:</div>
						<input className="flex flex-row" value={currEstHours} onChange={(e) => handleCurrEstHoursChange(e)}></input>
						<div className="flex flex-row">Act:</div>
						<input className="flex flex-row" value={currActHours} onChange={(e) => handleCurrActHoursChange(e)}></input>
					</>
				)
			} else {
				return (
					<>
						<div className="flex flex-row">Est:</div>
						<div className="flex flex-row">{workWeekData.estimatedHours}</div>
						<div className="flex flex-row">Act:</div>
						<div className="flex flex-row">{workWeekData.actualHours}</div>
					</>
				)
			}
		}
		if (isSelected) {
			return (
				<>
					<div className="flex flex-row">Est:</div>
					<input className="flex flex-row" value={currEstHours} onChange={(e) => handleCurrEstHoursChange(e)}></input>
					<div className="flex flex-row">Act:</div>
					<input className="flex flex-row" value={currActHours} onChange={(e) => handleCurrActHoursChange(e)}></input>
				</>
			)
		} else {
			return (<></>)
		}
	}

	const lookupWorkWeekData = (rowIndex: number, year: number, cweek: number) => {
		if (workWeekDataLookupMap.has(rowIndex) && workWeekDataLookupMap.get(rowIndex)?.has(year) && workWeekDataLookupMap.get(rowIndex)?.get(year)?.has(cweek)) {
			return workWeekDataLookupMap.get(rowIndex)?.get(year)?.get(cweek);
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
		const workWeekData: WorkWeekRenderData[][] = userAssignmentData.userAssignments.map(
			(assignment: AssignmentType) => {
				return assignment.workWeeks.map((week: WorkWeekType) => {
					return { cweek: week.cweek, year: week.year, estimatedHours: week.estimatedHours, actualHours: week.actualHours, assignmentId: assignment.id };
				});
			}
		);
		workWeekData.forEach((assignmentWeeks: WorkWeekRenderData[], index) => {
			assignmentWeeks.forEach((week: WorkWeekRenderData) => {
				if (!workWeekDataLookupMap.has(index)) { workWeekDataLookupMap.set(index, new Map()); }
				if (!workWeekDataLookupMap.get(index)?.has(week.year)) { workWeekDataLookupMap.get(index)?.set(week.year, new Map()); }
				workWeekDataLookupMap.get(index)?.get(week.year)?.set(week.cweek, week);
			});
			rowIdtoAssignmentIdMap.set(index, userAssignmentData.userAssignments[index].id);
		});
	}, [userAssignmentData]);

	if (called && userAssignmentLoading) return <p>Loading User Assignments for {decodeURIComponent(params.name.toString())}</p>;
	if (userListLoading) return <p>Finding user...</p>;
	if (userListError) return <p>Error Loading Users List</p>;
	if (userAssignmentError) return <p>Error Loading User Assignments for {decodeURIComponent(params.name.toString())}</p>;

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
