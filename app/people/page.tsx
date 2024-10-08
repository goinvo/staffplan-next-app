"use client";
import React from "react";
import withApollo from "@/lib/withApollo";

import { AssignmentType, UserType } from "../typeInterfaces";
import { LoadingSpinner } from "../components/loadingSpinner";
import { ScrollingCalendar } from "../components/scrollingCalendar/scrollingCalendar";
import { AllUserRow } from "../components/allUsers/allUserRow";
import { useUserDataContext } from "../contexts/userDataContext";

const PeopleView: React.FC = () => {
	const { userList } = useUserDataContext();

	const columnHeaderTitles = [{ title: 'People', showIcon: true }]

	const getAllAssignments = (users: UserType[]): AssignmentType[] => {
		return users?.flatMap(user => user.assignments);
	}
	const allAssignments = getAllAssignments(userList)

	return (
		<>
			{userList.length ? (
				<ScrollingCalendar title='People' columnHeaderTitles={columnHeaderTitles} assignments={allAssignments}>
					{userList?.map((user: UserType, index: number) => {
						return (
							<AllUserRow
								key={index}
								user={user}
								monthData={{ monthLabel: "", year: 0 }}
								isFirstMonth={true}
								isLastMonth={true}
							/>
						);
					})}
				</ScrollingCalendar>
			) : (
				<LoadingSpinner />
			)}
		</>
	);
};

export default withApollo(PeopleView);
