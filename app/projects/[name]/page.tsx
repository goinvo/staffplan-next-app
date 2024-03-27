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
import WeekDisplay, { selectedCell } from "../../components/weekDisplay";
import { LoadingSpinner } from "@/app/components/loadingSpinner";
import { SVGAlphabet } from "@/app/svgAlphabet";
import { useUserDataContext } from "@/app/userDataContext";
import ProjectDetails from "@/app/components/projectDetails";

const ProjectPage: React.FC = () => {
	const params = useParams();
	const [clientSide, setClientSide] = useState(false);
	const [selectedProject, setSelectedProject] = useState<ProjectType | null>(
		null
	);
	const [selectedCell, setSelectedCell] = useState<selectedCell>({
		week: 0,
		year: 0,
		rowId: 0,
	});
	const [workWeekDataLookupMap, setWorkWeekDataLookupMap] = useState<
		Map<number, Map<number, WorkWeekRenderDataType>>[]
	>([]);
	const [currEstHours, setCurrEstHours] = useState<string>("0");
	const [currActHours, setCurrActHours] = useState<string>("0");
	const [wasSelectedCellEdited, setWasSelectedCellEdited] =
		useState<boolean>(false);
	const [rowIdToUserIdMap, setRowIdToUserIdMap] = useState<Map<number, number>>(
		new Map()
	);
	const [usersWithProjectAssignment, setUsersWithProjectAssignment] = useState<
		UserType[]
	>([]);

	const [upsertWorkweek] = useMutation(UPSERT_WORKWEEK);
	const { userList, projectList, setProjectList } = useUserDataContext();
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

	const addWorkWeekDataToLookupMap = (
		workWeekData: WorkWeekRenderDataType,
		rowId: number
	) => {
		if (rowId !== undefined) {
			if (!workWeekDataLookupMap[rowId]) {
				workWeekDataLookupMap[rowId] = new Map();
			}
			if (!workWeekDataLookupMap[rowId]?.has(workWeekData.year)) {
				workWeekDataLookupMap[rowId]?.set(workWeekData.year, new Map());
			}
			workWeekDataLookupMap[rowId]
				.get(workWeekData.year)
				?.set(workWeekData.cweek, workWeekData);
		} else {
			console.log("Error: Could not add work week data to lookup map");
		}
	};

	const handleCurrEstHoursChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setCurrEstHours(e.target.value);
		const newEstimatedHours = parseInt(e.target.value);
		const newWorkWeekData = lookupWorkWeekData(
			selectedCell.rowId,
			selectedCell.year,
			selectedCell.week
		);
		console.log("usersWithProjectAssignment", usersWithProjectAssignment);

		if (newWorkWeekData) {
			newWorkWeekData.estimatedHours = newEstimatedHours;
			addWorkWeekDataToLookupMap(newWorkWeekData, selectedCell.rowId);
		} else {
			const newWorkWeekData = {
				cweek: selectedCell.week,
				year: selectedCell.year,
				estimatedHours: newEstimatedHours,
				actualHours: parseInt(currActHours),
				assignmentId: rowIdToUserIdMap.get(selectedCell.rowId),
			};
			addWorkWeekDataToLookupMap(newWorkWeekData, selectedCell.rowId);
		}
		setWasSelectedCellEdited(true);
	};

	const handleCurrActHoursChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setCurrActHours(e.target.value);
		const newActualHours = parseInt(e.target.value);
		const newWorkWeekData = lookupWorkWeekData(
			selectedCell.rowId,
			selectedCell.year,
			selectedCell.week
		);
		console.log("usersWithProjectAssignment", usersWithProjectAssignment);

		if (newWorkWeekData) {
			newWorkWeekData.actualHours = newActualHours;
			addWorkWeekDataToLookupMap(newWorkWeekData, selectedCell.rowId);
		} else {
			const newWorkWeekData = {
				cweek: selectedCell.week,
				year: selectedCell.year,
				estimatedHours: parseInt(currEstHours),
				actualHours: newActualHours,
				assignmentId: rowIdToUserIdMap.get(selectedCell.rowId),
			};
			addWorkWeekDataToLookupMap(newWorkWeekData, selectedCell.rowId);
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
		if (
			workWeekData &&
			(workWeekData.estimatedHours || workWeekData.actualHours)
		) {
			if (isSelected) {
				return (
					<>
						<div className="flex flex-row">Est:</div>
						<input
							className="flex flex-row"
							value={currEstHours || ""}
							onChange={(e) => handleCurrEstHoursChange(e)}
						></input>
						<div className="flex flex-row">Act:</div>
						<input
							className="flex flex-row"
							value={currActHours || ""}
							onChange={(e) => handleCurrActHoursChange(e)}
						></input>
					</>
				);
			} else {
				return (
					<>
						<div className="flex flex-row">Est:</div>
						<div className="flex flex-row">
							{workWeekData.estimatedHours || "0"}
						</div>
						<div className="flex flex-row">Act:</div>
						<div className="flex flex-row">
							{workWeekData.actualHours || "0"}
						</div>
					</>
				);
			}
		}
		if (isSelected) {
			return (
				<>
					<div className="flex flex-row">Est:</div>
					<input
						className="flex flex-row"
						value={currEstHours || ""}
						onChange={(e) => handleCurrEstHoursChange(e)}
					></input>
					<div className="flex flex-row">Act:</div>
					<input
						className="flex flex-row"
						value={currActHours || ""}
						onChange={(e) => handleCurrActHoursChange(e)}
					></input>
				</>
			);
		} else {
			return <></>;
		}
	};

	const lookupWorkWeekData = (
		rowIndex: number,
		year: number,
		cweek: number
	): WorkWeekRenderDataType | null => {
		if (usersWithProjectAssignment) {
			const foundUser: UserType = usersWithProjectAssignment[rowIndex];
			if (foundUser.assignments && foundUser.assignments.length > 0) {
				const foundAssignment = foundUser.assignments.find(
					(assignment: AssignmentType) =>
						assignment.project.name === selectedProject?.name
				);
				if (foundAssignment && foundAssignment.workWeeks.length > 0) {
					const foundWorkWeekData: WorkWeekRenderDataType | undefined =
						foundAssignment.workWeeks.find(
							(workWeek: WorkWeekType) =>
								workWeek.year === year && workWeek.cweek === cweek
						);
					if (foundWorkWeekData) {
						return foundWorkWeekData;
					}
				}
			}
		}
		return null;
	};

	const handleOnMouseOverWeek = (week: number, year: number, rowId: number) => {
		if (wasSelectedCellEdited) {
			const oldWorkWeekData = lookupWorkWeekData(
				selectedCell.rowId,
				selectedCell.year,
				selectedCell.week
			);
			if (oldWorkWeekData) {
				upsertWorkWeekValues(oldWorkWeekData);
				setWasSelectedCellEdited(false);
			}
		}
		setSelectedCell({ week, year, rowId });
		const newWorkWeekData = lookupWorkWeekData(
			selectedCell.rowId,
			selectedCell.year,
			selectedCell.week
		);
		if (newWorkWeekData) {
			setCurrEstHours(newWorkWeekData.estimatedHours.toString());
			setCurrActHours(newWorkWeekData.actualHours.toString());
		} else {
			setCurrEstHours("0");
			setCurrActHours("0");
		}
	};

	useEffect(() => {
		setClientSide(true);
	}, []);

	useEffect(() => {
		if (projectList) {
			console.log("projectList", projectList);
			console.log("name", decodeURIComponent(params.name.toString()));

			const foundProject = projectList.find(
				(project: ProjectType) =>
					project.name === decodeURIComponent(params.name.toString())
			);
			if (foundProject) {
				setSelectedProject(foundProject);
			}

			console.log("userList", userList);
			if (!userList) return;

			const newUsersWithProjectAssignment = userList.map((user: UserType) => {
				const filteredAssignments =
					user.assignments?.reduce(
						(acc: AssignmentType[], assignment: AssignmentType) => {
							if (
								assignment.project.name ===
								decodeURIComponent(params.name.toString())
							) {
								acc.push(assignment);
							}
							return acc;
						},
						[]
					) || [];
				return {
					...user,
					assignments: filteredAssignments,
				};
			});

			setUsersWithProjectAssignment(newUsersWithProjectAssignment);

			console.log("usersWithProjectAssignment", newUsersWithProjectAssignment);
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
				addWorkWeekDataToLookupMap(week, index);
			});

			if (selectedProject.workWeeks && selectedProject.workWeeks[index]?.user) {
				const userId = selectedProject.workWeeks[index].user?.id;
				if (userId !== undefined) {
					rowIdToUserIdMap.set(index, userId);
				}
			}
		});

		console.log("workWeekDataLookupMap", workWeekDataLookupMap);
	}, [selectedProject, projectList]);

	const handleUserChange = (user: UserType) => {
		router.push(pathname + "/" + encodeURIComponent(user.name.toString()));
	};

	const memoizedLabelContents = useMemo(() => {
		return usersWithProjectAssignment.map((user: UserType) => {
			const memoizedSVGAlphabet = (
				<div className="flex w-16 h-16 timeline-grid-bg rounded-full overflow-hidden">
					<SVGAlphabet name={user.name} />
				</div>
			);

			return (
				<div
					className="flex gap-x-4 gap-y-4 items-center justify-center"
					key={user.id}
				>
					<div onClick={() => handleUserChange(user)}>
						{memoizedSVGAlphabet}
					</div>
					<div className="flex">{user.name}</div>
				</div>
			);
		});
	}, [usersWithProjectAssignment]);

	return (
		<div>
			<h1>Assignments for {selectedProject?.name}</h1>
			{usersWithProjectAssignment ? (
				<WeekDisplay
					labelContents={memoizedLabelContents}
					onMouseOverWeek={(week, year, rowId) => {
						handleOnMouseOverWeek(week, year, rowId);
					}}
					renderCell={renderCell}
					selectedCell={selectedCell}
				/>
			) : (
				<LoadingSpinner />
			)}
			<div>
				{selectedProject ? <ProjectDetails project={selectedProject} projectList={projectList} setProjectList={setProjectList}/> : <></>}
			</div>
		</div>
	);
};

export default withApollo(ProjectPage);
