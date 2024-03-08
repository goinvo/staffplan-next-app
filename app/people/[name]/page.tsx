'use client'
import { useParams, useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import withApollo from '@/lib/withApollo';
import { gql, useQuery, useLazyQuery } from "@apollo/client";
import { ProjectType, UserType } from "../../components/addAssignmentModal";
import { parseProjectDates, parseWorkWeekDate, workWeekComponentsArr, AssignmentType, calWeekDatesArr, workWeekArr } from "../../people/helperFunctions";
import WeekDisplay, { WeekCellData, selectedCell } from "../../components/weekDisplay";

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

	useEffect(() => {
		setClientSide(true);
	}, []);

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
				weekCellDataArray={userAssignmentData.userAssignments.map((assignment: AssignmentType) => {

				})}
				onMouseOverWeek={(week, year, rowId) => {setselectedCell({week, year, rowId})}}
				onMouseClickWeek={(week, year, rowId) => {console.log(week, year, rowId)}}
				selectedCell={selectedCell}
				/>}
			<div className="flex flex-col items-start">
				{
					userAssignmentData ? (
						userAssignmentData.userAssignments.map(
							(assignment: AssignmentType) => (
								<div key={assignment.id} className="flex">
									<div>
										<p className="text-xl underline">
											Project Name: {assignment.project.name}
										</p>
										{assignment.project.startsOn ? (
											<p>Project Start Date: {assignment.project.startsOn}</p>
										) : (
											""
										)}
										{assignment.project.endsOn ? (
											<p>Project End Date: {assignment.project.endsOn}</p>
										) : (
											""
										)}
										<div className="p-3">
											<span>Assignment Status:{assignment.status}</span>
											<br />
											<span>Assignment Duration</span>
											<br />
											<span>Starts On: {assignment.startsOn}</span>
											<br />
											<span>Ends On: {assignment.endsOn}</span>
											<br />
										</div>
									</div>
									{assignment.project.startsOn ? (
										<p>
											Project Work Week:
											{parseProjectDates(assignment.project.startsOn).cweek}
										</p>
									) : (
										""
									)}
									<div className="p-3 flex">
										{workWeekComponentsArr(
											assignment.startsOn,
											assignment.endsOn,
											calWeekDatesArr,
											workWeekArr(userAssignmentData),
											assignment.id
										)}
									</div>
								</div>
							)
						)
					) : (
						<p>User has no Assignments</p>
					)
				}
			</div>
		</div>
	);
};

export default withApollo(UserPage);
