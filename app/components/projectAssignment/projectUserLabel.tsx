'use client'
import Image from "next/image";
import React, { useCallback } from "react";

import { DELETE_ASSIGNMENT, UPSERT_ASSIGNMENT } from "../../gqlQueries";
import { ProjectLabelProps, AssignmentType, UndoableModifiedAssignment } from "@/app/typeInterfaces";
import { AddPersonInline } from "../addPersonInline";
import { useMutation } from "@apollo/client";
import { useProjectsDataContext } from "@/app/contexts/projectsDataContext";
import EllipsisDropdownMenu from "../ellipsisDropdownMenu";
import EditAssignmentModal from "../userAssignment/editAssignmentModal";
import { useModal } from "@/app/contexts/modalContext";
import { useGeneralDataContext } from "@/app/contexts/generalContext";
import { useUserDataContext } from "@/app/contexts/userDataContext";
import { useFadeInOutRow } from "@/app/hooks/useFadeInOutRow";

export const ProjectUserLabel = ({
	project,
	assignment,
	clickHandler,
	undoRowRef
}: ProjectLabelProps) => {
	const { setUserList, enqueueTimer } = useUserDataContext()
	const { openModal, closeModal } = useModal();
	const { viewer } = useGeneralDataContext();
	const isUserTBD = assignment.assignedUser === null;
	const {
		projectList,
		setProjectList,
		singleProjectPage,
		refetchProjectList,
		setSingleProjectPage,
	} = useProjectsDataContext();
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
	const canAssignmentBeDeleted = !assignment.workWeeks.some(
		(week) => (week.actualHours ?? 0) > 0
	);
	const showActionsButton =
		viewer?.id === assignment.assignedUser?.id ||
		assignment.assignedUser === null;
	const showArchiveButton =
		viewer?.id === assignment.assignedUser?.id && !canAssignmentBeDeleted;
	const showDeleteButton =
		!assignment.assignedUser ||
		(viewer?.id === assignment.assignedUser?.id &&
			canAssignmentBeDeleted &&
			assignment.canBeDeleted);
	const [deleteAssignment] = useMutation(DELETE_ASSIGNMENT, {
		errorPolicy: "all",
		onCompleted({ deleteAssignment }) {
			const deletedAssignmentId = deleteAssignment.id;
			const updatedAssignments = singleProjectPage?.assignments?.filter(
				(assignment) => assignment.id !== deletedAssignmentId
			);
			singleProjectPage &&
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

	const handleDeleteAssignmentClick = () => {
		if (assignment.canBeDeleted) {
			const variables = {
				assignmentId: assignment.id,
			};
			deleteAssignment({ variables });
			return;
		}
	};
	const onChangeStatusButtonClick = async () => {
		const variables = {
			id: assignment.id,
			projectId: project?.id,
			userId: assignment.assignedUser.id,
			status: assignment.status === "active" ? "proposed" : "active",
		};

		const { errors } = await upsertAssignment({
			variables,
		});

		if (!errors) {
			refetchProjectList();
		}
	};
	const undoArchivedStatus = useCallback(
		async (assignmentsWithUndoActions: UndoableModifiedAssignment[]) => {
			const projectId = project?.id || assignment?.project?.id
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
		if (assignment.status !== "archived") {
			const variables = {
				id: assignment.id,
				projectId: project?.id,
				userId: assignment.assignedUser.id,
				status: "archived",
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
	const assignmentDropMenuOptions = [
		{
			component: (
				<button
					className="text-gray-900 block px-4 py-2 text-sm"
					onClick={() =>
						openModal(
							<EditAssignmentModal
								assignment={assignment}
								project={project}
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
			component: (
				<button
					onClick={handleArchiveAssignmentClick}
					className="text-gray-900 block px-4 py-2 text-sm"
				>
					Archive
				</button>
			),
			show: showArchiveButton && showActionsButton,
		},
		{
			component: (
				<button
					onClick={handleDeleteAssignmentClick}
					className="text-gray-900 block px-4 py-2 text-sm"
				>
					Delete
				</button>
			),
			show: showDeleteButton && showActionsButton,
		},
	];
	return (
		<td className="px-0 pr-0 pt-2 pb-2 font-normal flex align-center sm:w-1/3 w-1/2">
			<div className="flex flex-row justify-between sm:items-start items-center">
				<div className="w-12 ml-auto sm:flex hidden">
					{showActionsButton && (
						<EllipsisDropdownMenu
							options={assignmentDropMenuOptions}
							textColor={"text-gray-900"}
							menuPositioning="relative -top-2.5"
						/>
					)}
				</div>
				{isUserTBD && (
					<AddPersonInline project={project} assignment={assignment} />
				)}

				<div className="w-48 font-bold flex text-contrastBlue w-full">
					{!isUserTBD && (
						<div className="py-2 relative overflow-hidden w-[38px] h-[28px]  aspect-w-38 aspect-h-28">
							<Image
								src={assignment.assignedUser.avatarUrl}
								className="rounded-md object-cover"
								alt="user avatar"
								fill
								sizes="(max-width: 640px) 28px, (max-width: 768px) 38px, 38px"
							/>
						</div>
					)}
					<div className="flex flex-col items-center justify-center">
						{!isUserTBD && (
							<button className="px-2" onClick={() => clickHandler(assignment)}>
								{assignment.assignedUser.name}
							</button>
						)}
					</div>
				</div>
			</div>
			<div className="text-contrastBlue sm:flex hidden flex-col space-y-3 ml-auto px-2 items-end max-w-[60px]">
				<button className="pt-1 underline" onClick={onChangeStatusButtonClick}>
					{assignment.status === "proposed" ? "Proposed" : "Signed"}
				</button>
				<div className="pt-2">Actual</div>
			</div>
		</td>
	);
};
