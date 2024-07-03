"use client";
import React from "react";
import withApollo from "@/lib/withApollo";
import { useUserDataContext } from "../userDataContext";
import { UserType } from "../typeInterfaces";
import { LoadingSpinner } from "../components/loadingSpinner";
import { ScrollingCalendar } from "../components/weekDisplayPrototype/scrollingCalendar";
import { AllUserRow } from "../components/allUsersPrototype/allUserRow";
const PeopleView: React.FC = () => {
	const { userList } = useUserDataContext();

	return (
		<>
			{userList ? (
				<ScrollingCalendar>
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
