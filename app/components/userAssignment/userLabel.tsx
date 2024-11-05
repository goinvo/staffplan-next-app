'use client'
import React, { useCallback } from "react";
import { AssignmentType, UserLabelProps, UndoableModifiedAssignment } from "../../typeInterfaces";
import EllipsisDropdownMenu from "../ellipsisDropdownMenu";
import { useModal } from "@/app/contexts/modalContext";
import EditAssignmentModal from "./editAssignmentModal";
import { useProjectsDataContext } from "@/app/contexts/projectsDataContext";
import { useGeneralDataContext } from "@/app/contexts/generalContext";
import { useUserDataContext } from "@/app/contexts/userDataContext";
import { DELETE_ASSIGNMENT, UPSERT_ASSIGNMENT } from "@/app/gqlQueries";
import { useMutation } from "@apollo/client";
import { useFadeInOutRow } from "../../hooks/useFadeInOutRow";

export const UserLabel = ({ assignment, selectedUser, clickHandler, undoRowRef }: UserLabelProps) => {
	const { openModal, closeModal } = useModal();
	const { setSingleUserPage, setUserList, enqueueTimer } = useUserDataContext()
	const { viewer } = useGeneralDataContext()
	const { projectList, setProjectList, singleProjectPage, setSingleProjectPage } = useProjectsDataContext();

	const isAssignmentProposed = assignment.status === "proposed";
	const canAssignmentBeDeleted = !assignment.workWeeks.some(
		(week) => (week.actualHours ?? 0) > 0);
	const showActionsButton = viewer?.id === assignment.assignedUser?.id || assignment.assignedUser === null;
	const showArchiveButton = viewer?.id === assignment.assignedUser?.id && !canAssignmentBeDeleted
	const showDeleteButton = !assignment.assignedUser || viewer?.id === assignment.assignedUser?.id && canAssignmentBeDeleted && assignment.canBeDeleted;

	const { animateRow } = useFadeInOutRow({ rowRef: undoRowRef, minHeight: 0, heightStep: 2 })

	const [upsertAssignment] = useMutation(UPSERT_ASSIGNMENT, {
		errorPolicy: "all"
	});
	const updateContext = async (upsertAssignment: AssignmentType) => {
		await animateRow(true)
		setUserList((prevUserList) => {
			return prevUserList?.map((user) => {
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
		});

		setProjectList((prevProjectList) => {
			return prevProjectList?.map((project) => {
				if (project.id === upsertAssignment?.project?.id) {
					return {
						...project,
						assignments: project.assignments?.map((assignment) =>
							assignment.id === upsertAssignment.id ? upsertAssignment : assignment
						),
					};
				}
				return project;
			});
		});

	};
	const undoArchivedStatus = useCallback(
		async (assignmentsWithUndoActions: UndoableModifiedAssignment[]) => {
			const projectId = assignment.project.id;
			const assignmentBeforeModified = assignmentsWithUndoActions.find((el: UndoableModifiedAssignment) => el.assignment.id === assignment.id)
			const variables = {
				id: assignment.id,
				projectId: projectId,
				userId: assignment.assignedUser.id,
				status: assignmentBeforeModified?.assignment?.status || 'active'
			};
			try {
				await upsertAssignment({ variables });
			} catch (error) {
				console.error('Error updating assignment:', error);
			}
		},
		[]
	);

	const [deleteAssignment] = useMutation(DELETE_ASSIGNMENT, {
		errorPolicy: "all",
		onCompleted({ deleteAssignment }) {
			const deletedAssignmentId = deleteAssignment.id;
			const updatedAssignments = singleProjectPage?.assignments?.filter(
				(assignment) => assignment.id !== deletedAssignmentId
			);
			singleProjectPage && setSingleProjectPage({
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
	const handleArchiveAssignmentClick = async () => {
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
		if (assignment.status !== 'archived') {
			const projectId = assignment.project.id;
			const variables = {
				id: assignment.id,
				projectId: projectId,
				userId: assignment.assignedUser.id,
				status: 'archived',
			};
			try {
				const response = await upsertAssignment({ variables });
				if (response && response.data) {
					const updatedAssignment = response.data.upsertAssignment
					const undoAction = (undoableAssignments: UndoableModifiedAssignment[]) => { undoArchivedStatus(undoableAssignments) }
					enqueueTimer(assignment, updatedAssignment, () => updateContext(updatedAssignment), undoAction);
				}
			} catch (error) {
				console.error('Error updating assignment:', error);
			}
		}
	};

	const handleDeleteAssignmentClick = () => {
		if (assignment.canBeDeleted) {
			const deletedAssignment = selectedUser?.assignments.filter((a: AssignmentType) => a.id !== assignment.id);
			const selectedUserData = {
				...selectedUser,
				assignments: deletedAssignment || [],
				name: selectedUser?.name || "Default Name",
				avatarUrl: selectedUser?.avatarUrl || "defaultAvatarUrl.png",
			};
			setSingleUserPage(selectedUserData);
			const variables = {
				assignmentId: assignment.id,
			};
			deleteAssignment({ variables });
			return;

		};
	}
	const assignmentDropMenuOptions = [
		{
			component: (
				<button
					className="block px-4 py-2 text-sm"
					onClick={() =>
						openModal(
							<EditAssignmentModal
								assignment={assignment}
								closeModal={closeModal}
							/>
						)
					}
				>
					Edit Assignment
				</button>
			),
			show: true,
		},
		{
			component: <button onClick={handleArchiveAssignmentClick} className="block px-4 py-2 text-sm">Archive</button>,
			show: showArchiveButton && showActionsButton,
		},
		{
			component: <button onClick={handleDeleteAssignmentClick} className="block px-4 py-2 text-sm">Delete</button>,
			show: showDeleteButton && showActionsButton,
		},

	];
	return (
		<div className="sm:ml-auto ml-0 sm:w-24 flex">
			<button
				className={`lg:pl-5 md:ml-2 lg:ml-0 pt-2 ${isAssignmentProposed ? "sm:pl-4" : "sm:pl-2"
					} font-bold flex items-center justify-start text-contrastBlue text-start`}
				onClick={() => clickHandler(assignment)}
			>
				{assignment.project.name}
			</button>
			{showActionsButton && <EllipsisDropdownMenu
				options={assignmentDropMenuOptions}
				textColor={"text-gray-900"}
			/>}
		</div>
	);
};
