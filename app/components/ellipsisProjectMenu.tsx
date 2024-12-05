"use client";
import React, { BaseSyntheticEvent, Fragment, useState, RefObject, useCallback } from "react";
import { Menu, MenuItem, MenuButton, MenuItems, Transition } from "@headlessui/react";

import { UPSERT_PROJECT } from "../gqlQueries";
import { useApolloClient, useMutation } from "@apollo/client";
import { useRouter } from "next/navigation";
import { convertProjectToCSV } from "../helperFunctions";
import { useModal } from "../contexts/modalContext";
import AddAssignmentModal from "./addAssignmentModal";
import AddProjectModal from "./addProjectModal";
import { ProjectType, UndoableModifiedProject } from "../typeInterfaces";
import { useFadeInOutRow } from "../hooks/useFadeInOutRow";
import { useProjectsDataContext } from "../contexts/projectsDataContext";
interface EllipsisProjectMenuProps {
	project: ProjectType
	undoRowRef: RefObject<HTMLTableRowElement>;
}

export default function EllipsisProjectMenu({ project, undoRowRef }: EllipsisProjectMenuProps) {
	const { openModal, closeModal } = useModal();
	const client = useApolloClient()
	const { animateRow } = useFadeInOutRow({ rowRef: undoRowRef, minHeight: 0, heightStep: 2 })
	const { enqueueTimer } = useProjectsDataContext()

	const router = useRouter();
	const {
		client: { id: clientId },
		name,
		id,
		status,
	} = project;
	const [confirmed, setConfirmed] = useState(
		status === "confirmed" ? true : false
	);

	const dropdownSelectedItemClass = (isActive: boolean) =>
		isActive
			? "w-full px-4 py-2 block hover:text-accentgreen hover:cursor-pointer text-sm text-left"
			: "text-gray-900 block w-full px-4 py-2 text-sm text-left";
	const [
		upsertProject,
		{ data: mutationData, loading: mutationLoading, error: mutationError },
	] = useMutation(UPSERT_PROJECT, { errorPolicy: "all", fetchPolicy: 'no-cache' });
	const handleProjectChange = () => {
		router.push(`projects/${id}`);
	};
	const onSubmitUpsert = async (e: BaseSyntheticEvent) => {
		const statusCheck = () => {
			if (e.target.checked === true) {
				return "confirmed";
			}
			if (e.target.checked === false) {
				return "unconfirmed";
			}
			if (e.target.id !== "archived") {
				return "archived";
			}
			if (e.target.id === "archived") {
				return "unconfirmed";
			}
		};
		const variables = {
			id: id,
			clientId: clientId,
			name: name,
			status: statusCheck(),
		};
		const { data } = await upsertProject({ variables });
		if (data) {
			client.cache.modify({
				id: client.cache.identify({ __typename: "Project", id: id }),
				fields: {
					status() {
						return data.upsertProject.status;
					},
				},
			});
		}
	};

	const downloadCSV = () => {
		const csv = convertProjectToCSV(project);
		const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
		const url = URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.href = url;
		link.setAttribute('download', `${project.name}.csv`);
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	};
	const undoArchivedStatus = useCallback(
		async (projectsWithUndoActions: UndoableModifiedProject[]) => {
			const projectBeforeModified = projectsWithUndoActions.find((p: UndoableModifiedProject) => p.project.id === project.id)
			const variables = {
				id: project?.id,
				name: project?.name,
				clientId: project?.client?.id,
				status: projectBeforeModified?.project.status || 'confirmed'
			};
			try {
				await upsertProject({ variables });
			} catch (error) {
				console.error('Error updating project:', error);
			}
		},
		[]
	);
	const updateCache = async () => {
		await animateRow(true)
		client.cache.modify({
			id: client.cache.identify({ __typename: "Project", id: project.id }),
			fields: {
				status() {
					return 'archived';
				},
			},
		});
	}
	const handleArchiveItemClick = async (projectStatus: string) => {
		if (projectStatus === 'archived') {
			const variables = {
				id: project.id,
				name: project.name,
				clientId: project.client.id,
				status: "unconfirmed"
			};
			const { data } = await upsertProject({ variables });
			if (data) {
				client.cache.modify({
					id: client.cache.identify({ __typename: "Project", id: id }),
					fields: {
						status() {
							return data.upsertProject.status;
						},
					},
				});
			}
			return;
		}
		const variables = {
			id: project.id,
			name: project.name,
			clientId: project.client.id,
			status: 'archived'
		};
		try {
			const response = await upsertProject({ variables });
			if (response && response.data) {
				const updatedProject = response.data.upsertProject
				const undoAction = (projectsWithUndoActions: UndoableModifiedProject[]) => { undoArchivedStatus(projectsWithUndoActions) }
				enqueueTimer({ project, updatedProject, finalAction: updateCache, undoAction });
			}
		} catch (error) {
			console.error('Error updating project:', error);
		}

	}
	return (
		<Menu
			as="div"
			className="relative inline-block text-left z-40"
			id="add-dropdown"
			data-testid="add-dropdown"
		>
			<MenuButton className="relative z-1 actionbar-text-accent w-full h-full rounded-full flex justify-center items-center ellipsismenu text-2xl"></MenuButton>

			<Transition
				as={Fragment}
				enter="transition ease-out duration-100"
				enterFrom="transform opacity-0 scale-95"
				enterTo="transform opacity-100 scale-100"
				leave="transition ease-in duration-75"
				leaveFrom="transform opacity-100 scale-100"
				leaveTo="transform opacity-0 scale-95"
			>
				<MenuItems className="absolute left-0 top-full z-50 ml-9 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
					<div className="py-1 border-b-2">
						<label className="ml-3 inline-block pl-[0.15rem] hover:cursor-pointer text-gray-900 px-4 py-2 text-sm">
							<input
								className="mr-2 mt-[0.3rem] h-3.5 w-8 appearance-none rounded-[0.4375rem] bg-neutral-300 
																		hover:checked:bg-accentgreen
																		before:pointer-events-none before:absolute before:h-3.5 before:w-3.5 before:rounded-full before:bg-transparent before:content-[''] after:absolute after:z-[2] after:-mt-[0.1875rem] after:h-5 after:w-5 after:rounded-full after:border-none after:bg-neutral-100 after:shadow-[0_0px_3px_0_rgb(0_0_0_/_7%),_0_2px_2px_0_rgb(0_0_0_/_4%)] after:transition-[background-color_0.2s,transform_0.2s] after:content-[''] checked:bg-accentgreen checked:after:absolute checked:after:z-[2] checked:after:-mt-[3px] checked:after:ml-[1.0625rem] checked:after:h-5 checked:after:w-5 checked:after:rounded-full checked:after:border-none checked:after:bg-accentgreen checked:after:shadow-[0_3px_1px_-2px_rgba(0,0,0,0.2),_0_2px_2px_0_rgba(0,0,0,0.14),_0_1px_5px_0_rgba(0,0,0,0.12)] checked:after:transition-[background-color_0.2s,transform_0.2s] checked:after:content-[''] hover:cursor-pointer focus:outline-none focus:ring-0 focus:before:scale-100 focus:before:opacity-[0.12] focus:before:shadow-[3px_-1px_0px_13px_rgba(0,0,0,0.6)] focus:before:transition-[box-shadow_0.2s,transform_0.2s] focus:after:absolute focus:after:z-[1] focus:after:block focus:after:h-5 focus:after:w-5 focus:after:rounded-full focus:after:content-[''] checked:focus:border-accentgreen checked:focus:bg-accentgreen checked:focus:before:ml-[1.0625rem] checked:focus:before:scale-100 checked:focus:before:shadow-[3px_-1px_0px_13px_#3b71ca] checked:focus:before:transition-[box-shadow_0.2s,transform_0.2s] dark:bg-neutral-600 dark:after:bg-neutral-400 dark:checked:bg-accentgreen dark:checked:after:bg-accentgreen dark:focus:before:shadow-[3px_-1px_0px_13px_rgba(255,255,255,0.4)] dark:checked:focus:before:shadow-[3px_-1px_0px_13px_#3b71ca]"
								type="checkbox"
								name="status"
								checked={confirmed}
								onChange={(e) => {
									setConfirmed(!confirmed);
									onSubmitUpsert(e);
								}}
							/>
							{confirmed ? "Confirmed" : "Unconfirmed"}
						</label>
						<MenuItem>
							{({ active }) => (
								<p
									className={dropdownSelectedItemClass(active)}
									onClick={handleProjectChange}
								>
									View Project Plan
								</p>
							)}
						</MenuItem>
						<MenuItem>
							{({ active }) => (
								<button
									onClick={() => openModal(<AddProjectModal project={project} closeModal={closeModal} />)}
									className={dropdownSelectedItemClass(active)}
								>
									Edit Project
								</button>
							)}
						</MenuItem>
						<MenuItem>
							{({ active }) => (
								<button
									className={dropdownSelectedItemClass(active)}
									onClick={() =>
										openModal(<AddAssignmentModal project={project} closeModal={closeModal} />)
									}
								>
									Add Person
								</button>
							)}

						</MenuItem>
						<MenuItem>
							<button className="w-full px-4 py-2 text-sm text-left hover:text-accentgreen border-none" onClick={downloadCSV}>
								Export CSV
							</button>
						</MenuItem>
					</div>
					<div
						id={`${project.status}`}
						onClick={() => handleArchiveItemClick(project.status)}
						className={
							"text-orange-500 block px-4 py-2 text-sm hover:text-accentgreen hover:border-b-2 hover:cursor-pointer hover:border-gray-200"
						}
					>
						{project.status === "archived"
							? "Unarchive Project"
							: "Archive Project"}
					</div>
				</MenuItems>
			</Transition>
		</Menu>
	);
}