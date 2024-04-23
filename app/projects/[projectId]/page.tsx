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

const ProjectPage: React.FC = () => {
	const params = useParams();
	const selectedProjectId = decodeURIComponent(params.projectId.toString());
	const [addAssignmentVisible, setAddAssignmentVisible] = useState(false);
	const [selectedProject, setSelectedProject] = useState<ProjectType | null>(
		null
	);
	const [wasSelectedCellEdited, setWasSelectedCellEdited] =
		useState<boolean>(false);
	const [rowIdToUserIdMap, setRowIdToUserIdMap] = useState<Map<number, number>>(
		new Map()
	);
	const [usersWithProjectAssignment, setUsersWithProjectAssignment] = useState<
		UserType[]
	>([]);

	const [upsertWorkweek] = useMutation(UPSERT_WORKWEEK);
	const {
		userList,
		projectList,
		setProjectList,
		viewsFilter,
		setSingleProjectPage,
	} = useUserDataContext();
	const router = useRouter();
	const pathname = usePathname();
	const upsertWorkWeekValues = (values: WorkWeekRenderDataType) => {
		upsertWorkweek({
			variables: {
				assignmentId: values.assignmentId,
				cweek: values.cweek,
				year: values.year,
				estHours: values.estimatedHours,
				actHours: values.actualHours,
			},
		});
	};

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

	const handleCurrEstHoursChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		localStorage.setItem("currEstHours", e.target.value);
		const newEstimatedHours = parseInt(e.target.value);
		const selectedCell = JSON.parse(
			localStorage.getItem("selectedCell") || "{}"
		);
		const newWorkWeekData = lookupWorkWeekData(
			selectedCell.rowId,
			selectedCell.year,
			selectedCell.week
		);

		// Find the assignment with the current project's name
		const foundAssignment = usersWithProjectAssignment[
			selectedCell.rowId
		].assignments?.find(
			(assignment: AssignmentType) =>
				assignment.project.name === selectedProject?.name
		);

		// This should never happen, but just in case (and to make the types happy)
		if (!foundAssignment) {
			return;
		}

		if (newWorkWeekData) {
			newWorkWeekData.estimatedHours = newEstimatedHours;
			if (newWorkWeekData.assignmentId == undefined) {
				newWorkWeekData.assignmentId = foundAssignment.id;
			}
			updateDataState(newWorkWeekData, selectedCell.rowId);
		} else {
			const newWorkWeekData = {
				cweek: selectedCell.week,
				year: selectedCell.year,
				estimatedHours: newEstimatedHours,
				actualHours: parseInt(localStorage.getItem("currActHours") || "0"),
				assignmentId: foundAssignment.id,
			};
			updateDataState(newWorkWeekData, selectedCell.rowId);
		}
		setWasSelectedCellEdited(true);
	};

	const handleCurrActHoursChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		localStorage.setItem("currActHours", e.target.value);
		const newActualHours = parseInt(e.target.value);
		const selectedCell = JSON.parse(
			localStorage.getItem("selectedCell") || "{}"
		);
		const newWorkWeekData = lookupWorkWeekData(
			selectedCell.rowId,
			selectedCell.year,
			selectedCell.week
		);

		if (newWorkWeekData) {
			newWorkWeekData.actualHours = newActualHours;
			updateDataState(newWorkWeekData, selectedCell.rowId);
		} else {
			const newWorkWeekData = {
				cweek: selectedCell.week,
				year: selectedCell.year,
				estimatedHours: parseInt(localStorage.getItem("currEstHours") || "0"),
				actualHours: newActualHours,
				assignmentId: rowIdToUserIdMap.get(selectedCell.rowId),
			};
			updateDataState(newWorkWeekData, selectedCell.rowId);
		}
		setWasSelectedCellEdited(true);
	};

	const renderCell = (
		cweek: number,
		year: number,
		rowIndex: number,
		isSelected: boolean
	) => {
		const workWeekData = lookupWorkWeekData(rowIndex, year, cweek);

		const estimatedHours = workWeekData?.estimatedHours || "0";
		const actualHours = workWeekData?.actualHours || "0";

		return (
			<>
				<input
					className="flex flex-row"
					value={
						isSelected
							? localStorage.getItem("currEstHours") ?? estimatedHours
							: estimatedHours
					}
					placeholder="Estimated Hours"
					onChange={(e) => handleCurrEstHoursChange(e)}
				/>
				<input
					className="flex flex-row"
					value={
						isSelected
							? localStorage.getItem("currActHours") ?? actualHours
							: actualHours
					}
					placeholder="Actual Hours"
					onChange={(e) => handleCurrActHoursChange(e)}
				/>
			</>
		);
	};

	const lookupWorkWeekData = (
		rowIndex: number,
		year: number,
		cweek: number
	): WorkWeekRenderDataType | null => {
		if (usersWithProjectAssignment) {
			const foundUser: UserType = usersWithProjectAssignment[rowIndex];
			if (foundUser && foundUser.assignments) {
				const foundAssignment: AssignmentType = foundUser.assignments.find(
					(assignment: AssignmentType) =>
						assignment.project.name === selectedProject?.name
				) as AssignmentType;
				if (
					foundAssignment &&
					foundAssignment.workWeeks &&
					foundAssignment.workWeeks.length > 0
				) {
					const foundWorkWeek: WorkWeekType | undefined = (
						foundAssignment as AssignmentType
					).workWeeks.find(
						(week: WorkWeekType) => week.year === year && week.cweek === cweek
					);
					if (foundWorkWeek) {
						const foundWorkWeekAsWorkWeekType = foundWorkWeek as WorkWeekType;
						return {
							cweek: foundWorkWeekAsWorkWeekType.cweek,
							year: foundWorkWeekAsWorkWeekType.year,
							estimatedHours: foundWorkWeekAsWorkWeekType.estimatedHours ?? 0,
							actualHours: foundWorkWeekAsWorkWeekType.actualHours ?? 0,
							assignmentId: foundAssignment.id,
						};
					}
				}
			}
		}
		return null;
	};

	const handleCellFocus = (week: number, year: number, rowId: number) => {
		console.log(
			"handleCellFocus, week: ",
			week,
			" year: ",
			year,
			" rowId: ",
			rowId
		);
		localStorage.setItem("selectedCell", JSON.stringify({ week, year, rowId }));
		const newWorkWeekData = lookupWorkWeekData(rowId, year, week);
		if (newWorkWeekData) {
			localStorage.setItem(
				"currEstHours",
				newWorkWeekData.estimatedHours.toString()
			);
			localStorage.setItem(
				"currActHours",
				newWorkWeekData.actualHours.toString()
			);
		} else {
			localStorage.setItem("currEstHours", "");
			localStorage.setItem("currActHours", "");
		}
	};

	const handleCellBlur = () => {
		if (wasSelectedCellEdited) {
			const oldWorkWeekData = lookupWorkWeekData(
				JSON.parse(localStorage.getItem("selectedCell") || "{}").rowId,
				JSON.parse(localStorage.getItem("selectedCell") || "{}").year,
				JSON.parse(localStorage.getItem("selectedCell") || "{}").week
			);
			if (oldWorkWeekData) {
				upsertWorkWeekValues(oldWorkWeekData);
				setWasSelectedCellEdited(false);
			}
		}
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

	const handleUserChange = (user: UserType) => {
		user.id && router.push("/people" + "/" + encodeURIComponent(user.id));
	};

	const memoizedLabelContentsLeft = useMemo(() => {
		return usersWithProjectAssignment.map((user: UserType) => {
			return (
				<div className="flex gap-x-4 gap-y-4 items-center justify-center" key={user.id}>
    <div>
        <div className="flex w-16 h-16 timeline-grid-bg rounded-full overflow-hidden">
            <Image
                src={`${user.avatarUrl}`}
                alt="user avatar"
                width={500}
                height={500}
            />
        </div>
    </div>
    <div className="hover:cursor-pointer" onClick={() => handleUserChange(user)}>
        <div>{user.name}</div>
        {user.assignments && user.assignments.map((assignment: AssignmentType) => (
            <div key={assignment.id} className="text-red-500">
                {assignment.status === "active" ? null : "Unconfirmed Assignment"}
            </div>
        ))}
    </div>
</div>
			);
		});
	}, [usersWithProjectAssignment]);
	const onClose = () => setAddAssignmentVisible(false);
	const onComplete = () => {
		setAddAssignmentVisible(false);
	};
	return (
		<div>
			{selectedProject ? (
				<h1 className="flex justify-between items-center">
					<div className="flex items-center">
						<div className="w-16 h-16 timeline-grid-bg rounded-full overflow-hidden mr-4">
							<Image
								src={`${selectedProject.client.avatarUrl}`}
								alt="client avatar"
								width={500}
								height={500}
							/>
						</div>
						<span>{selectedProject.name}</span>
					</div>
					<ProjectSummary project={selectedProject} />
				</h1>
			) : (
				""
			)}

			{usersWithProjectAssignment ? (
				<WeekDisplay
					labelContentsLeft={memoizedLabelContentsLeft}
					labelContentsRight={usersWithProjectAssignment.map((user) =>
						user.assignments?.map((assignment: AssignmentType) => (
							<div
								key={assignment.id}
								className="flex gap-x-4 gap-y-4 items-center justify-center"
							>
								<UserSummary assignment={assignment} />
							</div>
						))
					)}
					renderCell={renderCell}
					onCellFocus={handleCellFocus}
					onCellBlur={handleCellBlur}
				/>
			) : (
				<LoadingSpinner />
			)}
			<div>
				{selectedProject ? (
					<ProjectDetails
						project={selectedProject}
						projectList={projectList}
						setProjectList={setProjectList}
					/>
				) : (
					<></>
				)}
			</div>
			<div>
				<button
					className="bg-white border-2 border-accentgreen w-8 h-8 ml-2 rounded-full flex justify-center items-center"
					onClick={() => setAddAssignmentVisible(true)}
				>
					<PlusIcon className="fill-accentgreen" />
				</button>
				{addAssignmentVisible && (
					<AddAssignmentSingleProject
						project={selectedProject}
						onClose={onClose}
						onComplete={onComplete}
					/>
				)}
			</div>
		</div>
	);
};

export default withApollo(ProjectPage);
