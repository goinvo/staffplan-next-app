'use client'
import React from "react";
import { DateTime } from "luxon";
import { useMutation } from "@apollo/client";
import { ArchiveBoxIcon } from "@heroicons/react/24/outline";

import { AssignmentType, UserSummaryProps } from "../typeInterfaces";
import IconButton from "./iconButton";
import { DELETE_ASSIGNMENT, UPSERT_ASSIGNMENT } from "../gqlQueries";
import { useUserDataContext } from "../contexts/userDataContext";
import { useProjectsDataContext } from "../contexts/projectsDataContext";
import { useGeneralDataContext } from '../contexts/generalContext';


const UserSummary: React.FC<UserSummaryProps> = ({ assignment, selectedUser, project }) => {
	const burnedHours = assignment.workWeeks.reduce(
		(acc, curr) => acc + (curr.actualHours ?? 0),
		0
	);
	const { setSingleUserPage, userList, setUserList } = useUserDataContext()
	const { showSummaries } = useGeneralDataContext()
	const { projectList, setProjectList, singleProjectPage, setSingleProjectPage } = useProjectsDataContext();
	const pastPlan = () => {
		const now = DateTime.now();
		const startOfAssignment = DateTime.fromISO(assignment.startsOn ?? "");
		const timeBetween = now.diff(startOfAssignment, ["weeks"]).toObject();
		if (timeBetween.weeks && timeBetween.weeks > 0) {
			return assignment.estimatedWeeklyHours * Math.ceil(timeBetween.weeks);
		}
	};

	const futurePlan = () => {
		const now = DateTime.now();
		const endOfAssignment = DateTime.fromISO(assignment.endsOn ?? "");
		const timeBetween = endOfAssignment.diff(now, ["weeks"]).toObject();
		if (timeBetween.weeks && timeBetween.weeks > 0) {
			return assignment.estimatedWeeklyHours * Math.ceil(timeBetween.weeks);
		}
	};

	const [upsertAssignment] = useMutation(UPSERT_ASSIGNMENT, {
		errorPolicy: "all",
		onCompleted({ upsertAssignment }) {
			const updatedAssignments = singleProjectPage?.assignments?.map((assignment) =>
				assignment.id === upsertAssignment.id ? upsertAssignment : assignment
			);
			const updatedProjectList = projectList?.map((project) => {
				if (project.id === singleProjectPage?.id) {
					return {
						...project,
						assignments: project?.assignments?.map((assignment) =>
							assignment.id === upsertAssignment.id ? upsertAssignment : assignment
						),
					};
				}
				return project;
			});
			const updatedUserList = userList?.map((user) => {
				if (user.id === upsertAssignment.assignedUser.id) {
					const updatedUserAssignments = user.assignments.map((assignment) =>
						assignment.id === upsertAssignment.id ? upsertAssignment : assignment
					);

					return {
						...user,
						assignments: updatedUserAssignments,
					};
				}
				return user;
			});

			setUserList(updatedUserList);
			setSingleProjectPage({
				...singleProjectPage,
				assignments: updatedAssignments,
			});
			setProjectList(updatedProjectList);
		},

	});


	const [deleteAssignment] = useMutation(DELETE_ASSIGNMENT, {
		errorPolicy: "all",
		onCompleted({ deleteAssignment }) {
			const deletedAssignmentId = deleteAssignment.id;
			const updatedAssignments = singleProjectPage?.assignments?.filter(
				(assignment) => assignment.id !== deletedAssignmentId
			);
			setSingleProjectPage({
				...singleProjectPage,
				assignments: updatedAssignments,
			});
			const projectId = singleProjectPage?.id;
			if (projectList && projectId) {
				const updatedProjectList = projectList.map((project) => {
					if (project.id === projectId) {
						return {
							...project,
							assignments: project?.assignments?.filter(
								(assignment) => assignment.id !== deletedAssignmentId
							),
						};
					}
					return project;
				});
				setProjectList(updatedProjectList);
			}
		},
	});
	const handleArchiveItemClick = () => {
		if (assignment.project && assignment.project.isTempProject) {
			const removedTempAssignment = selectedUser?.assignments.filter((a: AssignmentType) => a.id !== assignment.id);
			const selectedUserData = {
				...selectedUser,
				assignments: removedTempAssignment || [],
				name: selectedUser?.name || "Default Name",
				avatarUrl: selectedUser?.avatarUrl || "defaultAvatarUrl.png",
			};
			setSingleUserPage(selectedUserData);
			return;
		}
		if (assignment.assignedUser === null) {
			const variables = {
				assignmentId: assignment.id,
			};
			deleteAssignment({ variables });
			return;
		}
		if (assignment.status !== 'archived') {
			const projectId = project ? project.id : assignment.project.id;
			const variables = {
				id: assignment.id,
				projectId: projectId,
				userId: assignment.assignedUser.id,
				status: 'archived',
			};
			upsertAssignment({ variables });
		}
	};

	const summaries = [
		{ label: 'future plan', value: futurePlan(), unit: 'hrs' },
		{ label: 'burned', value: burnedHours, unit: 'hrs', alwaysShow: true },
		{ label: 'past plan', value: pastPlan(), unit: 'hrs' },
	];

	return (
		<td className="font-normal py-2 pl-4 w-1/6 flex items-center justify-between">
			{showSummaries && (
				<div>
					{summaries.map((sum, index) =>
						sum.value || sum.alwaysShow ? (
							<div key={index} className="flex justify-between">
								<label className="text-sm pr-1 whitespace-nowrap">{sum.label}</label>
								<span className="font-bold text-sm">
									{sum.value}
									<span className="text-sm font-normal pl-1">{sum.unit}</span>
								</span>
							</div>
						) : null
					)}
				</div>
			)}
			<div className="flex items-start justify-center">
				<IconButton
					className='text-black flex items-start justify-center text-transparentGrey'
					onClick={handleArchiveItemClick}
					Icon={ArchiveBoxIcon}
					iconSize={'h6 w-6'}
				/>
			</div>
		</td >
	);
};

export default UserSummary;