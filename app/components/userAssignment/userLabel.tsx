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
import { useClientDataContext } from "@/app/contexts/clientContext";

export const UserLabel = ({ assignment, selectedUser, clickHandler, undoRowRef, isFirstClient }: UserLabelProps) => {
	const { openModal, closeModal } = useModal();
	const { setSingleUserPage, setUserList, enqueueTimer } = useUserDataContext()
	const { viewer } = useGeneralDataContext()
	const { refetchClientList } = useClientDataContext()
	const { setProjectList } = useProjectsDataContext();
	const isAssignmentProposed = assignment.status === "proposed";
	const canAssignmentBeDeleted = !assignment.workWeeks.some(
		(week) => (week.actualHours ?? 0) > 0);
	const showActionsButton = viewer?.id === assignment.assignedUser?.id
	const showArchiveButton = showActionsButton && !canAssignmentBeDeleted
	const showDeleteButton = showActionsButton && canAssignmentBeDeleted

	const { animateRow } = useFadeInOutRow({ rowRef: undoRowRef, minHeight: 0, heightStep: 2, opacityStep: 0.1 })

	const [upsertAssignment] = useMutation(UPSERT_ASSIGNMENT, {
		errorPolicy: "all"
	});

	const [deleteAssignment] = useMutation(DELETE_ASSIGNMENT, {
		errorPolicy: "all",
		context: {
			fetchOptions: {
				keepalive: true,
			},
		},
	})

	const updateAssignmentStatus = async (upsertAssignment: AssignmentType) => {
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

	const finalDeletingAssignment = () => {
		const variables = {
			assignmentId: assignment.id,
		};
		deleteAssignment({ variables })
	}

	const undoableDeleteAssignment = async () => {
		const variables = {
			assignmentId: assignment.id,
		};
		try {
			const { data } = await deleteAssignment({ variables });
			await animateRow(true)
			if (data) {
				setUserList((prevUserList) => {
					return prevUserList?.map((user) => {
						if (user.id === assignment.assignedUser.id) {
							const updatedUserAssignments = user.assignments.filter(
								(assignment) => assignment.id !== data.deleteAssignment.id
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
						if (project.id === assignment.project.id) {
							const updatedProjectAssignments = project?.assignments?.filter(
								(assignment) => assignment.id !== data.deleteAssignment.id
							);
							return {
								...project,
								assignments: updatedProjectAssignments,
							};
						}
						return project;
					});
				});
				refetchClientList()
			}
		} catch (error) {
			console.log("Error deleting assignment.:", error)
		}
	}
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
					enqueueTimer({
						assignment,
						updatedAssignment,
						finalAction: () => updateAssignmentStatus(updatedAssignment),
						undoAction,
					});
				}
			} catch (error) {
				console.error('Error updating assignment:', error);
			}
		}
	};

	const handleDeleteAssignmentClick = () => {
		enqueueTimer({ assignment, updatedAssignment: assignment, finalAction: undoableDeleteAssignment, finalApiCall: finalDeletingAssignment });
	}

	const assignmentDropMenuOptions = [
		{
			component: (
				<button
					className="block w-full px-8 py-4 text-sm text-left"
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
			component: <button onClick={handleArchiveAssignmentClick} className="block w-full px-8 py-4 text-sm text-left">Archive</button>,
			show: showArchiveButton,
		},
		{
			component: <button onClick={handleDeleteAssignmentClick} className="block w-full px-8 py-4 text-sm text-left">Delete</button>,
			show: showDeleteButton,
		},

	];
	return (
		<div className={`sm:ml-auto ml-0 w-full sm:w-24 flex justify-between items-center ${isFirstClient ? "mb-4 sm:mb-0" : ''}`}>
			<button
				className={`lg:pl-5 md:ml-2 lg:ml-0 pt-0 sm:pt-2 ${isAssignmentProposed ? "sm:pl-4" : "sm:pl-2"
					} font-bold flex items-center justify-start text-contrastBlue text-start`}
				onClick={() => clickHandler(assignment)}
			>
				{assignment.project.name}
			</button>
			{showActionsButton &&
				<EllipsisDropdownMenu
					options={assignmentDropMenuOptions}
					textColor={"text-gray-900"}
				/>
			}
		</div>
	);
};
