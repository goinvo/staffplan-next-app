"use client";
import React, { useState, useEffect } from "react";
import withApollo from "@/lib/withApollo";

import { useRouter } from "next/navigation";
import { AssignmentType, UserType } from "../typeInterfaces";
import { LoadingSpinner } from "../components/loadingSpinner";
import { ScrollingCalendar } from "../components/scrollingCalendar/scrollingCalendar";
import { AllUserRow } from "../components/allUsers/allUserRow";
import { useUserDataContext } from "../contexts/userDataContext";
import { SORT_ORDER } from "../components/scrollingCalendar/constants";
import { useGeneralDataContext } from "../contexts/generalContext";
import InlineButtonInactiveUser from "../components/inlineButtonInActiveUser";

const PeopleView: React.FC = () => {
  const router = useRouter();

  const homepageUrl = process.env.NEXT_PUBLIC_NODE_ENV
    ? "http://localhost:3000"
    : "https://app.staffplan.com";

  const [initialSorting, setInitialSorting] = useState<{title: string; sort: SORT_ORDER}>(() => {
    if (typeof window !== "undefined" && localStorage) {
      const savedInitialSorting = localStorage.getItem("peoplePageSorting");
      return savedInitialSorting
        ? JSON.parse(savedInitialSorting)
        : { title: "People", sort: SORT_ORDER.ASC };
    }
  });

  const { filteredUserList } = useUserDataContext();
  const { viewer, isFirstShowInactiveUsers, isFirstHideInactiveUsers, setIsFirstShowInactiveUsers, setIsFirstHideInactiveUsers } = useGeneralDataContext();

  useEffect(() => {
    if (isFirstShowInactiveUsers) {
      setTimeout(() => {
        setIsFirstShowInactiveUsers(false);
      }, 700);
    }

    if (isFirstHideInactiveUsers) {
      setTimeout(() => {
        setIsFirstHideInactiveUsers(false);
      }, 700);
    }
  }, [isFirstShowInactiveUsers, isFirstHideInactiveUsers]);

	const columnHeaderTitles = [
    {
      title: "People",
      showIcon: viewer?.role === "admin" || viewer?.role === "owner",
      ...(viewer?.role === "admin" || viewer?.role === "owner"
        ? { onIconClick: () => router.push(`${homepageUrl}/settings/users`) }
        : {}),
    },
  ];

	const getAllAssignments = (users: UserType[]): AssignmentType[] => {
		return users?.flatMap(user =>
			user.assignments.filter(assignment => assignment.status !== 'archived')
		);
  };
  
  const allAssignments = getAllAssignments(filteredUserList);

	return (
    <>
      {filteredUserList.length ? (
        <ScrollingCalendar
          title="People"
          columnHeaderTitles={columnHeaderTitles}
          assignments={allAssignments}
          initialSorting={initialSorting}
        >
          {filteredUserList?.map((user: UserType, index: number) => {
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
          <InlineButtonInactiveUser />
        </ScrollingCalendar>
      ) : (
        <LoadingSpinner />
      )}
    </>
  );
};

export default withApollo(PeopleView);
