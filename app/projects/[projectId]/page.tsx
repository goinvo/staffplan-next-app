"use client";
import { useParams, useRouter, usePathname } from "next/navigation";
import React, { useEffect, useState, useMemo } from "react";
import withApollo from "@/lib/withApollo";
import { useMutation } from "@apollo/client";
import {
	ProjectType,
	UserType,
	WorkWeekRenderDataType,
	WorkWeekType,
	AssignmentType,
} from "../../typeInterfaces";
import { UPSERT_WORKWEEK } from "../../gqlQueries";
import WeekDisplay from "../../components/weekDisplay";
import { LoadingSpinner } from "@/app/components/loadingSpinner";
import { useUserDataContext } from "@/app/userDataContext";
import ProjectDetails from "@/app/components/projectDetails";
import Image from "next/image";
import { sortSingleProject } from "@/app/helperFunctions";
import UserSummary from "@/app/components/userSummary";
import ProjectSummary from "@/app/components/allProjectsSummary";
import { PlusIcon } from "@heroicons/react/24/solid";
import AddAssignmentSingleProject from "@/app/components/addAssignmentSIngleProject";
import { ScrollingCalendar } from "@/app/components/weekDisplayPrototype/scrollingCalendar";
import { UserAssignmentRow } from "@/app/components/userAssignmentPrototype/userAssignmentRow";
import { ProjectAssignmentRow } from "@/app/components/projectAssignmentPrototype/projectAssignmentRow";

const ProjectPage: React.FC = () => {
	const params = useParams();
	const selectedProjectId = decodeURIComponent(params.projectId.toString());
	const [addAssignmentVisible, setAddAssignmentVisible] = useState(false);
	const [selectedProject, setSelectedProject] = useState<ProjectType | null>(
		null
	);

	const [rowIdToUserIdMap, setRowIdToUserIdMap] = useState<Map<number, number>>(
		new Map()
	);
	const [usersWithProjectAssignment, setUsersWithProjectAssignment] = useState<
		UserType[]
	>([]);

	const {
		userList,
		projectList,
		viewsFilter,
		setSingleProjectPage,
	} = useUserDataContext();

	const updateDataState = (
		workWeekData: WorkWeekRenderDataType,
		rowId: number
	) => {
		// Update usersWithProjectAssignment with the new work week data
		const newUsersWithProjectAssignment: UserType[] =
			usersWithProjectAssignment.map((user: UserType) => {
				const newAssignments: AssignmentType[] = user.assignments?.map(
					(assignment: AssignmentType) => {
						if (assignment.id === workWeekData.assignmentId) {
							const newWorkWeeks = assignment.workWeeks?.map(
								(week: WorkWeekType) => {
									if (
										week.year === workWeekData.year &&
										week.cweek === workWeekData.cweek
									) {
										return {
											...week,
											estimatedHours: workWeekData.estimatedHours,
											actualHours: workWeekData.actualHours,
										};
									}
									return week;
								}
							);

							// Check if a matching work week was found
							const matchingWorkWeek = newWorkWeeks?.find(
								(week: WorkWeekType) =>
									week.year === workWeekData.year &&
									week.cweek === workWeekData.cweek
							);

							// If no matching work week was found, create a new one and add it to newWorkWeeks
							if (!matchingWorkWeek) {
								const newWorkWeek: WorkWeekType = {
									estimatedHours: workWeekData.estimatedHours,
									actualHours: workWeekData.actualHours,
									project: assignment.project,
									user: user,
									assignmentId: assignment.id,
									cweek: workWeekData.cweek,
									year: workWeekData.year,
								};

								newWorkWeeks?.push(newWorkWeek);
							}

							return { ...assignment, workWeeks: newWorkWeeks };
						}
						return assignment;
					}
				) as AssignmentType[];

				return { ...user, assignments: newAssignments };
			});

		setUsersWithProjectAssignment(newUsersWithProjectAssignment);
	};

	useEffect(() => {
		if (projectList) {
			const foundProject = projectList.find(
				(project: ProjectType) => project.id.toString() === selectedProjectId
			);
			if (foundProject) {
				setSingleProjectPage(foundProject);
				setSelectedProject(foundProject);
			}

			if (!userList) return;

			const newUsersWithProjectAssignment = userList
				.map((user: UserType) => {
					// Filter out assignments that don't match the project name
					const filteredAssignments = user.assignments?.filter((assignment) => {
						return assignment.project.id.toString() === selectedProjectId;
					});
					return {
						...user,
						assignments: filteredAssignments,
					};
				})
				.filter(
					(user: UserType) => user.assignments && user.assignments.length > 0
				);
			const sortedAssignments = sortSingleProject(
				viewsFilter.singleProjectSort,
				newUsersWithProjectAssignment
			);
			setUsersWithProjectAssignment(sortedAssignments);
		}
	}, [projectList, userList]);

	useEffect(() => {
		if (!selectedProject || !selectedProject.workWeeks) return;

		const workWeekData: WorkWeekRenderDataType[][] =
			selectedProject.workWeeks.map((week: WorkWeekType) => {
				return [
					{
						cweek: week.cweek,
						year: week.year,
						estimatedHours: week.estimatedHours ?? 0,
						actualHours: week.actualHours ?? 0,
						assignmentId: week.assignmentId,
					},
				];
			});

		workWeekData.forEach((workWeeks: WorkWeekRenderDataType[], index) => {
			workWeeks.forEach((week: WorkWeekRenderDataType) => {
				updateDataState(week, index);
			});

			if (selectedProject.workWeeks && selectedProject.workWeeks[index]?.user) {
				const userId = selectedProject.workWeeks[index].user?.id;
				if (userId !== undefined) {
					rowIdToUserIdMap.set(index, userId);
				}
			}
		});
	}, [selectedProject]);

	const onClose = () => setAddAssignmentVisible(false);
	const onComplete = () => {
		setAddAssignmentVisible(false);
	};
	return (
		<div>
				<ScrollingCalendar>
				{selectedProject?.assignments?.map((assignment: AssignmentType, index) => {
					return (
						<ProjectAssignmentRow
							key={index}
							assignment={assignment}
							monthData={{ monthLabel: "", year: 0 }}
							isFirstMonth={true}
							isLastMonth={true}
						/>
					);
				})}
			</ScrollingCalendar>
		</div>
	);
};

export default withApollo(ProjectPage);
