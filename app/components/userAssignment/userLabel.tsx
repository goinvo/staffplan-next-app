'use client'
import React, { useCallback } from "react";

import { AssignmentType, UserLabelProps, UndoableModifiedAssignment, ProjectType } from "../../typeInterfaces";
import EllipsisDropdownMenu from "../ellipsisDropdownMenu";
import { useModal } from "@/app/contexts/modalContext";
import EditAssignmentModal from "./editAssignmentModal";
import EditProjectModal from "../editProjectModal";
import { useProjectsDataContext } from "@/app/contexts/projectsDataContext";
import { useGeneralDataContext } from "@/app/contexts/generalContext";
import { useUserDataContext } from "@/app/contexts/userDataContext";
import { DELETE_ASSIGNMENT, UPSERT_ASSIGNMENT, UPSERT_PROJECT_WITH_INPUT } from "@/app/gqlQueries";
import { useMutation } from "@apollo/client";
import { useFadeInOutRow } from "../../hooks/useFadeInOutRow";
import { useClientDataContext } from "@/app/contexts/clientContext";
import { convertProjectToCSV } from "@/app/helperFunctions";

export const UserLabel = ({ assignment, selectedUser, clickHandler, undoRowRef, isFirstClient }: UserLabelProps) => {
	const { openModal, closeModal } = useModal();
	const { setSingleUserPage, setUserList, enqueueTimer, refetchUserList } = useUserDataContext()
	const { viewer } = useGeneralDataContext()
	const { refetchClientList } = useClientDataContext()
	const { setProjectList, refetchProjectList } = useProjectsDataContext();
	const isAssignmentProposed = assignment.status === "proposed";
	const canAssignmentBeDeleted = !assignment.workWeeks.some(
		(week) => (week.actualHours ?? 0) > 0);
	const showActionsButton = viewer?.id === assignment.assignedUser?.id
	const showArchiveButton = showActionsButton && assignment.project.status !== 'archived'
	const showUnarchiveButton = showActionsButton && assignment.project.status === 'archived'
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

	const [upsertProjectWithInput] = useMutation(UPSERT_PROJECT_WITH_INPUT, {
    errorPolicy: "all",
		onCompleted({ upsertProjectWithInput }) {
			if (upsertProjectWithInput) {

				refetchProjectList();
        refetchUserList();
				const updatedAssignments = selectedUser.assignments.map((a) => {
          if (a.project.id === upsertProjectWithInput.id) {
            return {
              ...a,
              project: { ...a.project, status: upsertProjectWithInput.status },
            };
          }

          return a;
				});
				
				const updatedSelectedUser = {
          ...selectedUser,
          assignments: updatedAssignments,
				};

				setSingleUserPage(updatedSelectedUser);
			}
    },
  });

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

	const handleUnarchiveProject = async (project: ProjectType) => {
		const input = {
			id: project.id,
			name: project.name,
			clientId: project.client.id,
			status: "unconfirmed",
	};
		await upsertProjectWithInput({ variables: { input } });
	};

	const downloadCSV = () => {
			const csv = convertProjectToCSV(assignment.project);
			const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
			const url = URL.createObjectURL(blob);
			const link = document.createElement('a');
			link.href = url;
			link.setAttribute('download', `${assignment.project.name}.csv`);
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
		};

	const assignmentDropMenuOptions = [
		{
			component: (
				<button
					className="block w-full px-4 py-2 text-sm text-left"
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
			show: false,
		},
		{
      component: (
        <button
          onClick={() => openModal(<EditProjectModal project={assignment.project} closeModal={closeModal} isModalView/>) }
          className="block w-full px-4 py-2 text-sm text-left"
        >
          Edit project
        </button>
      ),
      show: true,
    },
		{
			component: <button onClick={downloadCSV} className="block w-full px-4 py-2 text-sm text-left">Export CSV</button>,
			show: true,
		},
		{
			component: <button onClick={handleDeleteAssignmentClick} className="block w-full px-4 py-2 text-sm text-left text-[#FF5E5E] border-t border-t-[#E5E7EB]">Delete me from this project</button>,
			show: showDeleteButton,
		},
		{
			component: <button onClick={handleArchiveAssignmentClick} className="block w-full px-4 py-2 text-sm text-left text-[#FF5E5E] border-t border-t-[#E5E7EB]">Archive project for everyone</button>,
			show: showArchiveButton,
		},
		{
			component: <button onClick={handleArchiveAssignmentClick} className="block w-full px-4 py-2 text-sm text-left border-t border-t-[#E5E7EB]">Unarchive project for everyone</button>,
			show: showUnarchiveButton,
		},

	];
	return (
		<div className={`w-full ${isAssignmentProposed ? "sm:max-w-[185px] w-full md:pl-1 lg:pl-2" : "sm:max-w-[205px] w-full md:pl-1 lg:pl-2" } sm:mr-0 mr-2 flex items-start ${isFirstClient ? "mb-4 sm:mb-0" : ''}`}>
			<div>
        <button
          className={`pt-0 sm:pt-2  font-bold flex items-center justify-start text-contrastBlue text-start`}
          onClick={() => clickHandler(assignment)}
        >
          {assignment.project.name}
        </button>
        {assignment.project.status === "archived" && (
					<span
            className="group relative underline text-contrastBlue text-start cursor-pointer"
            onClick={() => handleUnarchiveProject(assignment.project)}
          >
            &#40;Archived&#41;
            <span className="absolute top-[110%] -left-[34px] w-32 py-1 rounded-[3px] bg-contrastBlue text-white text-xs leading-[14px] text-center opacity-0 pointer-events-none transition-all duration-200 ease-linear group-hover:opacity-100">
              Unarchive project for everyone
            </span>
          </span>
				)}
      </div>
			{showActionsButton &&
				<EllipsisDropdownMenu
					options={assignmentDropMenuOptions}
					textColor={"actionbar-text-accent"}
					className="ml-2 mt-[2px]"
					menuItemsClassName="w-56"				
				/>
			}
		</div>
	);
};
