"use client";
import React from "react";
import withApollo from "@/lib/withApollo";

import { useUserDataContext } from "../userDataContext";
import { AssignmentType, UserType } from "../typeInterfaces";
import { LoadingSpinner } from "../components/loadingSpinner";
import { ScrollingCalendar } from "../components/scrollingCalendar/scrollingCalendar";
import { AllUserRow } from "../components/allUsers/allUserRow";
import { AddPersonInline } from "../components/addPersonInline";

const PeopleView: React.FC = () => {
	const { userList } = useUserDataContext();

	const columnHeaderTitles = [{ title: 'People', showIcon: true }]

	const getAllAssignments = (users: UserType[]): AssignmentType[] => {
		return users?.flatMap(user => user.assignments);
	}
	const allAssignments = getAllAssignments(userList)

	return (
		<>
			{userList ? (
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
					<AddPersonInline />
				</ScrollingCalendar>
			) : (
				<LoadingSpinner />
			)}
		</>
	);
};

export default withApollo(PeopleView);
