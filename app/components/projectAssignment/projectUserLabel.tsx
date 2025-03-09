'use client'
import Image from "next/image";
import React, {useState} from "react";

import { DELETE_ASSIGNMENT, UPSERT_ASSIGNMENT } from "../../gqlQueries";
import { ProjectLabelProps } from "@/app/typeInterfaces";
import { AddPersonInline } from "../addPersonInline";
import { useMutation } from "@apollo/client";
import { useProjectsDataContext } from "@/app/contexts/projectsDataContext";
import EllipsisDropdownMenu from "../ellipsisDropdownMenu";
import EditAssignmentModal from "../userAssignment/editAssignmentModal";
import { useModal } from "@/app/contexts/modalContext";
import { useGeneralDataContext } from "@/app/contexts/generalContext";
import { useUserDataContext } from "@/app/contexts/userDataContext";
import { useFadeInOutRow } from "@/app/hooks/useFadeInOutRow";
import IconButton from "@/app/components/iconButton";
import {MdVisibilityOff} from "react-icons/md";

export const ProjectUserLabel = ({
	project,
	assignment,
	clickHandler,
	undoRowRef
}: ProjectLabelProps) => {
	const { setUserList, enqueueTimer, refetchUserList } = useUserDataContext()
	const { openModal, closeModal } = useModal();
	const { viewer } = useGeneralDataContext();
	const isUserTBD = assignment.assignedUser === null;
	const {
		setProjectList,
		refetchProjectList,
	} = useProjectsDataContext();
	const { animateRow } = useFadeInOutRow({ rowRef: undoRowRef, minHeight: 0, heightStep: 2 })

	const currentUserId = assignment?.assignedUser?.id

	const [upsertAssignment] = useMutation(UPSERT_ASSIGNMENT, {
		errorPolicy: "all",
		onCompleted({ upsertAssignment }) {
			if (upsertAssignment) {
				setUserList(prev => prev.map(user => {
					if (user.id?.toString() === currentUserId) {
						const newAssignment = user.assignments.map(a => {
							if (a.id.toString() === upsertAssignment.id) {
								return ({ ...a, status: upsertAssignment.status});
							}
							return a
						})
						return { ...user, assignments: newAssignment };
					}
					return user
				}))
				setProjectList(prev => prev.map(project => {
					if (project.id === upsertAssignment.project.id) {
						const newAssignments = project.assignments?.map(a => {
							if (a.assignedUser?.id === upsertAssignment.assignedUser.id) {
								return { ...a, status: upsertAssignment.status };
							}
							return a
						})

						return ({...project, assignments: newAssignments})
					}

					return project
				}))
				refetchUserList();
				refetchProjectList()
			}
		},
	});

	const [deleteAssignment] = useMutation(DELETE_ASSIGNMENT, {
		errorPolicy: "all",
		context: {
			fetchOptions: {
				keepalive: true,
			},
		},
	})

	const [showTooltip, setShowTooltip] = useState(false)

	const canAssignmentBeDeleted = !assignment.workWeeks.some(
		(week) => (week.actualHours ?? 0) > 0
	);

	const isAdminOrOwner = viewer?.role === 'admin' || viewer?.role === 'owner';
	const canEditAssignment = viewer?.id === assignment.assignedUser?.id || !assignment.assignedUser;
	const canDeleteAssignment = canAssignmentBeDeleted && (isAdminOrOwner || canEditAssignment);
	const showEllipsisMenu = canEditAssignment || canDeleteAssignment;
	const showHideButton = canEditAssignment && !assignment.focused

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
				setProjectList((prevProjectList) => {
					return prevProjectList?.map((proj) => {
						if (proj.id === project?.id) {
							const updatedProjectAssignments = proj.assignments?.filter(
								(assignment) => assignment.id !== data.deleteAssignment.id
							);
							return {
								...proj,
								assignments: updatedProjectAssignments,
							};
						}
						return proj;
					});
				});
				setUserList((prevUserList) => {
					return prevUserList?.map((user) => {
						if (user.id === assignment?.assignedUser?.id) {
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

			}
		} catch (error) {
			console.log("Error deleting assignment.:", error)
		}
	}

	const handleDeleteAssignmentClick = () => {
		enqueueTimer({ assignment, updatedAssignment: assignment, finalAction: undoableDeleteAssignment, finalApiCall: finalDeletingAssignment });
	}

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
			setProjectList(prev => prev.map(p => {
				if (p.id === project?.id) {
					const newAssignments = p.assignments?.map(a => {
						if (a.id === assignment.id) {
							return ({...a, status: assignment.status === "active" ? "proposed" : "active", })
						}
						return a
					})
					return ({...p, assignments: newAssignments})
				}
				return p
			}))
			setUserList(prev => prev.map(u => {
				if (u.id === assignment.assignedUser.id) {
					const newAssignments = u.assignments.map(a => {
						if (a.id === assignment.id) {
							return ({...a, status: assignment.status === "active" ? "proposed" : "active"})
						}
						return a
					})

					return ({...u, assignments: newAssignments})
				}
				return u
			}))
		}
	};
	const assignmentDropMenuOptions = [
		// {
		// 	component: (
		// 		<button
		// 			className="text-gray-900 w-full block px-8 py-4 text-sm text-left"
		// 			onClick={() =>
		// 				openModal(
		// 					<EditAssignmentModal
		// 						assignment={assignment}
		// 						project={project}
		// 						closeModal={closeModal}
		// 					/>
		// 				)
		// 			}
		// 		>
		// 			Edit Assignment
		// 		</button>
		// 	),
		// 	show: canEditAssignment,
		// },
		{
			component: (
				<button
					onClick={handleDeleteAssignmentClick}
					className="text-red-400 w-full block px-1 py-1 text-sm text-left"
				>
					Delete {assignment.assignedUser ? assignment.assignedUser.name.split(' ')[0] : "person"} from project
				</button>
			),
			show: canDeleteAssignment,
		},
	];

	const showHiddenProject = async () => {

		const variables = {
			id: assignment?.id,
			projectId: project?.id,
			userId: assignment?.assignedUser.id,
			status: assignment?.status,
			focused: true
		};

		try {
			const response = await upsertAssignment({ variables});
		} catch (error) {
			console.error('Error updating project:', error);
		}
	}

	return (
		<td className="px-0 pr-0 pt-2 pb-2 font-normal flex align-center sm:w-2/5 w-1/2">
			<div className="flex flex-row justify-between sm:items-start items-center">
				{isUserTBD && (
					<AddPersonInline project={project} assignment={assignment} />
				)}

				<div className="w-48 font-bold flex text-contrastBlue w-full">
					{!isUserTBD && (
						<div
							className="py-2 relative overflow-hidden w-[38px] h-[28px]  aspect-w-38 aspect-h-28 hover:cursor-pointer"
							onClick={() => clickHandler(assignment)}
						>
							<Image
								src={assignment.assignedUser.avatarUrl}
								className="rounded-md object-cover"
								alt="user avatar"
								fill
								sizes="(max-width: 640px) 28px, (max-width: 768px) 38px, 38px"
							/>
						</div>
					)}
					<div className="flex flex-col items-start justify-center">
						{!isUserTBD && (
							<button className="relative px-2" onClick={() => clickHandler(assignment)}>
								{assignment.assignedUser.name}
								{!assignment.assignedUser.isActive && <span className="absolute top-[90%] left-2 font-normal">&#40;Deactivated&#41;</span>}
							</button>
						)}
						<div className='flex items-center relative cursor-pointer'
							 onClick={() => {
								 setShowTooltip(false)
								 showHiddenProject()}
							 }>
							{showHideButton
								?
								<div onMouseEnter={() => setShowTooltip(true)}
									 onMouseLeave={() => setShowTooltip(false)}
									 className='flex items-center'
								>
									<IconButton
										className="pl-1"
										iconSize="w-4 h-4"
										Icon={MdVisibilityOff}
									/>
									<span className='font-normal'>Hidden in MyStaffPlan</span>
								</div>
								: <div className='w-8'></div>

								// TODO add icon for hide project
								// 	<IconButton
								// 	className="py-1 pl-4 "
								// 	iconSize="w-4 h-4"
								// 	onClick={() => null}
								// 	Icon={MdVisibility}
								// />
							}
							{showTooltip &&
								<div className="absolute top-1/2 left-1/2 bg-gray-700 text-white text-xs rounded px-2 py-1 z-50 shadow-lg min-w-40">
									Show in My StaffPlan
								</div>
							}
						</div>
					</div>
				</div>
				<div className="w-12 ml-auto sm:flex hidden">
					{canDeleteAssignment && (
						<EllipsisDropdownMenu
							options={assignmentDropMenuOptions}
							textColor={"actionbar-text-accent"}
							menuPositioning="relative -top-2.5"
							className="pt-[9px]"
						/>
					)}
				</div>
			</div>
			<div className="text-contrastBlue sm:flex hidden flex-col space-y-3 ml-auto px-2 items-end max-w-[60px]">
				<button className="pt-1 underline" onClick={onChangeStatusButtonClick}>
					{assignment.status === "proposed" ? "Proposed" : "Plan"}
				</button>
				<div className="pt-2">Actual</div>
			</div>
		</td>
	);
};
