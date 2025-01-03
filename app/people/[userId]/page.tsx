"use client";;
import { useRouter } from "next/navigation";
import { useParams, usePathname } from "next/navigation";
import React, { useEffect, useState, useRef } from "react";
import withApollo from "@/lib/withApollo";
import { AssignmentType } from "../../typeInterfaces";
import { LoadingSpinner } from "@/app/components/loadingSpinner";
import { ScrollingCalendar } from "@/app/components/scrollingCalendar/scrollingCalendar";
import { UserAssignmentRow } from "@/app/components/userAssignment/userAssignmentRow";
import { useUserDataContext } from "@/app/contexts/userDataContext";
import { useGeneralDataContext } from "@/app/contexts/generalContext";
import ApproveHours from "@/app/components/userAssignment/approveHours";
import ColumnChartsRow from "@/app/components/userAssignment/columnChartsRow";
import { AddProjectForm } from "@/app/components/userAssignment/addProjectForm";
import { SORT_ORDER } from "@/app/components/scrollingCalendar/constants";
import InlineButtonArchivedAssignments from "@/app/components/inlineButtonArchivedAssignments";

const UserPage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();

  const [initialSorting, setInitialSorting] = useState<{title: string; sort: SORT_ORDER}>(() => {
    if (typeof window !== "undefined" && localStorage) {
      const savedInitialSorting = localStorage.getItem("staffPlanPageSorting");
      return savedInitialSorting
        ? JSON.parse(savedInitialSorting)
        : { title: "Client", sort: SORT_ORDER.ASC };
    }
  });

	const [addAssignmentVisible, setAddAssignmentVisible] = useState(false);
	const inputRefs = useRef<Array<[Array<HTMLInputElement | null>, Array<HTMLInputElement | null>]>>([]);

  const { userList, singleUserPage, setSelectedUserData, refetchUserList } = useUserDataContext();
  const { viewer, setIsAddNewProject } = useGeneralDataContext();

  const homepageUrl = process.env.NEXT_PUBLIC_NODE_ENV
    ? "http://localhost:3000"
    : "https://app.staffplan.com";
  const isMyStaffPlan = pathname.split("/").pop() === viewer?.id.toString();

	useEffect(() => {
		if (userList.length) {
			const userId = decodeURIComponent(params?.userId?.toString());
      if (userId) {
				setSelectedUserData(parseInt(userId));
			}
		}
  }, [userList, params.userId, setSelectedUserData]);
  
  useEffect(() => {
    return () => {
      setIsAddNewProject(false)
      refetchUserList()
    };
  }, []);

	if (!userList.length) return <LoadingSpinner />;

	const onClose = () => setAddAssignmentVisible(false);
	const onComplete = () => {
		setAddAssignmentVisible(false);
	};
	const columnsHeaderTitles = [
    { title: "Client", showIcon: false },
    {
      title: "Projects",
      showIcon: true,
      onIconClick: () => setIsAddNewProject(true),
    },
  ];
	return (
    <>
      {singleUserPage && userList.length ? (
        <ScrollingCalendar
          columnHeaderTitles={columnsHeaderTitles}
          avatarUrl={singleUserPage.avatarUrl}
          userName={singleUserPage.name}
          assignments={singleUserPage.assignments}
          initialSorting={initialSorting}
          editable={isMyStaffPlan}
          onClick={isMyStaffPlan ? () => router.push(`${homepageUrl}/settings/profile`) : undefined}
        >
          {[
            <AddProjectForm
              user={singleUserPage}
              key="addForm"
            />,
            ...singleUserPage?.assignments?.map(
            (
              assignment: AssignmentType,
              rowIndex: number,
              allAssignments: AssignmentType[]
            ) => {
              const isFirstClient =
                rowIndex ===
                allAssignments.findIndex(
                  (a) => a.project.client.id === assignment.project.client.id
                );
              return (
                <UserAssignmentRow
                  key={assignment.id}
                  assignment={assignment}
                  isFirstMonth={true}
                  isLastMonth={true}
                  isFirstClient={isFirstClient}
                  selectedUser={singleUserPage}
                  rowIndex={rowIndex}
                  totalRows={singleUserPage?.assignments?.length || 0}
                  inputRefs={inputRefs}
                />
              );
            }
            )]}
          <InlineButtonArchivedAssignments/>
          <ApproveHours />
          <ColumnChartsRow />
        </ScrollingCalendar>
      ) : (
        <LoadingSpinner />
      )}
    </>
  );
};

export default withApollo(UserPage);
